import { useState, useEffect } from 'react';
import { Users, Building2, Calendar, Bell, Plus, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        setData(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      setTitle('');
      setContent('');
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={data?.stats?.students || 0} icon={<Users size={24} color="#3b82f6" />} delay="0ms" />
        <StatCard title="Total Faculty" value={data?.stats?.faculties || 0} icon={<Users size={24} color="#8b5cf6" />} delay="100ms" />
        <StatCard title="Placement Drives" value={data?.stats?.drives || 0} icon={<Building2 size={24} color="#10b981" />} delay="200ms" />
        <StatCard title="Events" value={data?.stats?.events || 0} icon={<Calendar size={24} color="#f59e0b" />} delay="300ms" />
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 lg:grid-cols-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--accent-primary)" /> Post Announcement
          </h3>
          <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Announcement Title" 
              className="input-field" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <textarea 
              placeholder="Announcement Content" 
              className="input-field" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={content} 
              onChange={e => setContent(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Post Announcement</button>
          </form>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--warning)" /> Manage Announcements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data?.announcements?.map((ann: any) => (
              <div key={ann.id} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{ann.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ann.content}</p>
                </div>
                <button onClick={() => handleDeleteAnnouncement(ann.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, icon, delay }: { title: string, value: number, icon: React.ReactNode, delay: string }) {
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
