import React, { useState } from 'react';
import { Form, FormField, FormStep, ValidationRule } from '../../types/form';
import { cn } from '../../utils/cn';

interface FormRendererProps {
  form: Form;
  onSubmit?: (data: Record<string, any>) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const currentStep = form.steps[currentStepIndex];
  
  const validateField = (field: FormField, value: any): string | null => {
    if (!field.validation) return null;
    
    for (const rule of field.validation) {
      switch (rule.type) {
        case 'required':
          if (!value) return rule.message;
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < Number(rule.value)) {
            return rule.message;
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > Number(rule.value)) {
            return rule.message;
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && rule.value) {
            const pattern = new RegExp(rule.value as string);
            if (!pattern.test(value)) {
              return rule.message;
            }
          }
          break;
        case 'min':
          if (typeof value === 'number' && value < Number(rule.value)) {
            return rule.message;
          }
          break;
        case 'max':
          if (typeof value === 'number' && value > Number(rule.value)) {
            return rule.message;
          }
          break;
      }
    }
    
    return null;
  };
  
  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    step.fields.forEach(field => {
      const value = formData[field.id];
      
      if (field.required && !value) {
        newErrors[field.id] = 'This field is required';
        isValid = false;
      } else {
        const error = validateField(field, value);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error when user types
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };
  
  const handleNext = () => {
    const isValid = validateStep(currentStep);
    
    if (isValid && currentStepIndex < form.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateStep(currentStep);
    
    if (isValid) {
      if (currentStepIndex < form.steps.length - 1) {
        handleNext();
      } else {
        if (onSubmit) {
          onSubmit(formData);
        }
        setIsSubmitted(true);
      }
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-success/10 p-4 text-success">
          <svg width="24\" height="24\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="2\" strokeLinecap="round\" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold">{form.settings.successMessage}</h2>
        <p className="text-muted-foreground">Your form has been submitted successfully.</p>
        
        {form.settings.redirectUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Redirecting you to{' '}
              <a
                href={form.settings.redirectUrl}
                className="text-primary hover:underline"
              >
                {form.settings.redirectUrl}
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }
  
  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'phone':
        return (
          <input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "form-input",
              error && "border-destructive"
            )}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            className={cn(
              "form-input",
              error && "border-destructive"
            )}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={cn(
              "form-input",
              error && "border-destructive"
            )}
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={cn(
              "form-input",
              error && "border-destructive"
            )}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-start">
            <input
              type="checkbox"
              id={field.id}
              checked={!!value}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className={cn(
                "h-4 w-4 rounded border-input text-primary focus:ring-primary",
                error && "border-destructive"
              )}
            />
            <label htmlFor={field.id} className="ml-2 block text-sm">
              {field.label}
            </label>
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className={cn(
                    "h-4 w-4 border-input text-primary focus:ring-primary",
                    error && "border-destructive"
                  )}
                />
                <label
                  htmlFor={`${field.id}-${option.value}`}
                  className="ml-2 block text-sm"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={cn(
              "form-input",
              error && "border-destructive"
            )}
          />
        );
      case 'file':
        return (
          <input
            type="file"
            id={field.id}
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleChange(field.id, file);
            }}
            className={cn(
              "form-input",
              error && "border-destructive"
            )}
          />
        );
      default:
        return <div>Unsupported field type</div>;
    }
  };
  
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-muted-foreground">{form.description}</p>
        )}
      </div>
      
      {form.steps.length > 1 && form.settings.showProgressBar && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            <span>Step {currentStepIndex + 1} of {form.steps.length}</span>
            <span>{Math.round(((currentStepIndex + 1) / form.steps.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${((currentStepIndex + 1) / form.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {currentStep.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type !== 'checkbox' && (
                <label htmlFor={field.id} className="form-label">
                  {field.label}
                  {field.required && <span className="ml-1 text-destructive">*</span>}
                </label>
              )}
              
              {renderField(field)}
              
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
              
              {errors[field.id] && (
                <p className="text-xs text-destructive">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-between">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="btn-outline btn-default"
            >
              Previous
            </button>
          )}
          
          <div className="flex-1" />
          
          <button
            type="submit"
            className="btn-primary btn-default"
          >
            {currentStepIndex < form.steps.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;