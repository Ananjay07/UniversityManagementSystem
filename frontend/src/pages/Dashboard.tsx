import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, BookMarked, Briefcase, Calendar, Bell, Award } from 'lucide-react';

export default function Dashboard() {
  const { user } = useOutletContext<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '60vh' }}>
        <div style={{ 
          width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.3)',
          borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  const isStudent = user?.user_type === 'student';

  return (
    <>
      <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {isStudent ? (
          <>
            <StatCard 
              title="Attendance" 
              value={data?.attendance_summary?.avg ? `${Math.round(data.attendance_summary.avg)}%` : 'N/A'} 
              icon={<Activity size={24} color="#10b981" />} 
              delay="0ms" 
            />
            <StatCard 
              title="Pending Assignments" 
              value={data?.pending_assignments || 0} 
              icon={<BookMarked size={24} color="#f59e0b" />} 
              delay="100ms" 
            />
            <StatCard 
              title="Eligible Drives" 
              value={data?.eligible_drives || 0} 
              icon={<Briefcase size={24} color="#3b82f6" />} 
              delay="200ms" 
            />
            <StatCard 
              title="Upcoming Events" 
              value={data?.upcoming_events || 0} 
              icon={<Calendar size={24} color="#8b5cf6" />} 
              delay="300ms" 
            />
          </>
        ) : (
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem' }}>Welcome to Nexus University Portal</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You can manage your classes and view announcements here.</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2">
        {/* Announcements */}
        <div className="glass-card animate-fade-in delay-300">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--accent-primary)" /> Recent Announcements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data?.announcements?.map((ann: any) => (
              <div key={ann.id} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{ann.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ann.content}</p>
              </div>
            ))}
            {(!data?.announcements || data.announcements.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent announcements.</p>
            )}
          </div>
        </div>

        {/* Student Specific Info */}
        {isStudent && data?.student && (
          <div className="glass-card animate-fade-in delay-300">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--accent-secondary)" /> Academic Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ProfileItem label="Program" value={data.student.program} />
              <ProfileItem label="Semester" value={`Semester ${data.student.semester}`} />
              <ProfileItem label="Current CGPA" value={data.student.cgpa.toFixed(2)} highlight />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ title, value, icon, delay }: { title: string, value: string | number, icon: React.ReactNode, delay: string }) {
  return (
    <div className="glass-card animate-fade-in" style={{ animationDelay: delay, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ 
        width: '56px', height: '56px', borderRadius: '16px', 
        background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.75rem' }}>{value}</h3>
      </div>
    </div>
  );
}

function ProfileItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 500, color: highlight ? 'var(--accent-primary)' : 'inherit' }}>{value}</span>
    </div>
  );
}
