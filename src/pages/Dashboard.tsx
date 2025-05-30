import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, File, Copy, Eye, FileText, Trash, Filter, Calendar } from 'lucide-react';
import { useFormStore } from '../stores/formStore';
import { cn } from '../utils/cn';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const forms = useFormStore(state => state.forms);
  const createForm = useFormStore(state => state.createForm);
  const deleteForm = useFormStore(state => state.deleteForm);
  
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');
  
  const filteredForms = forms.filter(form => {
    if (filter === 'all') return true;
    if (filter === 'published') return form.isPublished;
    if (filter === 'drafts') return !form.isPublished;
    return true;
  });
  
  const sortedForms = [...filteredForms].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });
  
  const handleCreateForm = () => {
    const newForm = createForm();
    navigate(`/builder/${newForm.id}`);
  };
  
  const handleDuplicateForm = (formId: string) => {
    const formToDuplicate = forms.find(f => f.id === formId);
    if (!formToDuplicate) return;
    
    const newForm = createForm();
    // After creating, navigate to the new form
    navigate(`/builder/${newForm.id}`);
  };
  
  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this form?')) {
      deleteForm(formId);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Forms</h1>
        <button
          onClick={handleCreateForm}
          className="btn-primary btn-default"
        >
          <Plus size={16} className="mr-2" />
          Create Form
        </button>
      </div>
      
      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
            <FileText size={24} />
          </div>
          <h2 className="mb-2 text-lg font-medium">Create your first form</h2>
          <p className="mb-4 max-w-md text-muted-foreground">
            Get started by creating a new form to collect information, feedback, or responses from your audience.
          </p>
          <button
            onClick={handleCreateForm}
            className="btn-primary btn-default"
          >
            <Plus size={16} className="mr-2" />
            Create Form
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-md border border-border bg-card p-1">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "rounded px-3 py-1 text-sm",
                  filter === 'all'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Forms
              </button>
              <button
                onClick={() => setFilter('published')}
                className={cn(
                  "rounded px-3 py-1 text-sm",
                  filter === 'published'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Published
              </button>
              <button
                onClick={() => setFilter('drafts')}
                className={cn(
                  "rounded px-3 py-1 text-sm",
                  filter === 'drafts'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Drafts
              </button>
            </div>
            
            <div className="flex items-center">
              <Filter size={16} className="mr-2 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="form-input py-1 pl-2 pr-8 text-sm"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="name">Form Name</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedForms.map((form) => (
              <Link
                key={form.id}
                to={`/builder/${form.id}`}
                className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium line-clamp-1">{form.title}</h3>
                    <div className={cn(
                      "rounded px-2 py-0.5 text-xs",
                      form.isPublished 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {form.isPublished ? "Published" : "Draft"}
                    </div>
                  </div>
                  
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {form.description || "No description"}
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar size={12} className="mr-1" />
                    Last updated {formatDate(form.updatedAt)}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/preview/${form.id}`);
                      }}
                      className="btn-ghost rounded-md p-2 hover:bg-muted"
                      aria-label="Preview form"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDuplicateForm(form.id);
                      }}
                      className="btn-ghost rounded-md p-2 hover:bg-muted"
                      aria-label="Duplicate form"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteForm(form.id, e)}
                    className="btn-ghost rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete form"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;