import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Trash, AlertCircle, Search, Filter } from 'lucide-react';
import { useFormStore } from '../stores/formStore';
import { FormSubmission } from '../types/form';

const FormSubmissions: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const getForm = useFormStore(state => state.getForm);
  const getSubmissionsForForm = useFormStore(state => state.getSubmissionsForForm);
  const clearSubmissions = useFormStore(state => state.clearSubmissions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  const form = formId ? getForm(formId) : null;
  const allSubmissions = formId ? getSubmissionsForForm(formId) : [];
  
  const filteredSubmissions = allSubmissions.filter(submission => {
    if (!searchTerm) return true;
    
    // Search through all values in the submission data
    return Object.values(submission.data).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const dateA = new Date(a.submittedAt).getTime();
    const dateB = new Date(b.submittedAt).getTime();
    
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  const handleBackToEditor = () => {
    if (formId) {
      navigate(`/builder/${formId}`);
    }
  };
  
  const handleClearSubmissions = () => {
    if (formId && confirm('Are you sure you want to delete all submissions?')) {
      clearSubmissions(formId);
    }
  };
  
  const handleExportCsv = () => {
    if (!allSubmissions.length) return;
    
    // Get all unique fields across all submissions
    const allFields = new Set<string>();
    allSubmissions.forEach(submission => {
      Object.keys(submission.data).forEach(key => {
        allFields.add(key);
      });
    });
    
    const headers = ['Submission ID', 'Submitted At', ...Array.from(allFields)];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    allSubmissions.forEach(submission => {
      const row = [
        submission.id,
        new Date(submission.submittedAt).toLocaleString(),
        ...Array.from(allFields).map(field => {
          const value = submission.data[field];
          // Handle commas in values by quoting
          return value !== undefined ? `"${String(value).replace(/"/g, '""')}"` : '';
        }),
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${form?.title || 'form'}-submissions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  if (!form) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Form not found</h2>
          <p className="mt-2 text-muted-foreground">
            The form you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary btn-default mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleBackToEditor}
            className="btn-ghost rounded-md p-2"
            aria-label="Back to editor"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="ml-2 text-xl font-bold">
            Submissions: {form.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="btn-outline btn-sm"
            disabled={!allSubmissions.length}
          >
            <Download size={16} className="mr-1" />
            Export CSV
          </button>
          
          <button
            onClick={handleClearSubmissions}
            className="btn-outline btn-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={!allSubmissions.length}
          >
            <Trash size={16} className="mr-1" />
            Clear All
          </button>
        </div>
      </div>
      
      {allSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
            <AlertCircle size={24} />
          </div>
          <h2 className="mb-2 text-lg font-medium">No submissions yet</h2>
          <p className="max-w-md text-muted-foreground">
            When users submit your form, their responses will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-9"
              />
            </div>
            
            <div className="flex items-center">
              <Filter size={16} className="mr-2 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="form-input py-1 pl-2 pr-8"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Submitted At
                    </th>
                    {/* Get field names from the first submission */}
                    {Object.keys(sortedSubmissions[0]?.data || {}).map((field) => (
                      <th
                        key={field}
                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                      >
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-border hover:bg-muted/20"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {submission.id.slice(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {formatDate(submission.submittedAt)}
                      </td>
                      {Object.entries(submission.data).map(([key, value]) => (
                        <td
                          key={`${submission.id}-${key}`}
                          className="px-4 py-3 text-sm"
                        >
                          {typeof value === 'boolean'
                            ? value
                              ? '✓'
                              : '✗'
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {sortedSubmissions.length} of {allSubmissions.length} submissions
          </div>
        </>
      )}
    </div>
  );
};

export default FormSubmissions;