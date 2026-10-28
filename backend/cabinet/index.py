import base64
import io
import json
import os
import re
import secrets
import boto3
import psycopg2
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p13899255_micro5_website_proje')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


DAILY_RATE = 0.0008
EXTEND_DAYS = 7
MAX_EXTENDS = 3
DOC_KINDS = ('passport', 'selfie')


def s3_client():
    return boto3.client('s3', endpoint_url='https://bucket.poehali.dev', aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'], aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])


def cdn_url(key):
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def notify(cur, cid, text):
    cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({int(cid)}, {esc(text)})")


COMPANY = 'ООО «Частный займ»'
BLUE = (0.10, 0.20, 0.62)


def draw_stamp(c, cx, cy, signed_text):
    import math
    c.saveState()
    c.setStrokeColorRGB(*BLUE)
    c.setFillColorRGB(*BLUE)
    c.setLineWidth(1.6)
    c.circle(cx, cy, 52, stroke=1, fill=0)
    c.setLineWidth(0.8)
    c.circle(cx, cy, 47, stroke=1, fill=0)
    c.circle(cx, cy, 27, stroke=1, fill=0)

    def arc_text(text, radius, top):
        c.setFont('DVB', 8)
        n = len(text)
        span = min(math.radians(18) * n, math.radians(200))
        step = span / max(n - 1, 1)
        for i, ch in enumerate(text):
            if top:
                ang = math.pi / 2 + span / 2 - i * step
                x, y = cx + radius * math.cos(ang), cy + radius * math.sin(ang)
                rot = math.degrees(ang) - 90
            else:
                ang = 3 * math.pi / 2 - span / 2 + i * step
                x, y = cx + radius * math.cos(ang), cy + radius * math.sin(ang)
                rot = math.degrees(ang) + 90
            c.saveState()
            c.translate(x, y)
            c.rotate(rot)
            c.drawCentredString(0, 0, ch)
            c.restoreState()

    arc_text('ООО «ЧАСТНЫЙ ЗАЙМ»', 37, True)
    arc_text('ДОГОВОР ЗАЙМА', 37, False)
    c.setFont('DVB', 9)
    c.drawCentredString(cx, cy + 2, 'ДЛЯ')
    c.drawCentredString(cx, cy - 8, 'ДОГОВОРОВ')
    c.restoreState()


def draw_scribble(c, x, y, color=BLUE):
    c.saveState()
    c.setStrokeColorRGB(*color)
    c.setLineWidth(1.4)
    p = c.beginPath()
    p.moveTo(x, y)
    p.curveTo(x + 10, y + 26, x + 18, y - 8, x + 28, y + 16)
    p.curveTo(x + 36, y + 30, x + 40, y - 6, x + 52, y + 12)
    p.curveTo(x + 62, y + 24, x + 70, y + 2, x + 84, y + 10)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def build_contract(loan, prof):
    from reportlab.lib.utils import simpleSplit
    base = os.path.dirname(__file__)
    pdfmetrics.registerFont(TTFont('DV', os.path.join(base, 'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('DVB', os.path.join(base, 'DejaVuSans-Bold.ttf')))
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    left, right = 50, w - 50
    state = {'y': h - 55}

    def money(n):
        return f"{int(n):,} ₽".replace(',', ' ')

    def need(space):
        if state['y'] - space < 60:
            c.showPage()
            state['y'] = h - 55

    def heading(text):
        need(40)
        c.setFont('DVB', 12)
        c.setFillColorRGB(*BLUE)
        c.drawString(left, state['y'], text)
        c.setFillColorRGB(0, 0, 0)
        state['y'] -= 6
        c.setStrokeColorRGB(*BLUE)
        c.setLineWidth(0.6)
        c.line(left, state['y'], right, state['y'])
        state['y'] -= 16

    def row(label, value):
        need(20)
        c.setFont('DV', 9.5)
        c.setFillColorRGB(0.35, 0.35, 0.35)
        c.drawString(left, state['y'], label)
        c.setFillColorRGB(0, 0, 0)
        c.setFont('DVB', 9.5)
        lines = simpleSplit(str(value or '—'), 'DVB', 9.5, right - 230)
        for i, ln in enumerate(lines):
            c.drawString(230, state['y'] - i * 12, ln)
        state['y'] -= 15 + (len(lines) - 1) * 12

    def para(text):
        c.setFont('DV', 9.5)
        for ln in simpleSplit(text, 'DV', 9.5, right - left):
            need(14)
            c.setFont('DV', 9.5)
            c.drawString(left, state['y'], ln)
            state['y'] -= 13
        state['y'] -= 3

    c.setFont('DVB', 17)
    c.drawString(left, state['y'], f"Договор займа № {loan['num']}")
    state['y'] -= 18
    c.setFont('DV', 9.5)
    c.setFillColorRGB(0.35, 0.35, 0.35)
    c.drawString(left, state['y'], f"Дата заключения: {loan['issuedAt']}    Статус: {loan['statusText']}")
    c.setFillColorRGB(0, 0, 0)
    state['y'] -= 26

    heading('Стороны договора')
    row('Займодавец', COMPANY)
    row('Заёмщик', prof['fullName'])
    row('Дата рождения', prof['birthDate'])
    row('Телефон', '+7' + prof['phone'] if prof['phone'] else '')
    row('Email', prof['email'])
    row('Паспорт', f"{prof['passportSeries']} {prof['passportNumber']}".strip())
    row('Дата выдачи паспорта', prof['passportDate'])
    row('Кем выдан', prof['passportIssuer'])
    row('Адрес', prof['address'])
    state['y'] -= 6

    heading('Условия займа')
    row('Сумма займа', money(loan['amount']))
    row('Срок займа', f"{loan['days']} дн.")
    row('Процентная ставка', '0% (акция для первого займа)' if loan['returnAmount'] == loan['amount'] else '0.08% в день')
    row('Начисленные проценты', money(loan['returnAmount'] - loan['amount']))
    row('Сумма к возврату', money(loan['returnAmount']))
    row('Дата выдачи займа', loan['paidOutAt'] or 'после подписания договора')
    row('Срок возврата', loan['dueDate'])
    row('Продлений', f"{loan['extendedCount']} из {MAX_EXTENDS}")
    row('Способ выдачи', f"На карту •••• {prof['cardLast4']} ({prof['cardBank']})" if prof['cardLast4'] else 'На банковскую карту заёмщика')
    state['y'] -= 6

    if loan['payments']:
        heading('Платежи по займу')
        for pay in loan['payments']:
            row(pay['date'], f"{pay['note']}: {money(pay['amount'])}")
        state['y'] -= 6

    heading('Основные положения')
    para('1. Займодавец перечисляет сумму займа на банковскую карту заёмщика после подписания договора.')
    para('2. Заёмщик возвращает сумму займа и начисленные проценты не позднее срока возврата, указанного в договоре.')
    para('3. Срок возврата может быть продлён по заявлению заёмщика в личном кабинете с оплатой процентов за дополнительные дни.')
    para('4. Заёмщик подтверждает, что указанные им персональные данные верны, и соглашается на их обработку для исполнения договора.')
    para('5. Договор подписывается простой электронной подписью заёмщика и имеет силу собственноручной подписи.')
    state['y'] -= 8

    need(150)
    heading('Подписи сторон')
    top = state['y']
    c.setFont('DVB', 10)
    c.drawString(left, top, 'Займодавец')
    c.setFont('DV', 9.5)
    c.drawString(left, top - 15, COMPANY)
    draw_stamp(c, left + 62, top - 88, '')
    draw_scribble(c, left + 10, top - 78)
    c.setStrokeColorRGB(0, 0, 0)
    c.setLineWidth(0.5)
    c.line(left, top - 100, left + 150, top - 100)
    c.setFont('DV', 8)
    c.drawString(left, top - 112, 'Подпись представителя, М.П.')

    x2 = left + 280
    c.setFont('DVB', 10)
    c.drawString(x2, top, 'Заёмщик')
    c.setFont('DV', 9.5)
    c.drawString(x2, top - 15, prof['fullName'] or '—')
    if loan['signedAt']:
        c.setFillColorRGB(0.92, 0.97, 0.93)
        c.setStrokeColorRGB(0.1, 0.55, 0.3)
        c.roundRect(x2, top - 85, 205, 56, 6, stroke=1, fill=1)
        c.setFillColorRGB(0.05, 0.4, 0.2)
        c.setFont('DVB', 9)
        c.drawString(x2 + 10, top - 45, 'Подписано электронной подписью')
        c.setFont('DV', 8.5)
        c.drawString(x2 + 10, top - 58, loan['signedAt'])
        c.drawString(x2 + 10, top - 70, f"Тел. +7{prof['phone']}")
        c.setFillColorRGB(0, 0, 0)
        draw_scribble(c, x2 + 110, top - 72, (0.1, 0.25, 0.55))
    else:
        c.setFont('DV', 9)
        c.setFillColorRGB(0.7, 0.2, 0.2)
        c.drawString(x2, top - 55, 'Ожидает подписи заёмщика')
        c.setFillColorRGB(0, 0, 0)
    c.setStrokeColorRGB(0, 0, 0)
    c.setLineWidth(0.5)
    c.line(x2, top - 100, x2 + 205, top - 100)
    c.setFont('DV', 8)
    c.drawString(x2, top - 112, 'Подпись заёмщика')

    c.showPage()
    c.save()
    return buf.getvalue()


def loan_row_to_dict(r):
    return {'id': f'LOAN-{r[0]:03d}', 'dbId': r[0], 'amount': r[1], 'returnAmount': r[2], 'dueDate': str(r[3]), 'status': r[4], 'issuedAt': str(r[5]), 'days': r[6], 'daysLeft': r[7] if r[4] not in ('awaiting_sign', 'signed') else r[6], 'signedAt': str(r[8])[:16] if r[8] else '', 'paidOutAt': str(r[9])[:16] if r[9] else '', 'extendedCount': r[10], 'canExtend': r[4] == 'active' and r[10] < MAX_EXTENDS}


def resp(code, data):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def esc(v):
    return "'" + str(v if v is not None else '').replace("'", "''") + "'"


def norm_phone(p):
    d = re.sub(r'\D', '', p or '')
    if len(d) == 11 and d[0] in '78':
        d = d[1:]
    return d if len(d) == 10 else ''


def get_client(cur, token):
    if not token:
        return None
    cur.execute(f"SELECT c.id, c.phone FROM {SCHEMA}.sessions s JOIN {SCHEMA}.clients c ON c.id = s.client_id WHERE s.token = {esc(token)} AND s.expires_at > NOW()")
    return cur.fetchone()


def profile(cur, cid):
    cur.execute(f"SELECT phone, full_name, email, birth_date, passport_series, passport_number, passport_date, passport_issuer, address, income, employment, card_last4, card_bank, docs_verified FROM {SCHEMA}.clients WHERE id = {int(cid)}")
    r = cur.fetchone()
    keys = ['phone', 'fullName', 'email', 'birthDate', 'passportSeries', 'passportNumber', 'passportDate', 'passportIssuer', 'address', 'income', 'employment', 'cardLast4', 'cardBank', 'docsVerified']
    return dict(zip(keys, r))


def handler(event: dict, context) -> dict:
    """Личный кабинет клиента: вход по телефону, займы, договоры, заявки и анкета из базы данных."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token', '')
    body = json.loads(event.get('body') or '{}') if event.get('httpMethod') == 'POST' else {}
    action = body.get('action') or (event.get('queryStringParameters') or {}).get('action', 'me')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    if action == 'login':
        phone = norm_phone(body.get('phone'))
        if not phone:
            return resp(400, {'error': 'Неверный номер телефона'})
        cur.execute(f"SELECT id FROM {SCHEMA}.clients WHERE phone = {esc(phone)}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Клиент с таким номером не найден. Сначала оформите заявку.'})
        new_token = secrets.token_hex(32)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (token, client_id) VALUES ({esc(new_token)}, {row[0]})")
        return resp(200, {'token': new_token, 'phone': phone})

    if action == 'apply':
        phone = norm_phone(body.get('phone'))
        if not phone:
            return resp(400, {'error': 'Неверный номер телефона'})
        card = re.sub(r'\D', '', body.get('cardNumber') or '')[-4:]
        cur.execute(f"""INSERT INTO {SCHEMA}.clients (phone, full_name, email, birth_date, passport_series, passport_number, passport_date, passport_issuer, address, income, employment, card_last4, card_bank)
            VALUES ({esc(phone)}, {esc(body.get('fullName'))}, {esc(body.get('email'))}, {esc(body.get('birthDate'))}, {esc(body.get('passportSeries'))}, {esc(body.get('passportNumber'))}, {esc(body.get('passportDate'))}, {esc(body.get('passportIssuer'))}, {esc(body.get('address'))}, {esc(body.get('income'))}, {esc(body.get('employment'))}, {esc(card)}, {esc(body.get('cardBank'))})
            ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, birth_date = EXCLUDED.birth_date, passport_series = EXCLUDED.passport_series, passport_number = EXCLUDED.passport_number, passport_date = EXCLUDED.passport_date, passport_issuer = EXCLUDED.passport_issuer, address = EXCLUDED.address, income = EXCLUDED.income, employment = EXCLUDED.employment, card_last4 = EXCLUDED.card_last4, card_bank = EXCLUDED.card_bank, updated_at = NOW()
            RETURNING id""")
        cid = cur.fetchone()[0]
        amount = int(body.get('loanAmount') or 0)
        days = int(body.get('loanDays') or 0)
        cur.execute(f"INSERT INTO {SCHEMA}.applications (client_id, amount, days) VALUES ({cid}, {amount}, {days}) RETURNING id")
        app_id = cur.fetchone()[0]
        return resp(200, {'success': True, 'applicationId': app_id})

    client = get_client(cur, token)
    if not client:
        return resp(401, {'error': 'Нужно войти в личный кабинет'})
    cid = client[0]

    if action == 'logout':
        cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE token = {esc(token)}")
        return resp(200, {'success': True})

    if action == 'update_profile':
        fields = {'fullName': 'full_name', 'email': 'email', 'birthDate': 'birth_date', 'address': 'address', 'income': 'income', 'employment': 'employment'}
        sets = [f"{col} = {esc(body[key])}" for key, col in fields.items() if key in body]
        if sets:
            cur.execute(f"UPDATE {SCHEMA}.clients SET {', '.join(sets)}, updated_at = NOW() WHERE id = {cid}")
        return resp(200, {'profile': profile(cur, cid)})

    if action == 'sign_code':
        loan_id = int(body.get('loanId') or 0)
        cur.execute(f"SELECT status FROM {SCHEMA}.loans WHERE id = {loan_id} AND client_id = {cid}")
        row = cur.fetchone()
        if not row or row[0] != 'awaiting_sign':
            return resp(400, {'error': 'Договор сейчас нельзя подписать'})
        code = ''.join(secrets.choice('0123456789') for _ in range(6))
        cur.execute(f"INSERT INTO {SCHEMA}.sign_codes (client_id, loan_id, code) VALUES ({cid}, {loan_id}, {esc(code)})")
        notify(cur, cid, f"Код подписи договора: {code}. Никому его не сообщайте.")
        return resp(200, {'code': code})

    if action == 'sign':
        loan_id = int(body.get('loanId') or 0)
        entered = str(body.get('code', '')).strip()
        cur.execute(f"SELECT status FROM {SCHEMA}.loans WHERE id = {loan_id} AND client_id = {cid}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Займ не найден'})
        if row[0] != 'awaiting_sign':
            return resp(400, {'error': 'Договор уже подписан'})
        cur.execute(f"SELECT code FROM {SCHEMA}.sign_codes WHERE loan_id = {loan_id} AND client_id = {cid} AND created_at > NOW() - INTERVAL '10 minutes' ORDER BY id DESC LIMIT 1")
        c = cur.fetchone()
        if not c or not entered or c[0] != entered:
            return resp(400, {'error': 'Неверный код подписи. Запросите новый код.'})
        cur.execute(f"UPDATE {SCHEMA}.loans SET status = 'signed', signed_at = NOW() WHERE id = {loan_id}")
        cur.execute(f"DELETE FROM {SCHEMA}.sign_codes WHERE loan_id = {loan_id}")
        notify(cur, cid, 'Договор подписан и отправлен на проверку. Обычно это занимает несколько минут.')
        return resp(200, {'success': True})

    if action in ('repay', 'extend'):
        loan_id = int(body.get('loanId') or 0)
        cur.execute(f"SELECT status, amount, return_amount, extended_count, due_date FROM {SCHEMA}.loans WHERE id = {loan_id} AND client_id = {cid}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Займ не найден'})
        if row[0] not in ('active', 'overdue'):
            return resp(400, {'error': 'По этому займу платёж сейчас невозможен'})
        if action == 'repay':
            cur.execute(f"UPDATE {SCHEMA}.loans SET status = 'paid' WHERE id = {loan_id}")
            cur.execute(f"INSERT INTO {SCHEMA}.payments (loan_id, client_id, kind, amount, note) VALUES ({loan_id}, {cid}, 'repay', {row[2]}, 'Полное погашение займа')")
            notify(cur, cid, f"Займ погашен: {row[2]:,} ₽. Спасибо!".replace(',', ' '))
            return resp(200, {'success': True, 'amount': row[2]})
        if row[3] >= MAX_EXTENDS:
            return resp(400, {'error': f'Продлевать можно не более {MAX_EXTENDS} раз'})
        fee = round(row[1] * DAILY_RATE * EXTEND_DAYS)
        cur.execute(f"UPDATE {SCHEMA}.loans SET due_date = due_date + {EXTEND_DAYS}, extended_count = extended_count + 1, status = 'active' WHERE id = {loan_id}")
        cur.execute(f"INSERT INTO {SCHEMA}.payments (loan_id, client_id, kind, amount, note) VALUES ({loan_id}, {cid}, 'extend', {fee}, 'Продление на {EXTEND_DAYS} дн.')")
        notify(cur, cid, f"Срок займа продлён на {EXTEND_DAYS} дн. Оплачено {fee:,} ₽.".replace(',', ' '))
        return resp(200, {'success': True, 'fee': fee, 'days': EXTEND_DAYS})

    if action == 'quote_extend':
        loan_id = int(body.get('loanId') or 0)
        cur.execute(f"SELECT amount FROM {SCHEMA}.loans WHERE id = {loan_id} AND client_id = {cid}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Займ не найден'})
        return resp(200, {'fee': round(row[0] * DAILY_RATE * EXTEND_DAYS), 'days': EXTEND_DAYS})

    if action == 'contract':
        loan_id = int(body.get('loanId') or 0)
        cur.execute(f"SELECT id, amount, return_amount, due_date, status, issued_at, days, 0, signed_at, paid_out_at, extended_count FROM {SCHEMA}.loans WHERE id = {loan_id} AND client_id = {cid}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Договор не найден'})
        cur.execute(f"SELECT kind, amount, note, created_at FROM {SCHEMA}.payments WHERE loan_id = {loan_id} AND client_id = {cid} ORDER BY id")
        pays = [{'amount': x[1], 'note': x[2], 'date': x[3].strftime('%d.%m.%Y')} for x in cur.fetchall()]
        status_names = {'awaiting_sign': 'ожидает подписи', 'signed': 'подписан, ожидает выплаты', 'active': 'действует', 'overdue': 'просрочен', 'paid': 'займ погашен'}
        loan = {'num': f'LOAN-{row[0]:03d}', 'amount': row[1], 'returnAmount': row[2], 'dueDate': row[3].strftime('%d.%m.%Y'),
                'days': row[6], 'issuedAt': (row[8] or row[5]).strftime('%d.%m.%Y'),
                'paidOutAt': row[9].strftime('%d.%m.%Y %H:%M') if row[9] else '', 'extendedCount': row[10],
                'signedAt': row[8].strftime('%d.%m.%Y %H:%M') if row[8] else '', 'statusText': status_names.get(row[4], row[4]), 'payments': pays}
        pdf = build_contract(loan, profile(cur, cid))
        key = f"contracts/{cid}/{loan['num']}-{secrets.token_hex(8)}.pdf"
        s3_client().put_object(Bucket='files', Key=key, Body=pdf, ContentType='application/pdf')
        return resp(200, {'url': cdn_url(key)})

    if action == 'upload_doc':
        kind = body.get('kind')
        if kind not in DOC_KINDS:
            return resp(400, {'error': 'Неизвестный тип документа'})
        raw = body.get('data', '')
        if ',' in raw:
            raw = raw.split(',', 1)[1]
        data = base64.b64decode(raw)
        if len(data) > 4 * 1024 * 1024:
            return resp(400, {'error': 'Файл больше 4 МБ'})
        key = f"documents/{cid}/{kind}-{secrets.token_hex(8)}.jpg"
        s3_client().put_object(Bucket='files', Key=key, Body=data, ContentType='image/jpeg')
        cur.execute(f"DELETE FROM {SCHEMA}.client_documents WHERE client_id = {cid} AND kind = {esc(kind)}")
        cur.execute(f"UPDATE {SCHEMA}.clients SET docs_verified = FALSE WHERE id = {cid}")
        cur.execute(f"INSERT INTO {SCHEMA}.client_documents (client_id, kind, url) VALUES ({cid}, {esc(kind)}, {esc(cdn_url(key))})")
        return resp(200, {'success': True, 'url': cdn_url(key)})

    if action == 'video_code':
        code = ''.join(secrets.choice('0123456789') for _ in range(4))
        cur.execute(f"INSERT INTO {SCHEMA}.video_codes (client_id, code) VALUES ({cid}, {esc(code)})")
        return resp(200, {'code': code})

    if action == 'upload_video':
        raw = body.get('data', '')
        if ',' in raw:
            raw = raw.split(',', 1)[1]
        data = base64.b64decode(raw)
        if len(data) > 8 * 1024 * 1024:
            return resp(400, {'error': 'Видео слишком большое, запишите покороче'})
        mime = str(body.get('mime', 'video/webm'))
        ext = 'mp4' if 'mp4' in mime else 'webm'
        key = f"videos/{cid}/check-{secrets.token_hex(8)}.{ext}"
        s3_client().put_object(Bucket='files', Key=key, Body=data, ContentType='video/mp4' if ext == 'mp4' else 'video/webm')
        auto_ok = 'TRUE' if body.get('autoOk') else 'FALSE'
        issues = str(body.get('autoIssues', ''))[:500]
        cur.execute(f"SELECT code FROM {SCHEMA}.video_codes WHERE client_id = {cid} ORDER BY id DESC LIMIT 1")
        code_row = cur.fetchone()
        code = code_row[0] if code_row else ''
        cur.execute(f"INSERT INTO {SCHEMA}.video_checks (client_id, url, auto_ok, auto_issues, code) VALUES ({cid}, {esc(cdn_url(key))}, {auto_ok}, {esc(issues)}, {esc(code)})")
        notify(cur, cid, 'Видео отправлено оператору на проверку.')
        return resp(200, {'success': True})

    if action == 'confirm_data':
        answer = body.get('answer')
        comment = str(body.get('comment', '')).strip()
        if answer not in ('confirmed', 'wrong'):
            return resp(400, {'error': 'Неверный ответ'})
        cur.execute(f"UPDATE {SCHEMA}.applications SET data_confirm = {esc(answer)}, data_confirm_comment = {esc(comment)} WHERE client_id = {cid} AND data_confirm = 'requested'")
        return resp(200, {'success': True})

    if action == 'read_notifications':
        cur.execute(f"UPDATE {SCHEMA}.notifications SET is_read = TRUE WHERE client_id = {cid}")
        return resp(200, {'success': True})

    if action == 'reapply':
        amount = int(body.get('loanAmount') or 0)
        days = int(body.get('loanDays') or 0)
        if not (1000 <= amount <= 50000 and 1 <= days <= 30):
            return resp(400, {'error': 'Сумма от 1 000 до 50 000 ₽, срок от 1 до 30 дней'})
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.applications WHERE client_id = {cid} AND status IN ('new', 'in_work', 'need_docs')")
        if cur.fetchone()[0]:
            return resp(400, {'error': 'У вас уже есть заявка на рассмотрении'})
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.loans WHERE client_id = {cid} AND status IN ('awaiting_sign', 'signed', 'active', 'overdue')")
        if cur.fetchone()[0]:
            return resp(400, {'error': 'Сначала завершите текущий займ'})
        cur.execute(f"INSERT INTO {SCHEMA}.applications (client_id, amount, days) VALUES ({cid}, {amount}, {days}) RETURNING id")
        app_id = cur.fetchone()[0]
        notify(cur, cid, f"Заявка на {amount:,} ₽ принята и скоро будет рассмотрена.".replace(',', ' '))
        return resp(200, {'success': True, 'applicationId': app_id})

    cur.execute(f"SELECT id, amount, return_amount, due_date, status, issued_at, days, GREATEST((due_date - CURRENT_DATE), 0), signed_at, paid_out_at, extended_count FROM {SCHEMA}.loans WHERE client_id = {cid} ORDER BY id DESC")
    loans = [loan_row_to_dict(r) for r in cur.fetchall()]
    for l in loans:
        if l['status'] == 'active' and l['daysLeft'] <= 2:
            mark = f"[{l['id']} {l['dueDate']}]"
            cur.execute(f"SELECT 1 FROM {SCHEMA}.notifications WHERE client_id = {cid} AND text LIKE {esc('%' + mark)}")
            if not cur.fetchone():
                when = 'сегодня' if l['daysLeft'] == 0 else f"через {l['daysLeft']} дн."
                notify(cur, cid, f"Напоминание: займ нужно вернуть {when}, {l['returnAmount']:,} ₽. {mark}".replace(',', ' '))
    cur.execute(f"SELECT id, amount, created_at, status, status_text FROM {SCHEMA}.applications WHERE client_id = {cid} ORDER BY id DESC")
    apps = [{'id': f'APP-{r[0]:03d}', 'amount': r[1], 'date': str(r[2])[:10], 'status': r[3], 'statusText': r[4]} for r in cur.fetchall()]
    cur.execute(f"SELECT id, loan_id, kind, amount, note, created_at FROM {SCHEMA}.payments WHERE client_id = {cid} ORDER BY id DESC LIMIT 50")
    payments = [{'id': r[0], 'loan': f'LOAN-{r[1]:03d}', 'kind': r[2], 'amount': r[3], 'note': r[4], 'date': str(r[5])[:16]} for r in cur.fetchall()]
    cur.execute(f"SELECT kind, url, status, reject_reason FROM {SCHEMA}.client_documents WHERE client_id = {cid}")
    docs = {r[0]: {'url': r[1], 'status': r[2], 'reason': r[3]} for r in cur.fetchall()}
    cur.execute(f"SELECT status, reject_reason, created_at FROM {SCHEMA}.video_checks WHERE client_id = {cid} ORDER BY id DESC LIMIT 1")
    vr = cur.fetchone()
    video = {'status': vr[0], 'reason': vr[1], 'date': str(vr[2])[:16]} if vr else None
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.applications WHERE client_id = {cid} AND data_confirm = 'requested'")
    confirm_requested = cur.fetchone()[0] > 0
    cur.execute(f"SELECT id, text, is_read, created_at FROM {SCHEMA}.notifications WHERE client_id = {cid} ORDER BY id DESC LIMIT 30")
    notes = [{'id': r[0], 'text': re.sub(r'\s*\[LOAN-[^\]]*\]$', '', r[1]), 'isRead': r[2], 'date': str(r[3])[:16]} for r in cur.fetchall()]
    return resp(200, {'profile': profile(cur, cid), 'loans': loans, 'applications': apps, 'payments': payments, 'documents': docs, 'notifications': notes, 'confirmRequested': confirm_requested, 'video': video})
