import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { validateApiKey } from '@/utils/api';
import { secureStorage } from '@/utils/secureStorage';
import { AIProvider } from '@/types';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

export function ConfigModal({ open, onClose, onConfigured }: ConfigModalProps) {
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setProvider('openai');
      setApiKey('');
      setError('');
      setSuccess('');
      setIsValidating(false);
    }
  }, [open]);

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
      setSuccess('API key validated successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onConfigured();
        onClose();
      }, 800);
    } else {
      setError(result.error || 'Invalid API key. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Text to Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please configure your AI provider to use this extension.
          </p>

          <div className="space-y-2">
            <Label htmlFor="config-provider" className="text-white">AI Provider</Label>
            <Select
              id="config-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
              disabled={isValidating}
            >
              <option value="openai">OpenAI (GPT-5 Mini)</option>
              <option value="gemini">Google Gemini 2.5 Flash</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-apiKey" className="text-white">API Key</Label>
            <Input
              id="config-apiKey"
              type="password"
              placeholder={
                provider === 'openai'
                  ? 'sk-...'
                  : 'Enter your Gemini API key'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isValidating}
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

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <Button
            onClick={handleValidate}
            disabled={isValidating}
            className="w-full"
          >
            {isValidating ? 'Validating...' : 'Validate & Save'}
          </Button>

          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
