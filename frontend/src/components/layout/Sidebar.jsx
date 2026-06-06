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
  ChevronDown,
  MessageSquare,
  Building2,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const roleNavConfig = {
  admin: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', icon: Users, children: [
        { name: 'All Users', path: '/users' },
        { name: 'Add User', path: '/users/new' }
    ]},
    { name: 'Vendor Management', icon: Building2, children: [
        { name: 'Vendor List', path: '/vendors' },
        { name: 'Add Vendor', path: '/vendors/new' }
    ]},
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart2 },
    { name: 'Activity Logs', path: '/activity', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ],
  officer: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'RFQ Management', icon: FileText, children: [
        { name: 'RFQ List', path: '/rfqs' },
        { name: 'Create RFQ', path: '/rfq/new' }
    ]},
    { name: 'Quotations', icon: MessageSquare, children: [
        { name: 'Received Quotations', path: '/quotations' },
        { name: 'Compare Quotations', path: '/quotations' }
    ]},
    { name: 'Purchase Orders', icon: ShoppingCart, children: [
        { name: 'PO List', path: '/po' }
    ]},
    { name: 'Invoices', icon: Receipt, children: [
        { name: 'Invoice List', path: '/invoices' },
        { name: 'Generate Invoice', path: '/invoices/new' }
    ]},
    { name: 'Activity Logs', path: '/activity', icon: Activity },
    { name: 'Profile', path: '/profile', icon: User },
  ],
  manager: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Approvals', icon: CheckSquare, children: [
        { name: 'Pending Approvals', path: '/approvals' },
        { name: 'Approved Requests', path: '/approvals?status=approved' },
        { name: 'Rejected Requests', path: '/approvals?status=rejected' }
    ]},
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart2 },
    { name: 'Activity Logs', path: '/activity', icon: Activity },
    { name: 'Profile', path: '/profile', icon: User },
  ],
  vendor: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My RFQs', icon: FileText, children: [
        { name: 'Assigned RFQs', path: '/rfqs' }
    ]},
    { name: 'My Quotations', icon: MessageSquare, children: [
        { name: 'Submitted Quotations', path: '/quotations' }
    ]},
    { name: 'Purchase Orders', path: '/po', icon: ShoppingCart },
    { name: 'My Invoices', path: '/invoices', icon: Receipt },
    { name: 'Profile', path: '/profile', icon: User },
  ]
};

const NavItem = ({ item, collapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  
  if (item.children) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "flex items-center justify-between px-3 py-2 rounded-md transition-colors font-medium w-full text-text-secondary hover:bg-background hover:text-text-primary"
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon size={20} className="shrink-0" />}
            {!collapsed && <span className="truncate">{item.name}</span>}
          </div>
          {!collapsed && (
            <ChevronDown size={16} className={clsx("transition-transform", isOpen && "rotate-180")} />
          )}
        </button>
        {isOpen && !collapsed && (
          <div className="flex flex-col gap-1 mt-1 animate-in slide-in-from-top-2 duration-200">
            {item.children.map(child => (
              <NavLink
                key={child.name}
                to={child.path}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm pl-11",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-text-secondary hover:bg-background hover:text-text-primary"
                )}
              >
                <span className="truncate">{child.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => clsx(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-text-secondary hover:bg-background hover:text-text-primary"
      )}
    >
      {Icon && <Icon size={20} className="shrink-0" />}
      {!collapsed && <span className="truncate">{item.name}</span>}
    </NavLink>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const role = user?.role || 'vendor'; // default fallback
  
  const navItems = roleNavConfig[role] || roleNavConfig.vendor;

  return (
    <aside 
      className={clsx(
        "bg-surface border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0",
        collapsed ? "w-20" : "w-[240px]"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        {!collapsed && <span className="text-xl font-bold text-primary font-sans">VendorBridge</span>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
        >
          {collapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} collapsed={collapsed} />
        ))}
      </nav>
      
      <div className="p-4 border-t border-border shrink-0">
        <button 
          onClick={logout}
          className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium w-full text-danger hover:bg-danger/10",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
