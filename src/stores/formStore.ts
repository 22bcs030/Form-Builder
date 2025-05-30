import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Form, FormField, FormStep, FormSubmission, FieldType } from '../types/form';

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  formHistory: Form[];
  historyIndex: number;
  submissions: FormSubmission[];
  
  // Form CRUD
  createForm: () => void;
  getForm: (id: string) => Form | undefined;
  updateForm: (formId: string, updatedForm: Partial<Form>) => void;
  deleteForm: (formId: string) => void;
  publishForm: (formId: string, isPublished: boolean) => void;
  
  // Form Builder Actions
  setCurrentForm: (form: Form | null) => void;
  addStep: () => void;
  updateStep: (stepId: string, updates: Partial<FormStep>) => void;
  deleteStep: (stepId: string) => void;
  reorderSteps: (oldIndex: number, newIndex: number) => void;
  
  // Field Actions
  addField: (stepId: string, fieldType: FieldType) => void;
  updateField: (stepId: string, fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (stepId: string, fieldId: string) => void;
  reorderFields: (stepId: string, oldIndex: number, newIndex: number) => void;
  
  // History
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Submissions
  addSubmission: (submission: Omit<FormSubmission, 'id' | 'submittedAt'>) => void;
  getSubmissionsForForm: (formId: string) => FormSubmission[];
  clearSubmissions: (formId: string) => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      forms: [],
      currentForm: null,
      formHistory: [],
      historyIndex: -1,
      submissions: [],
      
      createForm: () => {
        const newForm: Form = {
          id: nanoid(),
          title: 'Untitled Form',
          description: '',
          steps: [
            {
              id: nanoid(),
              title: 'Step 1',
              fields: [],
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublished: false,
          settings: {
            showProgressBar: true,
            allowSaveAndContinue: false,
            successMessage: 'Thank you for your submission!',
          },
        };
        
        set(state => ({
          forms: [...state.forms, newForm],
          currentForm: newForm,
          formHistory: [newForm],
          historyIndex: 0,
        }));
        
        return newForm;
      },
      
      getForm: (id) => {
        return get().forms.find(form => form.id === id);
      },
      
      updateForm: (formId, updatedForm) => {
        set(state => {
          const updatedForms = state.forms.map(form => 
            form.id === formId 
              ? { 
                  ...form, 
                  ...updatedForm, 
                  updatedAt: new Date().toISOString() 
                } 
              : form
          );
          
          const currentForm = state.currentForm && state.currentForm.id === formId
            ? { ...state.currentForm, ...updatedForm, updatedAt: new Date().toISOString() }
            : state.currentForm;
          
          return { forms: updatedForms, currentForm };
        });
        
        get().saveToHistory();
      },
      
      deleteForm: (formId) => {
        set(state => ({
          forms: state.forms.filter(form => form.id !== formId),
          currentForm: state.currentForm?.id === formId ? null : state.currentForm,
        }));
      },
      
      publishForm: (formId, isPublished) => {
        set(state => ({
          forms: state.forms.map(form => 
            form.id === formId 
              ? { ...form, isPublished, updatedAt: new Date().toISOString() } 
              : form
          ),
        }));
      },
      
      setCurrentForm: (form) => {
        set({
          currentForm: form,
          formHistory: form ? [form] : [],
          historyIndex: form ? 0 : -1,
        });
      },
      
      addStep: () => {
        set(state => {
          if (!state.currentForm) return state;
          
          const newStep: FormStep = {
            id: nanoid(),
            title: `Step ${state.currentForm.steps.length + 1}`,
            fields: [],
          };
          
          const updatedForm = {
            ...state.currentForm,
            steps: [...state.currentForm.steps, newStep],
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      updateStep: (stepId, updates) => {
        set(state => {
          if (!state.currentForm) return state;
          
          const updatedSteps = state.currentForm.steps.map(step => 
            step.id === stepId ? { ...step, ...updates } : step
          );
          
          const updatedForm = {
            ...state.currentForm,
            steps: updatedSteps,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      deleteStep: (stepId) => {
        set(state => {
          if (!state.currentForm) return state;
          
          // Don't delete if it's the only step
          if (state.currentForm.steps.length <= 1) return state;
          
          const updatedSteps = state.currentForm.steps.filter(step => step.id !== stepId);
          
          const updatedForm = {
            ...state.currentForm,
            steps: updatedSteps,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      reorderSteps: (oldIndex, newIndex) => {
        set(state => {
          if (!state.currentForm) return state;
          
          const steps = [...state.currentForm.steps];
          const [movedStep] = steps.splice(oldIndex, 1);
          steps.splice(newIndex, 0, movedStep);
          
          const updatedForm = {
            ...state.currentForm,
            steps,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      addField: (stepId, fieldType) => {
        set(state => {
          if (!state.currentForm) return state;
          
          const newField: FormField = {
            id: nanoid(),
            type: fieldType,
            label: `New ${fieldType} field`,
            placeholder: `Enter ${fieldType}`,
            required: false,
          };
          
          const updatedSteps = state.currentForm.steps.map(step => 
            step.id === stepId 
              ? { ...step, fields: [...step.fields, newField] } 
              : step
          );
          
          const updatedForm = {
            ...state.currentForm,
            steps: updatedSteps,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      updateField: (stepId, fieldId, updates) => {
        set(state => {
          if (!state.currentForm) return state;
          
          const updatedSteps = state.currentForm.steps.map(step => 
            step.id === stepId 
              ? { 
                  ...step, 
                  fields: step.fields.map(field => 
                    field.id === fieldId 
                      ? { ...field, ...updates } 
                      : field
                  ) 
                } 
              : step
          );
          
          const updatedForm = {
            ...state.currentForm,
            steps: updatedSteps,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      deleteField: (stepId, fieldId) => {
        set(state => {
          if (!state.currentForm) return state;
          
          const updatedSteps = state.currentForm.steps.map(step => 
            step.id === stepId 
              ? { 
                  ...step, 
                  fields: step.fields.filter(field => field.id !== fieldId) 
                } 
              : step
          );
          
          const updatedForm = {
            ...state.currentForm,
            steps: updatedSteps,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      reorderFields: (stepId, oldIndex, newIndex) => {
        set(state => {
          if (!state.currentForm) return state;
          
          const updatedSteps = state.currentForm.steps.map(step => {
            if (step.id !== stepId) return step;
            
            const fields = [...step.fields];
            const [movedField] = fields.splice(oldIndex, 1);
            fields.splice(newIndex, 0, movedField);
            
            return { ...step, fields };
          });
          
          const updatedForm = {
            ...state.currentForm,
            steps: updatedSteps,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            currentForm: updatedForm,
            forms: state.forms.map(form => 
              form.id === updatedForm.id ? updatedForm : form
            ),
          };
        });
        
        get().saveToHistory();
      },
      
      saveToHistory: () => {
        set(state => {
          if (!state.currentForm) return state;
          
          // Remove future history if we're not at the end
          const newHistory = state.formHistory.slice(0, state.historyIndex + 1);
          newHistory.push({ ...state.currentForm });
          
          return {
            formHistory: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },
      
      undo: () => {
        set(state => {
          if (state.historyIndex <= 0 || state.formHistory.length <= 1) return state;
          
          const newIndex = state.historyIndex - 1;
          const previousForm = state.formHistory[newIndex];
          
          return {
            historyIndex: newIndex,
            currentForm: { ...previousForm },
            forms: state.forms.map(form => 
              form.id === previousForm.id ? previousForm : form
            ),
          };
        });
      },
      
      redo: () => {
        set(state => {
          if (state.historyIndex >= state.formHistory.length - 1) return state;
          
          const newIndex = state.historyIndex + 1;
          const nextForm = state.formHistory[newIndex];
          
          return {
            historyIndex: newIndex,
            currentForm: { ...nextForm },
            forms: state.forms.map(form => 
              form.id === nextForm.id ? nextForm : form
            ),
          };
        });
      },
      
      addSubmission: (submission) => {
        const newSubmission: FormSubmission = {
          id: nanoid(),
          formId: submission.formId,
          data: submission.data,
          submittedAt: new Date().toISOString(),
        };
        
        set(state => ({
          submissions: [...state.submissions, newSubmission],
        }));
      },
      
      getSubmissionsForForm: (formId) => {
        return get().submissions.filter(sub => sub.formId === formId);
      },
      
      clearSubmissions: (formId) => {
        set(state => ({
          submissions: state.submissions.filter(sub => sub.formId !== formId),
        }));
      },
    }),
    {
      name: 'form-builder-storage',
    }
  )
);