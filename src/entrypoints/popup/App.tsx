import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { validateApiKey } from '@/utils/api';
import { secureStorage } from '@/utils/secureStorage';
import { AIProvider } from '@/types';
import '@/styles/globals.css';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';
import LogoSvg from '/public/Logo.svg';

function App() {
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await secureStorage.getSettings();
      if (settings && settings.isConfigured) {
        setProvider(settings.provider);
        setApiKey(settings.apiKey);
        setIsConfigured(true);
      }
    };
    loadSettings();
  }, []);

  const handleValidate = async () => {
    setError('');
    setSuccess('');
    setIsValidating(true);

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      setIsValidating(false);
      return;
    }

    const result = await validateApiKey(provider, apiKey);
    setIsValidating(false);

    if (result.valid) {
      await secureStorage.saveSettings(provider, apiKey, true);
      setIsConfigured(true);
      setSuccess('API key validated successfully! Extension is now active.');
    } else {
      setError(result.error || 'Invalid API key. Please try again.');
    }
  };

  const handleReconfigure = () => {
    setIsConfigured(false);
    setError('');
    setSuccess('');
  };

  const handleClear = async () => {
    await secureStorage.clearSettings();
    setProvider('openai');
    setApiKey('');
    setIsConfigured(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="w-[400px] min-h-[300px] p-6">
      <div className="flex items-center gap-2 mb-6">
        <img src={LogoSvg} alt="Logo" className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Text to Prompt</h1>
      </div>

      {!isConfigured ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure your AI provider to start processing text with AI assistance.
          </p>

          <div className="space-y-2">
            <Label htmlFor="provider" className="text-white">AI Provider</Label>
            <Select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
            >
              <option value="openai">OpenAI (GPT-5 Mini)</option>
              <option value="gemini">Google Gemini 2.5 Flash</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-white">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={
                provider === 'openai'
                  ? 'sk-...'
                  : 'Enter your Gemini API key'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {provider === 'openai'
                ? 'Get your API key from platform.openai.com'
                : 'Get your API key from ai.google.dev'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleValidate}
            disabled={isValidating}
            className="w-full"
          >
            {isValidating ? 'Validating...' : 'Validate & Save'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            <CheckCircle className="w-4 h-4" />
            <span>Extension is active and ready to use!</span>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-2 p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Provider:</span>
              <span className="text-sm text-muted-foreground capitalize">
                {provider === 'openai' ? 'OpenAI' : 'Google Gemini'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Key:</span>
              <span className="text-sm text-muted-foreground font-mono">
                {apiKey.substring(0, 8)}...
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The extension will now show an icon on text fields. Click it to process
              your text with AI assistance.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReconfigure}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Reconfigure
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              className="flex-1"
            >
              Clear Settings
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally and never shared.
        </p>
      </div>
    </div>
  );
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
