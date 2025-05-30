import React from 'react';
import { useFormStore } from '../../stores/formStore';
import { cn } from '../../utils/cn';
import { Plus, X } from 'lucide-react';

interface FormStepsProps {
  formId: string;
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

const FormSteps: React.FC<FormStepsProps> = ({ formId, currentStepIndex, onSelectStep }) => {
  const form = useFormStore(state => state.currentForm);
  const addStep = useFormStore(state => state.addStep);
  const updateStep = useFormStore(state => state.updateStep);
  const deleteStep = useFormStore(state => state.deleteStep);
  
  if (!form) return null;
  
  const handleAddStep = () => {
    addStep();
  };
  
  const handleUpdateStepTitle = (stepId: string, title: string) => {
    updateStep(stepId, { title });
  };
  
  const handleDeleteStep = (stepId: string) => {
    if (form.steps.length > 1) {
      deleteStep(stepId);
      
      // Select the previous step if the current one is deleted
      if (currentStepIndex >= form.steps.length - 1) {
        onSelectStep(form.steps.length - 2);
      }
    }
  };
  
  return (
    <div className="flex flex-col border-b border-border bg-card px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {form.steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center"
          >
            <button
              onClick={() => onSelectStep(index)}
              className={cn(
                "inline-flex items-center rounded-md px-3 py-1 text-sm transition-colors",
                currentStepIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{index + 1}. </span>
              <input
                type="text"
                value={step.title}
                onChange={(e) => handleUpdateStepTitle(step.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "ml-1 bg-transparent w-auto focus:outline-none",
                  currentStepIndex === index
                    ? "text-primary-foreground"
                    : "text-muted-foreground focus:text-foreground"
                )}
              />
              {form.steps.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStep(step.id);
                  }}
                  className="ml-1 rounded-full p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Delete step"
                >
                  <X size={14} />
                </button>
              )}
            </button>
          </div>
        ))}
        <button
          onClick={handleAddStep}
          className="inline-flex items-center rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          aria-label="Add step"
        >
          <Plus size={14} className="mr-1" />
          Add Step
        </button>
      </div>
    </div>
  );
};

export default FormSteps;