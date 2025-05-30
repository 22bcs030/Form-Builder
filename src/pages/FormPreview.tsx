import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Share, MessageSquare } from 'lucide-react';
import { useFormStore } from '../stores/formStore';
import DeviceFrame, { DeviceType } from '../components/FormPreview/DeviceFrame';
import FormRenderer from '../components/FormPreview/FormRenderer';
import Button from '../components/ui/Button';

const FormPreview: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const getForm = useFormStore(state => state.getForm);
  
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const form = formId ? getForm(formId) : null;
  
  useEffect(() => {
    if (formId) {
      setShareUrl(`${window.location.origin}/form/${formId}`);
    }
  }, [formId]);
  
  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
  };
  
  const handleBackToEditor = () => {
    if (formId) {
      navigate(`/builder/${formId}`);
    }
  };
  
  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  const handleViewResponses = () => {
    if (formId) {
      navigate(`/submissions/${formId}`);
    }
  };
  
  const handleOpenForm = () => {
    if (formId) {
      navigate(`/form/${formId}`);
    }
  };
  
  if (!form) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Form not found</h2>
          <p className="mt-2 text-muted-foreground">
            The form you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            variant="primary"
            size="default"
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const hasMultipleSteps = form.steps.length > 1;
  
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleBackToEditor}
              className="rounded-md p-2"
              aria-label="Back to editor"
              icon={<ChevronLeft size={18} />}
            />
            <h1 className="ml-2 text-lg font-medium">
              Preview: {form.title}
            </h1>
            {hasMultipleSteps && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                Multi-step form ({form.steps.length} steps)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewResponses}
              aria-label="View responses"
              icon={<MessageSquare size={16} />}
            >
              Responses
            </Button>
            
            <div className="relative flex items-center rounded-md border border-border bg-background px-3 py-1">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-48 bg-transparent text-sm focus:outline-none sm:w-64"
              />
              <button
                onClick={handleCopyShareLink}
                className="ml-2 text-primary hover:text-primary/80"
                aria-label="Copy link"
              >
                <Copy size={16} />
              </button>
              {copied && (
                <div className="absolute -bottom-8 right-0 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                  Copied!
                </div>
              )}
            </div>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenForm}
              icon={<Share size={16} />}
            >
              Open
            </Button>
          </div>
        </div>
      </div>
      
      {hasMultipleSteps && (
        <div className="bg-muted/30 px-4 py-2 text-sm">
          <div className="flex items-center">
            <span className="font-medium">Multi-step Form:</span>
            <span className="ml-2">This form has {form.steps.length} steps with navigation and validation.</span>
            <span className="ml-2 text-muted-foreground">
              {form.settings.showProgressBar ? 'Progress indicator is enabled.' : 'Progress indicator is disabled.'}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <DeviceFrame device={device} onDeviceChange={handleDeviceChange}>
          <FormRenderer form={form} previewMode={true} />
        </DeviceFrame>
      </div>
    </div>
  );
};

export default FormPreview;