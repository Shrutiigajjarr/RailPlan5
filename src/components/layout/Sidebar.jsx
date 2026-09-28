import React from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
  Calendar, 
  CheckSquare, 
  Cpu, 
  Building2, 
  Bell
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, requests } = useRailPlan();
  const location = useLocation();

  if (!currentUser) return null;

  const isControl = currentUser.role === 'CONTROL';
  const deptPrefix = currentUser.portalPath || '/engineering';

  // Dynamic counts
  const deptRequests = requests.filter(r => r.department === currentUser.department);
  const pendingControlCount = requests.filter(r => r.status === 'Submitted' || r.status === 'Under Review' || r.status === 'Pending Approval').length;
  const conflictControlCount = requests.filter(r => r.status === 'Conflict Detected').length;

  const controlLinks = [
    { to: '/control', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/control/requests', label: 'Requests', icon: ListFilter, badge: pendingControlCount > 0 ? pendingControlCount : null, badgeColor: 'bg-white/20 text-white' },
    { to: '/control/planning', label: 'Planning Board', icon: Calendar, badge: conflictControlCount > 0 ? `${conflictControlCount} Alerts` : null, badgeColor: 'bg-red-500/80 text-white' },
    { to: '/control/approved', label: 'Approved Blocks', icon: CheckSquare },
  ];

  const deptLinks = [
    { to: deptPrefix, label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: `${deptPrefix}/requests`, label: 'Requests', icon: ListFilter, badge: deptRequests.length > 0 ? deptRequests.length : null, badgeColor: 'bg-white/20 text-white' },
    { to: `${deptPrefix}/requests/new`, label: 'New Request', icon: PlusCircle, highlight: true },
  ];

  const currentLinks = isControl ? controlLinks : deptLinks;

  return (
    <aside className="w-64 bg-[#12345B] border-r border-[#12345B] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-75px)]">
      
      {/* Context Banner */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          {isControl ? (
            <>
              <Cpu className="w-4 h-4 text-white" />
              <span>Central Planning</span>
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4 text-white" />
              <span>{currentUser.department}</span>
            </>
          )}
        </div>
        <p className="text-[11px] text-slate-300 font-semibold mt-1 truncate">
          {currentUser.name}
        </p>
        <p className="text-[10px] text-slate-400 truncate">
          {currentUser.title}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {currentLinks.map(link => {
          const IconComponent = link.icon;
          const isActive = link.exact 
            ? location.pathname === link.to 
            : location.pathname.startsWith(link.to);

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-white/10 text-white font-bold'
                  : link.highlight 
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'hover:bg-white/5 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </div>
              
              {link.badge && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${link.badgeColor}`}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-white/10 bg-black/10 text-[11px] text-slate-400 space-y-0.5">
        <p className="font-semibold text-slate-300">Western Railway</p>
        <p className="text-[10px] text-slate-400/80">Ahmedabad Division (ADI)</p>
      </div>
    </aside>
  );
};

export default Sidebar;
