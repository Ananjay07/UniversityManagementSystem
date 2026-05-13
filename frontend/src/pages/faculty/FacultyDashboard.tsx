import { useState, useEffect } from 'react';

import { Bell, BookOpen, Users, Briefcase } from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }} className="grid-cols-1 md:grid-cols-3">
        <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} color="#3b82f6" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Department</p>
            <h3 style={{ fontSize: '1.25rem' }}>{data?.faculty?.department || 'N/A'}</h3>
          </div>
        </div>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '100ms', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={24} color="#8b5cf6" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Designation</p>
            <h3 style={{ fontSize: '1.25rem' }}>{data?.faculty?.designation || 'N/A'}</h3>
          </div>
        </div>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '200ms', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#10b981" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Faculty ID</p>
            <h3 style={{ fontSize: '1.25rem' }}>{data?.faculty?.faculty_id || 'N/A'}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card animate-fade-in delay-300">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} color="var(--accent-primary)" /> University Announcements
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
    </>
  );
}
