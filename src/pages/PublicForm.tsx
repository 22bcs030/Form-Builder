import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormStore } from '../stores/formStore';
import FormRenderer from '../components/FormPreview/FormRenderer';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PublicForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const getForm = useFormStore(state => state.getForm);
  const addSubmission = useFormStore(state => state.addSubmission);
  
  const form = formId ? getForm(formId) : null;
  
  if (!form || !formId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold">Form Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The form you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary btn-default w-full"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }
  
  const handleSubmit = (data: Record<string, any>) => {
    if (!formId) return;
    
    addSubmission({
      formId,
      data,
    });
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-lg font-medium">{form.title}</h1>
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 hover:bg-muted"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <FormRenderer form={form} onSubmit={handleSubmit} />
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Created with FormBuilder
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicForm;