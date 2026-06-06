import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, CheckSquare, ShoppingCart,
  Receipt, Activity, BarChart2, ChevronDown, MessageSquare,
  Building2, Settings, User, LogOut, X, ChevronLeft, Menu,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleNavConfig = {
  admin: [
    { name: 'Dashboard',        path: '/dashboard',  icon: LayoutDashboard },
    { name: 'User Management',  path: '/users',       icon: Users },
    {
      name: 'Vendor Management', icon: Building2,
      children: [
        { name: 'Vendor List', path: '/vendors' },
        { name: 'Add Vendor',  path: '/vendors/new' },
      ]
    },
    { name: 'Reports & Analytics', path: '/reports',  icon: BarChart2 },
    { name: 'Activity Logs',    path: '/activity',   icon: Activity },
    { name: 'Settings',         path: '/settings',   icon: Settings },
    { name: 'Profile',          path: '/profile',    icon: User },
  ],
  officer: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'RFQ Management', icon: FileText,
      children: [
        { name: 'RFQ List',   path: '/rfqs' },
        { name: 'Create RFQ', path: '/rfq/new' },
      ]
    },
    {
      name: 'Quotations', icon: MessageSquare,
      children: [
        { name: 'Received Quotations', path: '/quotations' },
      ]
    },
    {
      name: 'Purchase Orders', icon: ShoppingCart,
      children: [
        { name: 'PO List', path: '/po' },
      ]
    },
    {
      name: 'Invoices', icon: Receipt,
      children: [
        { name: 'Invoice List', path: '/invoices' },
      ]
    },
    { name: 'Activity Logs', path: '/activity', icon: Activity },
    { name: 'Settings',      path: '/settings', icon: Settings },
    { name: 'Profile',       path: '/profile',  icon: User },
  ],
  manager: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Approvals', icon: CheckSquare,
      children: [
        { name: 'Pending Approvals',   path: '/approvals' },
        { name: 'Approved Requests',   path: '/approvals?status=approved' },
        { name: 'Rejected Requests',   path: '/approvals?status=rejected' },
      ]
    },
    { name: 'Reports & Analytics', path: '/reports',  icon: BarChart2 },
    { name: 'Activity Logs',       path: '/activity', icon: Activity },
    { name: 'Settings',            path: '/settings', icon: Settings },
    { name: 'Profile',             path: '/profile',  icon: User },
  ],
  vendor: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'My RFQs', icon: FileText,
      children: [
        { name: 'Assigned RFQs', path: '/rfqs' },
      ]
    },
    {
      name: 'My Quotations', icon: MessageSquare,
      children: [
        { name: 'Submitted Quotations', path: '/quotations' },
      ]
    },
    { name: 'Purchase Orders', path: '/po',       icon: ShoppingCart },
    { name: 'My Invoices',     path: '/invoices', icon: Receipt },
    { name: 'Settings',        path: '/settings', icon: Settings },
    { name: 'Profile',         path: '/profile',  icon: User },
  ],
};

