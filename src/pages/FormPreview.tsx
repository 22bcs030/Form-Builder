import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Share } from 'lucide-react';
import { useFormStore } from '../stores/formStore';
import DeviceFrame, { DeviceType } from '../components/FormPreview/DeviceFrame';
import FormRenderer from '../components/FormPreview/FormRenderer';

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
  
  if (!form) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Form not found</h2>
          <p className="mt-2 text-muted-foreground">
            The form you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary btn-default mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <button
              onClick={handleBackToEditor}
              className="btn-ghost rounded-md p-2"
              aria-label="Back to editor"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="ml-2 text-lg font-medium">
              Preview: {form.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
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
            
            <button
              className="btn-primary btn-sm"
              onClick={() => window.open(shareUrl, '_blank')}
            >
              <Share size={16} className="mr-1" />
              Open
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <DeviceFrame device={device} onDeviceChange={handleDeviceChange}>
          <FormRenderer form={form} />
        </DeviceFrame>
      </div>
    </div>
  );
};

export default FormPreview;