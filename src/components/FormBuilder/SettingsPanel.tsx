import React from 'react';
import { X } from 'lucide-react';
import { Form } from '../../types/form';
import { useFormStore } from '../../stores/formStore';

interface SettingsPanelProps {
  formId: string;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ formId, onClose }) => {
  const form = useFormStore(state => state.currentForm);
  const updateForm = useFormStore(state => state.updateForm);
  
  const [settings, setSettings] = React.useState({
    showProgressBar: true,
    allowSaveAndContinue: false,
    successMessage: 'Thank you for your submission!',
    redirectUrl: '',
  });
  
  React.useEffect(() => {
    if (form) {
      setSettings({
        showProgressBar: form.settings.showProgressBar,
        allowSaveAndContinue: form.settings.allowSaveAndContinue,
        successMessage: form.settings.successMessage,
        redirectUrl: form.settings.redirectUrl || '',
      });
    }
  }, [form]);
  
  if (!form) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };
  
  const handleSave = () => {
    updateForm(formId, {
      settings: {
        ...settings,
        redirectUrl: settings.redirectUrl.trim() || undefined,
      }
    });
    onClose();
  };
  
  const shareableUrl = `${window.location.origin}/form/${formId}`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-medium">Form Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="form-label" htmlFor="formTitle">
                Form Title
              </label>
              <input
                type="text"
                id="formTitle"
                value={form.title}
                onChange={(e) => updateForm(formId, { title: e.target.value })}
                className="form-input mt-1"
              />
            </div>
            
            <div>
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={form.description || ''}
                onChange={(e) => updateForm(formId, { description: e.target.value })}
                className="form-input mt-1"
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showProgressBar"
                  name="showProgressBar"
                  checked={settings.showProgressBar}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="showProgressBar" className="ml-2 form-label">
                  Show progress bar for multi-step forms
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowSaveAndContinue"
                  name="allowSaveAndContinue"
                  checked={settings.allowSaveAndContinue}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="allowSaveAndContinue" className="ml-2 form-label">
                  Allow users to save progress and continue later
                </label>
              </div>
            </div>
            
            <div>
              <label className="form-label" htmlFor="successMessage">
                Success Message
              </label>
              <textarea
                id="successMessage"
                name="successMessage"
                value={settings.successMessage}
                onChange={handleChange}
                className="form-input mt-1"
                rows={2}
              />
            </div>
            
            <div>
              <label className="form-label" htmlFor="redirectUrl">
                Redirect URL After Submission (Optional)
              </label>
              <input
                type="url"
                id="redirectUrl"
                name="redirectUrl"
                value={settings.redirectUrl}
                onChange={handleChange}
                className="form-input mt-1"
                placeholder="https://example.com/thank-you"
              />
            </div>
            
            {form.isPublished && (
              <div className="rounded-md bg-muted p-3">
                <h3 className="text-sm font-medium">Share your form</h3>
                <div className="mt-2 flex items-center">
                  <input
                    type="text"
                    value={shareableUrl}
                    readOnly
                    className="form-input flex-1 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareableUrl)}
                    className="ml-2 btn-outline btn-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button onClick={onClose} className="btn-outline btn-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary btn-sm">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;