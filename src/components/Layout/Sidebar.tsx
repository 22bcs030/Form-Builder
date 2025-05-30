import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormStore } from '../../stores/formStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const forms = useFormStore(state => state.forms);
  const createForm = useFormStore(state => state.createForm);
  
  const handleCreateForm = () => {
    const newForm = createForm();
    // After creating, the form will be in the store and available in the list
  };
  
  return (
    <aside 
      className={cn(
        "border-r border-border bg-card transition-all duration-300 ease-in-out",
        expanded ? "w-60" : "w-16",
        "hidden md:block"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="p-4 flex justify-between items-center">
          {expanded && <h2 className="font-semibold">Navigation</h2>}
          <button 
            onClick={() => setExpanded(!expanded)}
            className="btn-ghost rounded-full p-1"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform", expanded ? "rotate-180" : "")} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-2">
          <Link
            to="/"
            className={cn(
              "flex items-center px-3 py-2 rounded-md transition-colors",
              location.pathname === '/' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            {expanded && <span className="ml-3">Dashboard</span>}
          </Link>
          
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 py-2">
              {expanded && <h3 className="text-sm font-medium text-muted-foreground">Your Forms</h3>}
              <button
                onClick={handleCreateForm}
                className="btn-ghost rounded-full p-1 text-muted-foreground hover:text-foreground"
                aria-label="Create new form"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-1 mt-1">
              {forms.map(form => (
                <Link
                  key={form.id}
                  to={`/builder/${form.id}`}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    location.pathname === `/builder/${form.id}` 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  {expanded && (
                    <span className="ml-3 truncate">{form.title}</span>
                  )}
                </Link>
              ))}
              
              {forms.length === 0 && expanded && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No forms yet. Create one!
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;