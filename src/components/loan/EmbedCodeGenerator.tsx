import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface EmbedSettings {
  compact: boolean;
  theme: 'light' | 'dark';
  brandColor: string;
  redirectUrl: string;
  widgetId: string;
  width: string;
  height: string;
}

export const EmbedCodeGenerator: React.FC = () => {
  const [settings, setSettings] = useState<EmbedSettings>({
    compact: false,
    theme: 'light',
    brandColor: '#2563eb',
    redirectUrl: window.location.origin,
    widgetId: `mfo-calc-${Date.now()}`,
    width: 'auto',
    height: 'auto'
  });

  const [copied, setCopied] = useState<string | null>(null);

  const generateHtmlCode = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      compact: settings.compact.toString(),
      theme: settings.theme,
      brandColor: encodeURIComponent(settings.brandColor),
      redirectUrl: encodeURIComponent(settings.redirectUrl),
      widgetId: settings.widgetId
    });

    return `<!-- МФО Калькулятор займа -->
<iframe 
  src="${baseUrl}/embed?${params.toString()}"
  width="${settings.width}"
  height="${settings.height}"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="Калькулятор займа">
</iframe>`;
  };

  const generateJavaScriptCode = () => {
    const baseUrl = window.location.origin;
    return `<!-- МФО Калькулятор займа (JavaScript) -->
<div id="${settings.widgetId}"></div>
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/embed?' + new URLSearchParams({
    compact: '${settings.compact}',
    theme: '${settings.theme}',
    brandColor: '${encodeURIComponent(settings.brandColor)}',
    redirectUrl: '${encodeURIComponent(settings.redirectUrl)}',
    widgetId: '${settings.widgetId}'
  }).toString();
  iframe.width = '${settings.width}';
  iframe.height = '${settings.height}';
  iframe.frameBorder = '0';
  iframe.scrolling = 'no';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  iframe.title = 'Калькулятор займа';
  
  var container = document.getElementById('${settings.widgetId}');
  if (container) {
    container.appendChild(iframe);
  }
})();
</script>`;
  };

  const generateReactCode = () => {
    return `import EmbeddableCalculator from './EmbeddableCalculator';

function App() {
  return (
    <EmbeddableCalculator
      compact={${settings.compact}}
      theme="${settings.theme}"
      brandColor="${settings.brandColor}"
      redirectUrl="${settings.redirectUrl}"
      widgetId="${settings.widgetId}"
    />
  );
}`;
  };

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleSettingChange = (key: keyof EmbedSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={24} />
            Настройки виджета
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Основные настройки */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="compact">Компактный режим</Label>
                <Switch
                  id="compact"
                  checked={settings.compact}
                  onCheckedChange={(checked) => handleSettingChange('compact', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Тема</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('theme', 'light')}
                  >
                    Светлая
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('theme', 'dark')}
                  >
                    Темная
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandColor">Цвет бренда</Label>
                <div className="flex gap-2">
                  <Input
                    id="brandColor"
                    type="color"
                    value={settings.brandColor}
                    onChange={(e) => handleSettingChange('brandColor', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.brandColor}
                    onChange={(e) => handleSettingChange('brandColor', e.target.value)}
                    placeholder="#2563eb"
                  />
                </div>
              </div>
            </div>

            {/* Дополнительные настройки */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redirectUrl">URL для перехода</Label>
                <Input
                  id="redirectUrl"
                  value={settings.redirectUrl}
                  onChange={(e) => handleSettingChange('redirectUrl', e.target.value)}
                  placeholder="https://your-mfo-site.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="widgetId">ID виджета</Label>
                <Input
                  id="widgetId"
                  value={settings.widgetId}
                  onChange={(e) => handleSettingChange('widgetId', e.target.value)}
                  placeholder="mfo-calc-widget"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="width">Ширина</Label>
                  <Input
                    id="width"
                    value={settings.width}
                    onChange={(e) => handleSettingChange('width', e.target.value)}
                    placeholder="auto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Высота</Label>
                  <Input
                    id="height"
                    value={settings.height}
                    onChange={(e) => handleSettingChange('height', e.target.value)}
                    placeholder="auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Код для встраивания */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Code" size={24} />
            Код для встраивания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">HTML + IFrame</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generateHtmlCode(), 'html')}
                  className="flex items-center gap-2"
                >
                  <Icon name={copied === 'html' ? 'Check' : 'Copy'} size={16} />
                  {copied === 'html' ? 'Скопировано!' : 'Копировать'}
                </Button>
              </div>
              <Textarea
                value={generateHtmlCode()}
                readOnly
                className="font-mono text-sm"
                rows={10}
              />
            </TabsContent>

            <TabsContent value="javascript" className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">JavaScript (Динамический)</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generateJavaScriptCode(), 'js')}
                  className="flex items-center gap-2"
                >
                  <Icon name={copied === 'js' ? 'Check' : 'Copy'} size={16} />
                  {copied === 'js' ? 'Скопировано!' : 'Копировать'}
                </Button>
              </div>
              <Textarea
                value={generateJavaScriptCode()}
                readOnly
                className="font-mono text-sm"
                rows={12}
              />
            </TabsContent>

            <TabsContent value="react" className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">React Component</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generateReactCode(), 'react')}
                  className="flex items-center gap-2"
                >
                  <Icon name={copied === 'react' ? 'Check' : 'Copy'} size={16} />
                  {copied === 'react' ? 'Скопировано!' : 'Копировать'}
                </Button>
              </div>
              <Textarea
                value={generateReactCode()}
                readOnly
                className="font-mono text-sm"
                rows={8}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Инструкции */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={24} />
            Инструкция по установке
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon name="Globe" size={16} />
              Для обычных сайтов (HTML):
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-6">
              <li>Скопируйте HTML-код из вкладки "HTML"</li>
              <li>Вставьте его в нужное место на вашем сайте</li>
              <li>Сохраните файл и обновите страницу</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon name="Zap" size={16} />
              Для динамических сайтов (JavaScript):
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-6">
              <li>Создайте div с нужным ID в HTML</li>
              <li>Вставьте JavaScript-код перед закрывающим тегом &lt;/body&gt;</li>
              <li>Виджет загрузится автоматически после загрузки страницы</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon name="Code2" size={16} />
              Для React приложений:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-6">
              <li>Скопируйте файл EmbeddableCalculator.tsx в ваш проект</li>
              <li>Установите необходимые зависимости (если их нет)</li>
              <li>Импортируйте и используйте компонент с нужными пропсами</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbedCodeGenerator;