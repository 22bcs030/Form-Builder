import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Form, FormField, FormStep, FormSubmission, FieldType, FormTemplate } from '../types/form';

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  formHistory: Form[];
  historyIndex: number;
  submissions: FormSubmission[];
  templates: FormTemplate[];
  
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
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Templates
  saveAsTemplate: (name: string, description: string) => void;
  loadTemplate: (templateId: string) => Form | undefined;
  deleteTemplate: (templateId: string) => void;
  
  // Submissions
  addSubmission: (submission: Omit<FormSubmission, 'id' | 'submittedAt'>) => void;
  getSubmissionsForForm: (formId: string) => FormSubmission[];
  clearSubmissions: (formId: string) => void;
}

// Predefined templates
const contactFormTemplate: FormTemplate = {
  id: 'contact-form',
  name: 'Contact Us Form',
  description: 'A simple contact form with name, email, and message fields',
  form: {
    title: 'Contact Us',
    description: 'We\'d love to hear from you! Fill out the form below to get in touch.',
    steps: [
      {
        id: 'step-1',
        title: 'Contact Information',
        fields: [
          {
            id: 'name',
            type: FieldType.TEXT,
            label: 'Name',
            placeholder: 'Enter your full name',
            required: true,
          },
          {
            id: 'email',
            type: FieldType.EMAIL,
            label: 'Email',
            placeholder: 'Enter your email address',
            required: true,
          },
          {
            id: 'phone',
            type: FieldType.PHONE,
            label: 'Phone Number',
            placeholder: 'Enter your phone number',
            required: false,
          },
          {
            id: 'message',
            type: FieldType.TEXTAREA,
            label: 'Message',
            placeholder: 'How can we help you?',
            required: true,
          }
        ],
      }
    ],
    settings: {
      showProgressBar: false,
      allowSaveAndContinue: false,
      successMessage: 'Thank you for your message! We\'ll get back to you soon.',
    }
  }
};

const surveyFormTemplate: FormTemplate = {
  id: 'survey-form',
  name: 'Customer Feedback Survey',
  description: 'A multi-step survey to collect customer feedback',
  form: {
    title: 'Customer Feedback Survey',
    description: 'Help us improve our services by sharing your experience.',
    steps: [
      {
        id: 'step-1',
        title: 'About You',
        fields: [
          {
            id: 'name',
            type: FieldType.TEXT,
            label: 'Name',
            placeholder: 'Enter your name',
            required: false,
          },
          {
            id: 'email',
            type: FieldType.EMAIL,
            label: 'Email',
            placeholder: 'Enter your email address',
            required: true,
          }
        ],
      },
      {
        id: 'step-2',
        title: 'Your Experience',
        fields: [
          {
            id: 'rating',
            type: FieldType.SELECT,
            label: 'How would you rate your overall experience?',
            required: true,
            options: [
              { label: 'Excellent', value: 'excellent' },
              { label: 'Good', value: 'good' },
              { label: 'Average', value: 'average' },
              { label: 'Poor', value: 'poor' },
              { label: 'Very Poor', value: 'very-poor' },
            ],
          },
          {
            id: 'feedback',
            type: FieldType.TEXTAREA,
            label: 'What could we do to improve?',
            placeholder: 'Share your thoughts...',
            required: false,
          }
        ],
      }
    ],
    settings: {
      showProgressBar: true,
      allowSaveAndContinue: true,
      successMessage: 'Thank you for your feedback! Your input is valuable to us.',
    }
  }
};

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      forms: [],
      currentForm: null,
      formHistory: [],
      historyIndex: -1,
      submissions: [],
      templates: [contactFormTemplate, surveyFormTemplate],
      
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
          
          // Create a deep copy of the current form to avoid reference issues
          const currentFormCopy = JSON.parse(JSON.stringify(state.currentForm));
          
          // Remove future history if we're not at the end
          const newHistory = state.formHistory.slice(0, state.historyIndex + 1);
          
          // Only add to history if there are actual changes
          const lastHistoryItem = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
          if (lastHistoryItem && JSON.stringify(lastHistoryItem) === JSON.stringify(currentFormCopy)) {
            return state; // No changes, don't add to history
          }
          
          newHistory.push(currentFormCopy);
          
          // Limit history size to prevent memory issues
          const maxHistorySize = 50;
          const limitedHistory = newHistory.length > maxHistorySize 
            ? newHistory.slice(newHistory.length - maxHistorySize) 
            : newHistory;
          
          const newIndex = limitedHistory.length - 1;
          
          return {
            formHistory: limitedHistory,
            historyIndex: newIndex,
          };
        });
      },
      
      undo: () => {
        set(state => {
          if (!state.canUndo() || !state.currentForm) return state;
          
          const newIndex = state.historyIndex - 1;
          if (newIndex < 0 || newIndex >= state.formHistory.length) return state;
          
          const previousForm = JSON.parse(JSON.stringify(state.formHistory[newIndex]));
          
          if (!previousForm || !previousForm.id) return state;
          
          return {
            historyIndex: newIndex,
            currentForm: previousForm,
            forms: state.forms.map(form => 
              form.id === previousForm.id ? previousForm : form
            ),
          };
        });
      },
      
      redo: () => {
        set(state => {
          if (!state.canRedo() || !state.currentForm) return state;
          
          const newIndex = state.historyIndex + 1;
          if (newIndex < 0 || newIndex >= state.formHistory.length) return state;
          
          const nextForm = JSON.parse(JSON.stringify(state.formHistory[newIndex]));
          
          if (!nextForm || !nextForm.id) return state;
          
          return {
            historyIndex: newIndex,
            currentForm: nextForm,
            forms: state.forms.map(form => 
              form.id === nextForm.id ? nextForm : form
            ),
          };
        });
      },
      
      canUndo: () => {
        const { historyIndex, formHistory } = get();
        return historyIndex > 0 && formHistory.length > 1;
      },
      
      canRedo: () => {
        const { historyIndex, formHistory } = get();
        return historyIndex < formHistory.length - 1 && formHistory.length > 1;
      },
      
      // Template methods
      saveAsTemplate: (name, description) => {
        const { currentForm } = get();
        if (!currentForm) return;
        
        const { id, createdAt, updatedAt, isPublished, ...formData } = currentForm;
        
        const newTemplate: FormTemplate = {
          id: nanoid(),
          name,
          description,
          form: formData as Omit<Form, 'id' | 'createdAt' | 'updatedAt' | 'isPublished'>
        };
        
        set(state => ({
          templates: [...state.templates, newTemplate]
        }));
      },
      
      loadTemplate: (templateId) => {
        const { templates } = get();
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        
        const newForm: Form = {
          id: nanoid(),
          ...template.form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublished: false,
        };
        
        set(state => ({
          forms: [...state.forms, newForm],
          currentForm: newForm,
          formHistory: [newForm],
          historyIndex: 0,
        }));
        
        return newForm;
      },
      
      deleteTemplate: (templateId) => {
        set(state => ({
          templates: state.templates.filter(template => template.id !== templateId)
        }));
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