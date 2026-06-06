import { Bell, User } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const TopBar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Simple breadcrumb based on path
  const pathName = location.pathname === '/' ? 'Dashboard' :
    location.pathname.substring(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-lg font-medium text-text-primary">
          {pathName || 'Overview'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full text-text-secondary hover:bg-background hover:text-text-primary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 ml-4 border-l border-border pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-text-primary">{user?.name || 'Admin User'}</span>
            <span className="text-xs text-text-secondary capitalize">{user?.role || 'Administrator'}</span>
          </div>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
            title="Logout"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
