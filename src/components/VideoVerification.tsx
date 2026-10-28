import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

interface Props {
  video: { status: string; reason: string; date: string } | null;
  onChanged: () => void;
}

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const DURATION = 6;

type Phase = 'idle' | 'preparing' | 'ready' | 'recording' | 'sending' | 'failed';

const pickMime = () => {
  const list = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  return list.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || '';
};

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Не удалось прочитать видео'));
    r.readAsDataURL(blob);
  });

const VideoVerification: React.FC<Props> = ({ video, onChanged }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [hint, setHint] = useState('');
  const [left, setLeft] = useState(DURATION);
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const timerRef = useRef<number>(0);
  const stats = useRef<{ total: number; bad: number; counts: Record<string, number> }>({ total: 0, bad: 0, counts: {} });
  const recording = useRef(false);

  const stopCamera = () => {
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => stopCamera, []);

  useEffect(() => {
    if (phase === 'idle' || phase === 'failed') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const checkFrame = (): string => {
    const v = videoRef.current;
    const detector = detectorRef.current;
    if (!v || !v.videoWidth) return 'Камера загружается';

    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(v, 0, 0, 32, 32);
      const px = ctx.getImageData(0, 0, 32, 32).data;
      let sum = 0;
      for (let i = 0; i < px.length; i += 4) sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      const avg = sum / (px.length / 4);
      if (avg < 60) return 'Слишком темно, включите свет';
      if (avg > 225) return 'Слишком светло, уберите яркий свет за спиной';
    }

    if (!detector) return '';
    const res = detector.detectForVideo(v, performance.now());
    const faces = res.detections || [];
    if (faces.length === 0) return 'Лицо не видно в кадре';
    if (faces.length > 1) return 'В кадре несколько лиц';

    const f = faces[0];
    const box = f.boundingBox;
    const w = box.width / v.videoWidth;
    const cx = (box.originX + box.width / 2) / v.videoWidth;
    const cy = (box.originY + box.height / 2) / v.videoHeight;
    if ((f.categories?.[0]?.score ?? 1) < 0.6) return 'Лицо плохо различимо, уберите всё лишнее с лица';
    if (w < 0.22) return 'Подойдите ближе к камере';
    if (w > 0.62) return 'Отодвиньтесь от камеры';
    if (Math.abs(cx - 0.5) > 0.14 || Math.abs(cy - 0.45) > 0.16) return 'Расположите лицо по центру рамки';

    const k = f.keypoints || [];
    if (k.length >= 3) {
      const eyeDist = Math.abs(k[0].x - k[1].x);
      const mid = (k[0].x + k[1].x) / 2;
      if (eyeDist > 0 && Math.abs(k[2].x - mid) / eyeDist > 0.5) return 'Смотрите прямо в камеру';
    }
    return '';
  };

  const startCamera = async () => {
    setError('');
    setIssues([]);
    setPhase('preparing');
    try {
      const c = await callCabinet({ action: 'video_code' });
      setCode(c.code);
    } catch {
      setError('Не удалось получить код. Проверьте интернет и попробуйте снова.');
      setPhase('failed');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError('Нет доступа к камере. Разрешите камеру в настройках браузера и попробуйте снова.');
      setPhase('failed');
      return;
    }

    try {
      if (!detectorRef.current) {
        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const fileset = await FilesetResolver.forVisionTasks(WASM);
        detectorRef.current = await FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL },
          runningMode: 'VIDEO',
        });
      }
    } catch {
      detectorRef.current = null;
    }

    setPhase('ready');
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const h = checkFrame();
      setHint(h);
      if (recording.current) {
        stats.current.total += 1;
        if (h) {
          stats.current.bad += 1;
          stats.current.counts[h] = (stats.current.counts[h] || 0) + 1;
        }
      }
    }, 300);
  };

  const record = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const mime = pickMime();
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 600000 } : undefined);
    stats.current = { total: 0, bad: 0, counts: {} };
    recording.current = true;
    setPhase('recording');
    setLeft(DURATION);

    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    rec.onstop = async () => {
      recording.current = false;
      window.clearInterval(countdown);
      const { total, bad, counts } = stats.current;
      const found = Object.entries(counts).filter(([, n]) => total > 0 && n / total > 0.2).map(([t]) => t);
      const ok = detectorRef.current ? total > 0 && bad / total <= 0.2 : true;

      if (!ok) {
        setIssues(found.length ? found : ['Лицо не было чётко видно на записи']);
        setPhase('ready');
        return;
      }

      setPhase('sending');
      try {
        const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
        const data = await toBase64(blob);
        await callCabinet({
          action: 'upload_video',
          data,
          mime: rec.mimeType || 'video/webm',
          autoOk: true,
          autoIssues: detectorRef.current ? '' : 'Автопроверка лица не запускалась',
        });
        stopCamera();
        setPhase('idle');
        onChanged();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось отправить видео');
        setPhase('ready');
      }
    };

    rec.start();
    let sec = DURATION;
    const countdown = window.setInterval(() => {
      sec -= 1;
      setLeft(sec);
      if (sec <= 0) rec.stop();
    }, 1000);
  };

  const cancel = () => {
    stopCamera();
    setPhase('idle');
    setHint('');
    setIssues([]);
  };

  const active = phase !== 'idle' && phase !== 'failed';

  if (!active && video?.status === 'approved') return null;

  if (!active && video?.status === 'pending') {
    return (
      <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
        <CardContent className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-micro-blue flex items-center justify-center">
            <Icon name="Video" size={24} />
          </div>
          <div>
            <p className="font-semibold text-micro-dark">Видео на проверке у оператора</p>
            <p className="text-sm text-gray-600">Отправлено {video.date}. Мы сообщим о результате.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const frameBad = phase === 'recording' && !!hint;

  return (
    <>
    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Icon name="ScanFace" fallback="Video" size={24} />
          </div>
          <div>
            <p className="font-semibold text-micro-dark">Видеоидентификация</p>
            <p className="text-sm text-gray-600">Запишите короткое видео лица и назовите код, это займёт {DURATION} секунд</p>
          </div>
        </div>

        {video?.status === 'rejected' && !active && (
          <p className="text-sm rounded-xl bg-red-50 text-micro-green p-3">
            Оператор не принял видео{video.reason ? `: ${video.reason}` : ''}. Запишите его заново.
          </p>
        )}

        {error && <p className="text-sm text-micro-green">{error}</p>}

        {!active && (
          <Button onClick={startCamera} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-[#5A3DCC] text-white text-base">
            <Icon name="Camera" size={18} className="mr-2" />
            {video?.status === 'rejected' ? 'Записать заново' : 'Пройти видеоидентификацию'}
          </Button>
        )}
      </CardContent>
    </Card>
      {active && (
        <div className="fixed inset-0 z-[100] bg-black">
          <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 38% 32% at 50% 42%, transparent 96%, rgba(0,0,0,0.65) 100%)' }} />
          <div className={`absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[72vw] max-w-[360px] aspect-[3/4] max-h-[52vh] rounded-[50%] border-4 pointer-events-none transition-colors ${phase === 'recording' ? (frameBad ? 'border-red-500' : 'border-emerald-400') : 'border-white/80'}`} />

          <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent">
            <div className="text-white">
              <p className="text-xs text-white/70">Назовите вслух код</p>
              <p className="text-4xl font-bold tracking-[0.3em]">{code}</p>
            </div>
            <div className="flex items-center gap-2">
              {phase === 'recording' && (
                <div className="flex items-center gap-2 rounded-full bg-black/60 text-white text-sm px-3 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  {left} с
                </div>
              )}
              {phase !== 'sending' && phase !== 'recording' && (
                <button onClick={cancel} aria-label="Закрыть" className="w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <Icon name="X" size={22} />
                </button>
              )}
            </div>
          </div>

          {phase === 'preparing' && <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">Запускаем камеру...</div>}
          {phase === 'sending' && <div className="absolute inset-0 flex items-center justify-center text-white bg-black/70">Отправляем оператору...</div>}

          <div className="absolute bottom-0 inset-x-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent space-y-3">
            {(phase === 'ready' || phase === 'recording') && (
              <p className={`text-center text-base font-semibold ${hint ? 'text-red-300' : 'text-emerald-300'}`}>
                {hint || (phase === 'recording' ? 'Отлично, продолжайте' : 'Лицо в рамке, можно начинать')}
              </p>
            )}
            {phase === 'ready' && !issues.length && (
              <p className="text-center text-sm text-white/80">Нажмите «Начать запись» и чётко произнесите код {code}</p>
            )}
            {issues.length > 0 && phase === 'ready' && (
              <div className="rounded-xl bg-red-600/90 p-3 text-sm text-white space-y-1 max-w-md mx-auto">
                <p className="font-semibold">Видео не отправлено. Что исправить:</p>
                {issues.map((i) => <p key={i}>• {i}</p>)}
              </div>
            )}
            {phase === 'ready' && (
              <Button onClick={record} className="w-full max-w-md mx-auto flex h-14 rounded-2xl bg-micro-blue hover:bg-[#5A3DCC] text-white text-lg">
                <Icon name="Video" size={20} className="mr-2" />
                {issues.length ? 'Записать заново' : 'Начать запись'}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VideoVerification;
