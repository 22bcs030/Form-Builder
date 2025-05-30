import React from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { FormField, FieldType } from '../../types/form';
import { useFormStore } from '../../stores/formStore';
import FormFieldComponent from './FormField';
import { PlusCircle } from 'lucide-react';

interface FormCanvasProps {
  formId: string;
  currentStepIndex: number;
  onSelectField: (fieldId: string) => void;
  selectedFieldId: string | null;
}

const FormCanvas: React.FC<FormCanvasProps> = ({ 
  formId, 
  currentStepIndex, 
  onSelectField,
  selectedFieldId
}) => {
  const form = useFormStore(state => state.currentForm);
  const addField = useFormStore(state => state.addField);
  const updateField = useFormStore(state => state.updateField);
  const deleteField = useFormStore(state => state.deleteField);
  const reorderFields = useFormStore(state => state.reorderFields);
  
  const [draggedFieldId, setDraggedFieldId] = React.useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  if (!form) return null;
  
  const currentStep = form.steps[currentStepIndex];
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedFieldId(active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = currentStep.fields.findIndex(field => field.id === active.id);
      const newIndex = currentStep.fields.findIndex(field => field.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderFields(currentStep.id, oldIndex, newIndex);
      }
    }
    
    setDraggedFieldId(null);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    // Handle dropping a new field type
    if (active.data.current?.type === 'new-field' && over) {
      const fieldType = active.data.current.fieldType as FieldType;
      const overFieldId = over.id as string;
      
      // Find position to insert the new field
      const overIndex = currentStep.fields.findIndex(field => field.id === overFieldId);
      
      // Add the field at the found position
      addField(currentStep.id, fieldType);
      
      // Prevent further processing
      event.preventDefault();
    }
  };
  
  const handleAddField = (type: FieldType) => {
    addField(currentStep.id, type);
  };
  
  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    updateField(currentStep.id, fieldId, updates);
  };
  
  const handleFieldDelete = (fieldId: string) => {
    deleteField(currentStep.id, fieldId);
    if (selectedFieldId === fieldId) {
      onSelectField('');
    }
  };
  
  return (
    <div className="h-full overflow-y-auto p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="rounded-lg border border-border bg-card/50 p-4 min-h-[300px]">
          {currentStep.fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-2 rounded-full bg-primary/10 p-3 text-primary">
                <PlusCircle size={24} />
              </div>
              <h3 className="mb-1 text-lg font-medium">Add form fields</h3>
              <p className="text-sm text-muted-foreground">
                Drag fields from the panel or click the buttons below to add fields to your form.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleAddField(FieldType.TEXT)}
                  className="btn-outline btn-sm"
                >
                  Add Text Field
                </button>
                <button
                  onClick={() => handleAddField(FieldType.EMAIL)}
                  className="btn-outline btn-sm"
                >
                  Add Email Field
                </button>
              </div>
            </div>
          ) : (
            <SortableContext
              items={currentStep.fields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {currentStep.fields.map(field => (
                  <FormFieldComponent
                    key={field.id}
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    isDragging={draggedFieldId === field.id}
                    onSelect={() => onSelectField(field.id)}
                    onUpdate={(updates) => handleFieldUpdate(field.id, updates)}
                    onDelete={() => handleFieldDelete(field.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default FormCanvas;