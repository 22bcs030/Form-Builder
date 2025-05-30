import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { AlignLeft, Calendar, Check, List, Mail, Phone, Type, SquareAsterisk, Pilcrow, Hash, Paperclip, Link, Eye, EyeOff } from 'lucide-react';
import { FieldType } from '../../types/form';
import { cn } from '../../utils/cn';

interface FieldsPanelProps {
  onAddField: (fieldType: FieldType) => void;
}

interface DraggableFieldProps {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
  onAddField: (fieldType: FieldType) => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ type, label, icon, onAddField }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `field-${type}`,
    data: {
      type: 'new-field',
      fieldType: type,
    },
  });
  
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border p-3 cursor-grab bg-card transition-all",
        "hover:border-primary/50 hover:shadow-sm",
        isDragging && "opacity-50"
      )}
      onClick={() => onAddField(type)}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
};

const FieldsPanel: React.FC<FieldsPanelProps> = ({ onAddField }) => {
  const fieldTypes = [
    { type: FieldType.TEXT, label: 'Text', icon: <Type size={18} /> },
    { type: FieldType.TEXTAREA, label: 'Text Area', icon: <AlignLeft size={18} /> },
    { type: FieldType.EMAIL, label: 'Email', icon: <Mail size={18} /> },
    { type: FieldType.PASSWORD, label: 'Password', icon: <EyeOff size={18} /> },
    { type: FieldType.NUMBER, label: 'Number', icon: <Hash size={18} /> },
    { type: FieldType.CHECKBOX, label: 'Checkbox', icon: <Check size={18} /> },
    { type: FieldType.RADIO, label: 'Radio', icon: <SquareAsterisk size={18} /> },
    { type: FieldType.SELECT, label: 'Dropdown', icon: <List size={18} /> },
    { type: FieldType.DATE, label: 'Date', icon: <Calendar size={18} /> },
    { type: FieldType.PHONE, label: 'Phone', icon: <Phone size={18} /> },
    { type: FieldType.URL, label: 'URL', icon: <Link size={18} /> },
    { type: FieldType.FILE, label: 'File Upload', icon: <Paperclip size={18} /> },
    { type: FieldType.HIDDEN, label: 'Hidden Field', icon: <Eye size={18} /> },
  ];
  
  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="mb-4 font-medium">Form Elements</h2>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <DraggableField
            key={field.type}
            type={field.type}
            label={field.label}
            icon={field.icon}
            onAddField={onAddField}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Drag and drop elements or click to add to your form.
      </p>
    </div>
  );
};

export default FieldsPanel;