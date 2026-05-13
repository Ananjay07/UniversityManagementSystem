import { useState, useEffect } from 'react';

import { Activity, BookMarked } from 'lucide-react';

export default function Academics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicsData();
  }, []);

  const fetchAcademicsData = async () => {
    try {
      const response = await fetch('/api/academics');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching academics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '60vh' }}>
        <div style={{ 
          width: '40px', height: '40px', border: '3px solid rgba(16,185,129,0.3)',
          borderTopColor: 'var(--success)', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Track your attendance and assignments.</p>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--success)" /> Attendance Overview
        </h2>
        
        <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Subject Code</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Subject Name</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Classes Held</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Attended</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data?.attendance?.map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{item.subject_code}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{item.subject_name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{item.total_classes}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{item.attended_classes}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', width: `${item.percentage}%`, 
                          background: item.percentage >= 75 ? 'var(--success)' : item.percentage >= 60 ? 'var(--warning)' : 'var(--danger)'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: item.percentage >= 75 ? 'var(--success)' : item.percentage >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                        {Math.round(item.percentage)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.attendance || data.attendance.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookMarked size={20} color="var(--warning)" /> Pending Assignments
        </h2>
        
        <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.assignments?.map((assignment: any, idx: number) => (
            <div key={assignment.id} className="glass-card animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem' }}>{assignment.title}</h3>
                <span className={`badge ${assignment.status === 'pending' ? 'badge-warning' : 'badge-primary'}`}>{assignment.status}</span>
              </div>
              <p style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{assignment.subject_name}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {assignment.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--danger)' }}>
                <Activity size={16} /> Due: {assignment.due_date}
              </div>
            </div>
          ))}
          {(!data?.assignments || data.assignments.length === 0) && (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No pending assignments. Great job!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
