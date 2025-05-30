import React from 'react';
import { FormField, ValidationRule, SelectOption, FieldType } from '../../types/form';
import { useFormStore } from '../../stores/formStore';
import { cn } from '../../utils/cn';
import { Plus, Trash, AlertCircle } from 'lucide-react';

interface PropertiesPanelProps {
  stepId: string;
  fieldId: string | null;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ stepId, fieldId }) => {
  const currentForm = useFormStore(state => state.currentForm);
  const updateField = useFormStore(state => state.updateField);
  
  if (!currentForm || !fieldId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
        <h3 className="text-lg font-medium">No field selected</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a field to configure its properties
        </p>
      </div>
    );
  }
  
  // Find the field in the current step
  const step = currentForm.steps.find(s => s.id === stepId);
  if (!step) return null;
  
  const field = step.fields.find(f => f.id === fieldId);
  if (!field) return null;
  
  const handleUpdateField = (updates: Partial<FormField>) => {
    updateField(stepId, fieldId, updates);
  };
  
  const handleAddValidation = () => {
    const validation: ValidationRule[] = field.validation || [];
    handleUpdateField({
      validation: [
        ...validation,
        { type: 'required', message: 'This field is required' },
      ],
    });
  };
  
  const handleUpdateValidation = (index: number, rule: ValidationRule) => {
    if (!field.validation) return;
    
    const newValidation = [...field.validation];
    newValidation[index] = rule;
    
    handleUpdateField({ validation: newValidation });
  };
  
  const handleRemoveValidation = (index: number) => {
    if (!field.validation) return;
    
    const newValidation = field.validation.filter((_, i) => i !== index);
    handleUpdateField({ validation: newValidation });
  };
  
  const handleAddOption = () => {
    const options: SelectOption[] = field.options || [];
    const newOption: SelectOption = {
      label: `Option ${options.length + 1}`,
      value: `option-${options.length + 1}`,
    };
    
    handleUpdateField({ options: [...options, newOption] });
  };
  
  const handleUpdateOption = (index: number, option: SelectOption) => {
    if (!field.options) return;
    
    const newOptions = [...field.options];
    newOptions[index] = option;
    
    handleUpdateField({ options: newOptions });
  };
  
  const handleRemoveOption = (index: number) => {
    if (!field.options) return;
    
    const newOptions = field.options.filter((_, i) => i !== index);
    handleUpdateField({ options: newOptions });
  };
  
  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="mb-4 font-medium">Field Properties</h2>
      
      <div className="space-y-4">
        <div>
          <label className="form-label">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => handleUpdateField({ label: e.target.value })}
            className="form-input mt-1"
          />
        </div>
        
        {field.type !== FieldType.CHECKBOX && field.type !== FieldType.RADIO && (
          <div>
            <label className="form-label">Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleUpdateField({ placeholder: e.target.value })}
              className="form-input mt-1"
            />
          </div>
        )}
        
        <div>
          <label className="form-label">Help Text</label>
          <input
            type="text"
            value={field.helpText || ''}
            onChange={(e) => handleUpdateField({ helpText: e.target.value })}
            className="form-input mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Additional information to help users fill out this field
          </p>
        </div>
        
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={field.required || false}
              onChange={(e) => handleUpdateField({ required: e.target.checked })}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="required" className="ml-2 form-label">
              Required
            </label>
          </div>
        </div>
        
        {(field.type === FieldType.SELECT || field.type === FieldType.RADIO) && (
          <div>
            <div className="flex items-center justify-between">
              <label className="form-label">Options</label>
              <button
                onClick={handleAddOption}
                className="text-xs text-primary hover:text-primary/80"
              >
                <Plus size={14} className="mr-1 inline" />
                Add Option
              </button>
            </div>
            
            <div className="mt-2 space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      handleUpdateOption(index, {
                        ...option,
                        label: e.target.value,
                        value: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                    className="form-input flex-1"
                    placeholder="Option label"
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove option"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
              
              {(!field.options || field.options.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No options added yet
                </p>
              )}
            </div>
          </div>
        )}
        
        <div>
          <div className="flex items-center justify-between">
            <label className="form-label">Validation</label>
            <button
              onClick={handleAddValidation}
              className="text-xs text-primary hover:text-primary/80"
            >
              <Plus size={14} className="mr-1 inline" />
              Add Rule
            </button>
          </div>
          
          <div className="mt-2 space-y-3">
            {field.validation?.map((rule, index) => (
              <div key={index} className="rounded-md border border-border p-2">
                <div className="flex items-center justify-between">
                  <select
                    value={rule.type}
                    onChange={(e) =>
                      handleUpdateValidation(index, {
                        ...rule,
                        type: e.target.value as ValidationRule['type'],
                      })
                    }
                    className="form-input py-1"
                  >
                    <option value="required">Required</option>
                    <option value="minLength">Min Length</option>
                    <option value="maxLength">Max Length</option>
                    <option value="pattern">Pattern</option>
                    {field.type === FieldType.NUMBER && (
                      <>
                        <option value="min">Min Value</option>
                        <option value="max">Max Value</option>
                      </>
                    )}
                  </select>
                  
                  <button
                    onClick={() => handleRemoveValidation(index)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove validation rule"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                
                {rule.type !== 'required' && (
                  <input
                    type={
                      rule.type === 'min' || rule.type === 'max'
                        ? 'number'
                        : 'text'
                    }
                    value={rule.value as string || ''}
                    onChange={(e) =>
                      handleUpdateValidation(index, {
                        ...rule,
                        value: e.target.value,
                      })
                    }
                    className="form-input mt-2 py-1"
                    placeholder={
                      rule.type === 'pattern'
                        ? 'Regular expression'
                        : rule.type === 'minLength' || rule.type === 'maxLength'
                        ? 'Character length'
                        : 'Value'
                    }
                  />
                )}
                
                <input
                  type="text"
                  value={rule.message}
                  onChange={(e) =>
                    handleUpdateValidation(index, {
                      ...rule,
                      message: e.target.value,
                    })
                  }
                  className="form-input mt-2 py-1"
                  placeholder="Error message"
                />
              </div>
            ))}
            
            {(!field.validation || field.validation.length === 0) && (
              <p className="text-sm text-muted-foreground">
                No validation rules added
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;