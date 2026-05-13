import { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle } from 'lucide-react';

export default function FacultyClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attended, setAttended] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/faculty/classes');
      if (response.ok) {
        setClasses(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = async (id: number) => {
    try {
      const response = await fetch(`/api/faculty/mark-attendance/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSubject(data.subject);
        setStudents(data.students);
        setAttended(new Set());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAttendance = (studentId: number) => {
    setAttended(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const submitAttendance = async () => {
    try {
      await fetch(`/api/faculty/mark-attendance/${selectedSubject.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attended: Array.from(attended) })
      });
      setSelectedSubject(null);
      fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (selectedSubject) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedSubject(null)} className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
          &larr; Back to Classes
        </button>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Mark Attendance</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {selectedSubject.subject_code} - {selectedSubject.subject_name}
          </p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Student ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Present?</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{s.student_id}</td>
                  <td style={{ padding: '1rem' }}>{s.full_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="checkbox" 
                      checked={attended.has(s.id)}
                      onChange={() => toggleAttendance(s.id)}
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={submitAttendance} className="btn btn-primary">
            Save Attendance
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your classes and mark student attendance.</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <div key={c.id} className="glass-card animate-fade-in">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} color="var(--accent-primary)" />
              </div>
              <span className="badge badge-primary">{c.subject_code}</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{c.subject_name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <Users size={16} /> Enrolled Students: {c.student_count}
            </div>
            <button onClick={() => handleSelectSubject(c.id)} className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }}>
              <CheckCircle size={16} /> Mark Attendance
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