/* ── Group Item (expandable) ─────────────────────────────── */
const GroupItem = ({ item, collapsed }) => {
  const location = useLocation();
  const isChildActive = item.children?.some(c => location.pathname === c.path || location.pathname + location.search === c.path);
  const [open, setOpen] = useState(isChildActive);
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        title={collapsed ? item.name : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '10px',
          padding: collapsed ? '9px 10px' : '9px 12px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 500,
          color: isChildActive ? 'var(--primary)' : 'var(--txt-2)',
          backgroundColor: isChildActive ? 'var(--primary-m)' : 'transparent',
          border: '1.5px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={e => { if (!isChildActive) { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--txt)'; }}}
        onMouseLeave={e => { if (!isChildActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--txt-2)'; }}}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {Icon && <Icon size={18} style={{ flexShrink: 0 }} />}
          {!collapsed && <span style={{ truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</span>}
        </div>
        {!collapsed && (
          <ChevronDown
            size={14}
            style={{
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {open && !collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
          {item.children.map(child => (
            <NavLink
              key={child.name}
              to={child.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-child-item active' : 'sidebar-child-item'
              }
              end
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '999px',
                  backgroundColor: 'currentColor',
                  opacity: 0.5,
                  flexShrink: 0,
                }}
              />
              {child.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Link Item ────────────────────────────────────────────── */
const LinkItem = ({ item, collapsed }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'
      }
      style={collapsed ? { justifyContent: 'center', padding: '9px 10px' } : {}}
    >
      {Icon && <Icon size={18} style={{ flexShrink: 0 }} />}
      {!collapsed && <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.name}</span>}
    </NavLink>
  );
};

/* ── Sidebar ──────────────────────────────────────────────── */
const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const role = user?.role || 'vendor';
  const navItems = roleNavConfig[role] || roleNavConfig.vendor;

  const sidebarWidth = collapsed ? '72px' : '260px';

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          backgroundColor: 'var(--surface)',
          borderRight: '1.5px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
        className="hidden lg:flex"
      >
        <SidebarInner
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          navItems={navItems}
          user={user}
          logout={logout}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: 'var(--surface)',
          borderRight: '1.5px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
        className="lg:hidden"
      >
        <SidebarInner
          collapsed={false}
          setCollapsed={() => {}}
          navItems={navItems}
          user={user}
          logout={logout}
          showClose
          onClose={onClose}
        />
      </aside>
    </>
  );
};

const SidebarInner = ({ collapsed, setCollapsed, navItems, user, logout, showClose, onClose }) => (
  <>
    {/* Brand header */}
    <div style={{
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'space-between',
      padding: collapsed ? '0 10px' : '0 16px',
      borderBottom: '1.5px solid var(--border)',
      flexShrink: 0,
    }}>
      {!collapsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '17px',
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
          }}>
            VendorBridge
          </span>
        </div>
      )}
      {collapsed && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          backgroundColor: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={16} color="white" />
        </div>
      )}
      {showClose ? (
        <button onClick={onClose} style={{ color: 'var(--txt-2)', cursor: 'pointer', padding: '4px' }}>
          <X size={18} />
        </button>
      ) : (
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            color: 'var(--txt-2)', cursor: 'pointer', padding: '4px',
            borderRadius: '6px', border: 'none', background: 'none',
            display: 'flex', alignItems: 'center',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav style={{
      flex: 1,
      padding: collapsed ? '12px 8px' : '12px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {navItems.map(item =>
        item.children ? (
          <GroupItem key={item.name} item={item} collapsed={collapsed} />
        ) : (
          <LinkItem key={item.name} item={item} collapsed={collapsed} />
        )
      )}
    </nav>

    {/* User footer */}
    <div style={{
      padding: collapsed ? '12px 8px' : '12px 10px',
      borderTop: '1.5px solid var(--border)',
      flexShrink: 0,
    }}>
      {!collapsed && user && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 12px', borderRadius: '10px',
          backgroundColor: 'var(--surface-2)',
          marginBottom: '6px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '999px',
            backgroundColor: 'var(--primary-m)',
            color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '13px', flexShrink: 0,
          }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--txt)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.name}
            </div>
            <div style={{
              fontSize: '11px', color: 'var(--txt-m)', textTransform: 'capitalize',
            }}>
              {user.role}
            </div>
          </div>
        </div>
      )}
      <button
        onClick={logout}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '10px', padding: collapsed ? '9px 10px' : '9px 12px',
          borderRadius: '10px', border: '1.5px solid transparent',
          cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          color: 'var(--danger)', backgroundColor: 'transparent',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        title={collapsed ? 'Logout' : undefined}
      >
        <LogOut size={16} style={{ flexShrink: 0 }} />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  </>
);

export default Sidebar;
