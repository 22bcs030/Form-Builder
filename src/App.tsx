import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import FormSubmissions from './pages/FormSubmissions';
import PublicForm from './pages/PublicForm';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="builder/:formId?" element={<FormBuilder />} />
        <Route path="preview/:formId" element={<FormPreview />} />
        <Route path="submissions/:formId" element={<FormSubmissions />} />
      </Route>
      <Route path="/form/:formId" element={<PublicForm />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;