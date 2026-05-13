import { useState, useEffect } from 'react';

import { Building2, CheckCircle2, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

export default function Placements() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<number | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchPlacementsData();
  }, []);

  const fetchPlacementsData = async () => {
    try {
      const response = await fetch('/api/placements');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching placements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId: number) => {
    setApplyingTo(driveId);
    setMessage(null);
    try {
      const response = await fetch('/api/apply-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drive_id: driveId })
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        await fetchPlacementsData();
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred while applying.', type: 'error' });
    } finally {
      setApplyingTo(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '60vh' }}>
        <div style={{ 
          width: '40px', height: '40px', border: '3px solid rgba(139,92,246,0.3)',
          borderTopColor: 'var(--accent-secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Discover and apply to top companies hiring on campus.</p>
      </div>

      {message && (
        <div className="animate-fade-in" style={{ 
          padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#fca5a5'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--success)' }}>●</span> Eligible Drives
        </h2>
        
        <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.eligible_drives?.map((drive: any, idx: number) => (
            <div key={drive.id} className="glass-card animate-fade-in" style={{ animationDelay: `${idx * 100}ms`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{drive.company_name}</h3>
                  <span className="badge badge-primary">{drive.position}</span>
                </div>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Building2 size={20} color="var(--text-secondary)" />
                </div>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                {drive.description || drive.eligibility_criteria}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <Calendar size={16} /> Drive Date: {drive.drive_date}
              </div>
              
              <button 
                onClick={() => handleApply(drive.id)}
                disabled={applyingTo === drive.id}
                className="btn btn-primary" 
                style={{ width: '100%' }}
              >
                {applyingTo === drive.id ? 'Applying...' : 'Apply Now'} <ArrowRight size={16} />
              </button>
            </div>
          ))}
          
          {(!data?.eligible_drives || data.eligible_drives.length === 0) && (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No eligible drives available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} color="var(--accent-secondary)" /> Applied Drives
        </h2>
        
        <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Company</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Position</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Applied Date</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.registered_drives?.map((drive: any) => (
                <tr key={drive.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{drive.company_name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{drive.position}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(drive.registration_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge badge-success">{drive.reg_status || 'Registered'}</span>
                  </td>
                </tr>
              ))}
              {(!data?.registered_drives || data.registered_drives.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    You haven't applied to any drives yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
