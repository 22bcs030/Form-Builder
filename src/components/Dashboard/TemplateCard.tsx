import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { FormTemplate } from '../../types/form';
import { useFormStore } from '../../stores/formStore';

interface TemplateCardProps {
  template: FormTemplate;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const navigate = useNavigate();
  const loadTemplate = useFormStore(state => state.loadTemplate);
  
  const handleUseTemplate = () => {
    const newForm = loadTemplate(template.id);
    if (newForm && newForm.id) {
      navigate(`/builder/${newForm.id}`);
    }
  };
  
  return (
    <div 
      className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow cursor-pointer"
      onClick={handleUseTemplate}
    >
      <div>
        <div className="mb-2 flex items-center">
          <FileText size={18} className="mr-2 text-primary" />
          <h3 className="font-medium">{template.name}</h3>
        </div>
        
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </div>
      
      <button className="btn-outline btn-sm w-full">
        Use Template
      </button>
    </div>
  );
};

export default TemplateCard; 