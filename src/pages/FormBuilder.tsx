import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SplitPane } from 'react-multi-split-pane';
import { FieldType } from '../types/form';
import { useFormStore } from '../stores/formStore';

import FormBuilderHeader from '../components/FormBuilder/FormBuilderHeader';
import FormSteps from '../components/FormBuilder/FormSteps';
import FormCanvas from '../components/FormBuilder/FormCanvas';
import FieldsPanel from '../components/FormBuilder/FieldsPanel';
import PropertiesPanel from '../components/FormBuilder/PropertiesPanel';
import SettingsPanel from '../components/FormBuilder/SettingsPanel';
import TemplatesPanel from '../components/FormBuilder/TemplatesPanel';

const FormBuilder: React.FC = () => {
  const { formId } = useParams<{ formId?: string }>();
  const navigate = useNavigate();
  
  const forms = useFormStore(state => state.forms);
  const getForm = useFormStore(state => state.getForm);
  const createForm = useFormStore(state => state.createForm);
  const setCurrentForm = useFormStore(state => state.setCurrentForm);
  const addField = useFormStore(state => state.addField);
  const saveToHistory = useFormStore(state => state.saveToHistory);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const form = useFormStore(state => state.currentForm);
  
  useEffect(() => {
    // If no formId, create a new form
    if (!formId) {
      const newForm = createForm();
      navigate(`/builder/${newForm.id}`, { replace: true });
      return;
    }
    
    // Load the form if it exists
    const foundForm = getForm(formId);
    if (foundForm) {
      setCurrentForm(foundForm);
      // Initialize history with current form state
      setTimeout(() => {
        saveToHistory();
      }, 0);
    } else if (forms.length > 0) {
      // If formId doesn't exist but we have other forms, redirect to the first one
      navigate(`/builder/${forms[0].id}`, { replace: true });
    } else {
      // If no forms exist at all, create a new one
      const newForm = createForm();
      navigate(`/builder/${newForm.id}`, { replace: true });
    }
    
    return () => {
      // Clean up
      setCurrentForm(null);
    };
  }, [formId, forms]);
  
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
  
  const handleDragStart = (event: DragStartEvent) => {
    // Handle drag start logic
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    // Handle dropping a new field type
    if (active.data.current?.type === 'new-field' && over) {
      const fieldType = active.data.current.fieldType as FieldType;
      const currentStep = form?.steps[currentStepIndex];
      
      if (currentStep) {
        addField(currentStep.id, fieldType);
      }
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    // Handle drag end logic
  };
  
  const handleAddField = (fieldType: FieldType) => {
    if (!form) return;
    
    const currentStep = form.steps[currentStepIndex];
    addField(currentStep.id, fieldType);
  };
  
  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index);
    setSelectedFieldId(null);
  };
  
  const handleSelectField = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };
  
  if (!form || !formId) return <div>Loading...</div>;
  
  return (
    <div className="flex h-full flex-col">
      <FormBuilderHeader 
        formId={formId} 
        onOpenSettings={() => setShowSettings(true)}
        onOpenTemplates={() => setShowTemplates(true)}
      />
      
      <FormSteps 
        formId={formId}
        currentStepIndex={currentStepIndex}
        onSelectStep={handleSelectStep}
      />
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-border">
            <FieldsPanel onAddField={handleAddField} />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <FormCanvas 
              formId={formId}
              currentStepIndex={currentStepIndex}
              onSelectField={handleSelectField}
              selectedFieldId={selectedFieldId}
            />
          </div>
          
          <div className="w-80 border-l border-border">
            <PropertiesPanel 
              stepId={form.steps[currentStepIndex].id}
              fieldId={selectedFieldId}
            />
          </div>
        </div>
      </DndContext>
      
      {showSettings && (
        <SettingsPanel
          formId={formId}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showTemplates && (
        <TemplatesPanel
          formId={formId}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default FormBuilder;