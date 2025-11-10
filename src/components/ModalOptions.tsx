import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfigModal } from '@/components/ConfigModal';
import { convertText } from '@/utils/api';
import { secureStorage } from '@/utils/secureStorage';
import { PromptOption } from '@/types';
import { Copy, Check, Loader2, ArrowRight } from 'lucide-react';

interface ModalOptionsProps {
  open: boolean;
  onClose: () => void;
  text: string;
  onInsert: (text: string) => void;
}

export function ModalOptions({ open, onClose, text, onInsert }: ModalOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<PromptOption | null>(null);
  const [convertedText, setConvertedText] = useState<string>('');
  const [editableText, setEditableText] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Check if extension is configured when modal opens
  useEffect(() => {
    if (open) {
      const checkConfiguration = async () => {
        const settings = await secureStorage.getSettings();
        const configured = settings?.isConfigured || false;
        setIsConfigured(configured);
        
        // Show config modal if not configured
        if (!configured) {
          setShowConfigModal(true);
        }
      };
      checkConfiguration();
    }
  }, [open]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedOption(null);
      setConvertedText('');
      setEditableText('');
      setError('');
      setIsConverting(false);
      setCopied(false);
      setShowConfigModal(false);
    }
  }, [open]);

  // Update editableText when convertedText changes
  useEffect(() => {
    if (convertedText) {
      setEditableText(convertedText);
    }
  }, [convertedText]);

  const options: { value: PromptOption; label: string; description: string }[] = [
    {
      value: 'text-to-english-prompt',
      label: 'Process Text → English Response',
      description: 'Process your text and get a detailed response in English',
    },
    {
      value: 'text-to-json-english-prompt',
      label: 'Process Text → JSON (English)',
      description: 'Enhance and improve your text, then generate structured JSON with English keys and values',
    },
    {
      value: 'text-to-json-prompt',
      label: 'Process Text → JSON (Multilingual)',
      description: 'Enhance and improve your text in its original language, then generate JSON with English keys',
    },
    {
      value: 'text-to-toon',
      label: 'Process Text → TOON',
      description: 'Convert your text into Token-Oriented Object Notation (TOON) using the official specification for LLM-efficient prompts',
    },
  ];

  const handleConvert = async (option: PromptOption) => {
    setSelectedOption(option);
    setError('');
    setIsConverting(true);
    setConvertedText('');

    try {
      const settings = await secureStorage.getSettings();
      if (!settings || !settings.isConfigured) {
        setError('Extension is not configured. Please configure your API key.');
        setIsConverting(false);
        setShowConfigModal(true);
        return;
      }

      const result = await convertText({
        text,
        option,
        provider: settings.provider,
        apiKey: settings.apiKey,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setConvertedText(result.result || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (editableText) {
      await navigator.clipboard.writeText(editableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (editableText) {
      onInsert(editableText);
      onClose();
    }
  };

  const handleBack = () => {
    setSelectedOption(null);
    setConvertedText('');
    setError('');
    setIsConverting(false);
  };

  const handleConfigured = async () => {
    setIsConfigured(true);
    setShowConfigModal(false);
    setError('');
    
    // Reset to show options again after configuration
    setSelectedOption(null);
  };

  const handleCloseConfigModal = () => {
    setShowConfigModal(false);
    // If not configured, close the main modal too
    if (!isConfigured) {
      onClose();
    }
  };

  return (
    <>
      <ConfigModal
        open={showConfigModal}
        onClose={handleCloseConfigModal}
        onConfigured={handleConfigured}
      />
      
      <Dialog open={open && !showConfigModal} onOpenChange={onClose}>
      <DialogContent className={selectedOption ? "w-[50vw] max-w-none max-h-[95vh] overflow-y-auto" : "max-w-3xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>
            {selectedOption ? 'AI Response' : 'Process Text with AI'}
          </DialogTitle>
        </DialogHeader>

        {!selectedOption ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Select how you want to process your text:
            </div>
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConvert(option.value)}
                  disabled={isConverting}
                  className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
            
            {text && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Original Text:</div>
                <div className="p-3 bg-muted rounded-md text-sm max-h-32 overflow-y-auto">
                  {text}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isConverting ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Processing your text with AI...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-sm font-medium mb-2">AI Response:</div>
                  <textarea
                    className="w-full p-4 bg-muted rounded-md text-sm max-h-[600px] min-h-[400px] overflow-y-auto whitespace-pre-wrap border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    placeholder="AI response will appear here..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleInsert}
                    className="flex-1"
                  >
                    Insert into Field
                  </Button>
                </div>
              </>
            )}

            <div className="flex justify-between pt-2 border-t">
              <Button onClick={handleBack} variant="ghost">
                ← Back
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
