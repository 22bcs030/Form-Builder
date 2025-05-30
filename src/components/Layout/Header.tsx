import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFormStore } from '../../stores/formStore';
import { cn } from '../../utils/cn';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const createForm = useFormStore(state => state.createForm);
  
  const handleCreateForm = () => {
    createForm();
  };
  
  return (
    <header className="border-b border-border bg-background px-4 py-3 shadow-sm transition-all-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            className="block md:hidden btn-ghost rounded-full p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-primary">FormBuilder</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn-ghost rounded-full p-2"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button
            onClick={handleCreateForm}
            className={cn(
              "btn-primary hidden sm:flex",
              "btn-sm rounded-md"
            )}
          >
            <Plus size={16} className="mr-1" />
            New Form
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;