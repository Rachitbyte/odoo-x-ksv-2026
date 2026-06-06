import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  ShoppingCart, 
  Receipt, 
  Activity, 
  BarChart2,
  Menu,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Vendors', path: '/vendors', icon: Users },
  { name: 'RFQs', path: '/rfqs', icon: FileText },
  { name: 'Quotations', path: '/quotations', icon: MessageSquare },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare },
  { name: 'Purchase Orders', path: '/po', icon: ShoppingCart },
  { name: 'Invoices', path: '/invoices', icon: Receipt },
  { name: 'Activity Logs', path: '/activity', icon: Activity },
  { name: 'Reports', path: '/reports', icon: BarChart2 },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={clsx(
        "bg-surface border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0",
        collapsed ? "w-20" : "w-[240px]"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && <span className="text-xl font-bold text-primary font-sans">VendorBridge</span>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
        >
          {collapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              )}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
