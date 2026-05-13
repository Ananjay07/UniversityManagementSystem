import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Briefcase, Calendar, 
  LogOut, User, Users, GraduationCap, Building2, Bell
} from 'lucide-react';

export default function Layout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div style={{ 
          width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.3)',
          borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!user) return null;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link to={to} style={{ 
        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', 
        borderRadius: 'var(--radius-md)', 
        background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
        color: isActive ? '#60a5fa' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        transition: 'all 0.2s ease'
      }}>
        <Icon size={20} /> {label}
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside 
        className="glass-panel" 
        style={{ 
          width: '280px', padding: '1.5rem', display: 'flex', flexDirection: 'column',
          borderLeft: 'none', borderTop: 'none', borderBottom: 'none', borderRadius: 0,
          position: 'sticky', top: 0, height: '100vh',
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Nexus Univ</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {user.user_type === 'student' && (
            <>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/academics" icon={BookOpen} label="Academics" />
              <NavItem to="/placements" icon={Briefcase} label="Placements" />
              <NavItem to="/events" icon={Calendar} label="Events" />
              <NavItem to="/profile" icon={User} label="Profile" />
            </>
          )}

          {user.user_type === 'faculty' && (
            <>
              <NavItem to="/faculty/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/faculty/classes" icon={BookOpen} label="Classes & Attendance" />
              <NavItem to="/faculty/assignments" icon={Briefcase} label="Assignments" />
              <NavItem to="/faculty/reports" icon={Users} label="Student Reports" />
              <NavItem to="/profile" icon={User} label="Profile" />
            </>
          )}

          {user.user_type === 'admin' && (
            <>
              <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/admin/users" icon={Users} label="Manage Users" />
              <NavItem to="/admin/placements" icon={Building2} label="Manage Placements" />
              <NavItem to="/admin/events" icon={Calendar} label="Manage Events" />
            </>
          )}
        </nav>

        <div style={{ 
          padding: '1rem', background: 'rgba(15,23,42,0.4)', borderRadius: 'var(--radius-md)',
          marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.full_name}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.user_type}</p>
        </div>

        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', position: 'relative' }}>
        <header className="flex-between" style={{ marginBottom: '2rem', position: 'sticky', top: 0, zIndex: 30, background: 'var(--bg-primary)', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'capitalize' }}>{location.pathname.split('/').pop() || 'Dashboard'}</h1>
          </div>
          <div className="flex-center" style={{ gap: '1rem' }}>
            <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', position: 'relative', cursor: 'pointer' }}>
              <Bell size={18} color="var(--text-secondary)" />
              <span style={{ position: 'absolute', top: '10px', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }}></span>
            </div>
          </div>
        </header>

        <div className="animate-fade-in">
          <Outlet context={{ user }} />
        </div>
      </main>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
