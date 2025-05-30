import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FormField as FormFieldType, FieldType } from '../../types/form';

interface FormFieldProps {
  field: FormFieldType;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormFieldType>) => void;
  onDelete: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  field,
  isSelected,
  isDragging,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const renderFieldPreview = () => {
    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.PASSWORD:
      case FieldType.URL:
      case FieldType.PHONE:
      case FieldType.NUMBER:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="form-input"
            disabled
          />
        );
      case FieldType.TEXTAREA:
        return (
          <textarea
            placeholder={field.placeholder}
            rows={3}
            className="form-input"
            disabled
          />
        );
      case FieldType.SELECT:
        return (
          <select className="form-input" disabled>
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case FieldType.CHECKBOX:
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              disabled
            />
            <span className="ml-2 text-sm">
              {field.label}
            </span>
          </div>
        );
      case FieldType.RADIO:
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 border-input text-primary focus:ring-primary"
                  disabled
                />
                <span className="ml-2 text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        );
      case FieldType.DATE:
        return (
          <input
            type="date"
            className="form-input"
            disabled
          />
        );
      case FieldType.FILE:
        return (
          <input
            type="file"
            className="form-input"
            disabled
          />
        );
      default:
        return <div>Unsupported field type</div>;
    }
  };
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ label: e.target.value });
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border bg-background p-4 transition-all",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {field.type !== FieldType.CHECKBOX && (
            <div className="mb-2">
              <input
                type="text"
                value={field.label}
                onChange={handleLabelChange}
                className="bg-transparent font-medium w-full focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                onClick={(e) => e.stopPropagation()}
              />
              {field.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
              {field.helpText && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {field.helpText}
                </p>
              )}
            </div>
          )}
          <div>{renderFieldPreview()}</div>
        </div>
        
        <div className="ml-2 flex items-start space-x-1">
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete field"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormField;