import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-5xl font-bold">404</h1>
        <h2 className="mb-6 text-2xl font-medium">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline btn-default flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary btn-default flex items-center"
          >
            <Home size={16} className="mr-2" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;