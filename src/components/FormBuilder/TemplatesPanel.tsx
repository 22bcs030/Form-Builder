import React, { useState } from 'react';
import { X, Save, FileText, Trash } from 'lucide-react';
import { useFormStore } from '../../stores/formStore';
import { useNavigate } from 'react-router-dom';
import { FormTemplate } from '../../types/form';

interface TemplatesPanelProps {
  formId: string;
  onClose: () => void;
}

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ formId, onClose }) => {
  const navigate = useNavigate();
  const templates = useFormStore(state => state.templates);
  const saveAsTemplate = useFormStore(state => state.saveAsTemplate);
  const loadTemplate = useFormStore(state => state.loadTemplate);
  const deleteTemplate = useFormStore(state => state.deleteTemplate);
  
  const [activeTab, setActiveTab] = useState<'load' | 'save'>('load');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    saveAsTemplate(templateName.trim(), templateDescription.trim());
    setTemplateName('');
    setTemplateDescription('');
    setActiveTab('load');
  };
  
  const handleLoadTemplate = (templateId: string) => {
    const newForm = loadTemplate(templateId);
    if (newForm) {
      onClose();
      navigate(`/builder/${newForm.id}`, { replace: true });
    }
  };
  
  const handleDeleteTemplate = (template: FormTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      deleteTemplate(template.id);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-medium">Form Templates</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Close templates panel"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'load' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('load')}
          >
            Load Template
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'save' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('save')}
          >
            Save as Template
          </button>
        </div>
        
        <div className="p-4">
          {activeTab === 'load' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a template to create a new form. This will not affect your current form.
              </p>
              
              {templates.length === 0 ? (
                <div className="rounded-md bg-muted p-4 text-center">
                  <p>No templates available.</p>
                  <button
                    className="mt-2 text-sm text-primary hover:underline"
                    onClick={() => setActiveTab('save')}
                  >
                    Create your first template
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleLoadTemplate(template.id)}
                      className="group flex items-start justify-between rounded-md border border-border p-3 hover:border-primary hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2 text-primary" />
                          <h3 className="font-medium">{template.name}</h3>
                        </div>
                        {template.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteTemplate(template, e)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${template.name} template`}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Save your current form as a template to reuse it later.
              </p>
              
              <div>
                <label className="form-label" htmlFor="templateName">
                  Template Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="form-input mt-1"
                  placeholder="e.g., Contact Form"
                  required
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="templateDescription">
                  Description
                </label>
                <textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="form-input mt-1"
                  rows={3}
                  placeholder="Briefly describe this template..."
                />
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-2">
            <button onClick={onClose} className="btn-outline btn-sm">
              Cancel
            </button>
            {activeTab === 'save' && (
              <button 
                onClick={handleSaveTemplate} 
                className="btn-primary btn-sm"
                disabled={!templateName.trim()}
              >
                <Save size={16} className="mr-1" />
                Save Template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel; 