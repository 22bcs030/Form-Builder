import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Trash, AlertCircle, Search, Filter, MessageSquare } from 'lucide-react';
import { useFormStore } from '../stores/formStore';
import { FormSubmission } from '../types/form';
import Button from '../components/ui/Button';

const FormSubmissions: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const getForm = useFormStore(state => state.getForm);
  const getSubmissionsForForm = useFormStore(state => state.getSubmissionsForForm);
  const clearSubmissions = useFormStore(state => state.clearSubmissions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const form = formId ? getForm(formId) : null;
  const allSubmissions = formId ? getSubmissionsForForm(formId) : [];
  
  // Get all unique field names across all submissions
  const allFieldNames = React.useMemo(() => {
    const fieldSet = new Set<string>();
    allSubmissions.forEach(submission => {
      Object.keys(submission.data).forEach(key => {
        fieldSet.add(key);
      });
    });
    return Array.from(fieldSet);
  }, [allSubmissions]);
  
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
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  const handleExportCsv = () => {
    if (!allSubmissions.length) return;
    
    try {
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
            // Handle commas and quotes in values by quoting and escaping
            if (value === undefined || value === null) return '';
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
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
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
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
          <Button
            variant="primary"
            size="default"
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={handleBackToEditor}
            aria-label="Back to editor"
            icon={<ChevronLeft size={18} />}
          />
          <h1 className="ml-2 text-xl font-bold flex items-center">
            <MessageSquare size={20} className="mr-2 text-primary" />
            Form Responses: {form.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!allSubmissions.length}
            icon={<Download size={16} />}
          >
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSubmissions}
            disabled={!allSubmissions.length}
            icon={<Trash size={16} />}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-primary/5 border border-primary/10 rounded-md">
        <h2 className="text-sm font-medium">About Form Responses</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This page shows all submissions for your form. When users complete and submit your form, their responses will appear here.
          You can search, filter, and export the data as needed.
        </p>
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
                    {/* Display all field names as columns */}
                    {allFieldNames.map((field) => (
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
                      {/* Display values for each field, or empty cell if no value */}
                      {allFieldNames.map((field) => {
                        const value = submission.data[field];
                        return (
                          <td
                            key={`${submission.id}-${field}`}
                            className="px-4 py-3 text-sm"
                          >
                            {value === undefined ? '' : 
                              typeof value === 'boolean'
                                ? value ? '✓' : '✗'
                                : String(value)
                            }
                          </td>
                        );
                      })}
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