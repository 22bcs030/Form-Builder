export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SELECT = 'select',
  DATE = 'date',
  TIME = 'time',
  FILE = 'file',
  PHONE = 'phone',
  URL = 'url',
  HIDDEN = 'hidden',
}

export type ValidationRule = {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
  value?: string | number | boolean;
  message: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: string | string[] | boolean;
  helpText?: string;
  validation?: ValidationRule[];
  options?: SelectOption[];
  className?: string;
  required?: boolean;
};

export type FormStep = {
  id: string;
  title: string;
  fields: FormField[];
};

export type Form = {
  id: string;
  title: string;
  description?: string;
  steps: FormStep[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  settings: {
    showProgressBar: boolean;
    allowSaveAndContinue: boolean;
    successMessage: string;
    redirectUrl?: string;
  };
};

export type FormSubmission = {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
};

export type FormTemplate = {
  id: string;
  name: string;
  description: string;
  form: Omit<Form, 'id' | 'createdAt' | 'updatedAt' | 'isPublished'>;
};