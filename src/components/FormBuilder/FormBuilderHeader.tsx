import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Eye, Share, Trash, Undo, Redo, FileText, MessageSquare } from 'lucide-react';
import { useFormStore } from '../../stores/formStore';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

type FormBuilderHeaderProps = {
  formId: string;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
};

const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({ 
  formId, 
  onOpenSettings,
  onOpenTemplates
}) => {
  const navigate = useNavigate();
  const form = useFormStore(state => state.currentForm);
  const updateForm = useFormStore(state => state.updateForm);
  const deleteForm = useFormStore(state => state.deleteForm);
  const publishForm = useFormStore(state => state.publishForm);
  const undo = useFormStore(state => state.undo);
  const redo = useFormStore(state => state.redo);
  const canUndo = useFormStore(state => state.canUndo);
  const canRedo = useFormStore(state => state.canRedo);
  const historyIndex = useFormStore(state => state.historyIndex);
  const formHistory = useFormStore(state => state.formHistory);
  
  // Track history state to force re-renders
  const [undoState, setUndoState] = useState(false);
  const [redoState, setRedoState] = useState(false);
  
  const [formTitle, setFormTitle] = React.useState(form?.title || 'Untitled Form');
  
  // Update button states when history changes
  useEffect(() => {
    setUndoState(canUndo());
    setRedoState(canRedo());
  }, [historyIndex, formHistory, canUndo, canRedo]);
  
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
  
  const handleUndo = () => {
    if (canUndo()) {
      undo();
      // Update states to force re-render
      setUndoState(canUndo());
      setRedoState(canRedo());
    }
  };
  
  const handleRedo = () => {
    if (canRedo()) {
      redo();
      // Update states to force re-render
      setUndoState(canUndo());
      setRedoState(canRedo());
    }
  };
  
  const handleViewResponses = () => {
    navigate(`/submissions/${formId}`);
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
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant="ghost"
              onClick={handleUndo}
              disabled={!undoState}
              className={cn(
                "rounded-l-md p-2 border-r-0",
                !undoState && "text-muted-foreground cursor-not-allowed"
              )}
              aria-label="Undo"
              title="Undo"
              icon={<Undo size={18} />}
            />
            
            <div className="h-5 w-px bg-border"></div>
            
            <Button
              variant="ghost"
              onClick={handleRedo}
              disabled={!redoState}
              className={cn(
                "rounded-r-md p-2 border-l-0",
                !redoState && "text-muted-foreground cursor-not-allowed"
              )}
              aria-label="Redo"
              title="Redo"
              icon={<Redo size={18} />}
            />
          </div>
          
          <Button
            variant="ghost"
            onClick={onOpenTemplates}
            aria-label="Templates"
            title="Templates"
            icon={<FileText size={18} />}
          />
          
          <Button
            variant="ghost"
            onClick={onOpenSettings}
            aria-label="Form settings"
            title="Form settings"
            icon={<Settings size={18} />}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            aria-label="Preview form"
            className="hidden sm:flex"
            icon={<Eye size={16} />}
          >
            Preview
          </Button>
          
          {form?.isPublished && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewResponses}
              aria-label="View responses"
              className="hidden sm:flex"
              icon={<MessageSquare size={16} />}
            >
              Responses
            </Button>
          )}
          
          <Button
            variant="primary"
            size="sm"
            onClick={handlePublish}
            aria-label={form?.isPublished ? 'Unpublish form' : 'Publish form'}
            icon={<Share size={16} />}
          >
            {form?.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleDelete}
            aria-label="Delete form"
            title="Delete form"
            icon={<Trash size={18} />}
            className="text-destructive hover:bg-destructive/10"
          />
        </div>
      </div>
    </div>
  );
};

export default FormBuilderHeader;