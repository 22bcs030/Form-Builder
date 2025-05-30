import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Eye, Save, Undo, Redo, Share, Trash } from 'lucide-react';
import { useFormStore } from '../../stores/formStore';

type FormBuilderHeaderProps = {
  formId: string;
  onOpenSettings: () => void;
};

const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({ formId, onOpenSettings }) => {
  const navigate = useNavigate();
  const form = useFormStore(state => state.currentForm);
  const updateForm = useFormStore(state => state.updateForm);
  const deleteForm = useFormStore(state => state.deleteForm);
  const publishForm = useFormStore(state => state.publishForm);
  const undo = useFormStore(state => state.undo);
  const redo = useFormStore(state => state.redo);
  
  const [formTitle, setFormTitle] = React.useState(form?.title || 'Untitled Form');
  
  React.useEffect(() => {
    if (form) {
      setFormTitle(form.title);
    }
  }, [form]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormTitle(e.target.value);
  };
  
  const handleTitleBlur = () => {
    if (form && formTitle.trim() !== form.title) {
      updateForm(formId, { title: formTitle.trim() || 'Untitled Form' });
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };
  
  const handlePreview = () => {
    navigate(`/preview/${formId}`);
  };
  
  const handlePublish = () => {
    if (form) {
      publishForm(formId, !form.isPublished);
    }
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this form?')) {
      deleteForm(formId);
      navigate('/');
    }
  };
  
  return (
    <div className="border-b border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={formTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="w-full bg-transparent text-xl font-semibold focus:outline-none focus:ring-1 focus:ring-primary px-2 py-1 rounded-md"
            aria-label="Form title"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={undo}
            className="btn-ghost rounded-md p-2"
            aria-label="Undo"
          >
            <Undo size={18} />
          </button>
          
          <button
            onClick={redo}
            className="btn-ghost rounded-md p-2"
            aria-label="Redo"
          >
            <Redo size={18} />
          </button>
          
          <button
            onClick={onOpenSettings}
            className="btn-ghost rounded-md p-2"
            aria-label="Form settings"
          >
            <Settings size={18} />
          </button>
          
          <button
            onClick={handlePreview}
            className="btn-outline btn-sm hidden sm:flex"
            aria-label="Preview form"
          >
            <Eye size={16} className="mr-1" />
            Preview
          </button>
          
          <button
            onClick={handlePublish}
            className="btn-primary btn-sm"
            aria-label={form?.isPublished ? 'Unpublish form' : 'Publish form'}
          >
            <Share size={16} className="mr-1" />
            {form?.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          
          <button
            onClick={handleDelete}
            className="btn-ghost text-destructive rounded-md p-2"
            aria-label="Delete form"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderHeader;