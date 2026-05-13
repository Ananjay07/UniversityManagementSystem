import { useState, useEffect } from 'react';
import { BookMarked, Trash2, Edit2, Plus } from 'lucide-react';

export default function FacultyAssignments() {
  const [data, setData] = useState<{assignments: any[], subjects: any[]}>({ assignments: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null, subject_id: '', title: '', description: '', due_date: '', status: 'pending'
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/faculty/assignments');
      if (response.ok) {
        setData(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/faculty/assignments/${id}`, { method: 'DELETE' });
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await fetch(`/api/faculty/assignments/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/faculty/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setShowForm(false);
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (assignment: any) => {
    setFormData(assignment);
    setShowForm(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookMarked size={24} color="var(--warning)" /> Assignments Management
        </h2>
        <button onClick={() => {
          setFormData({ id: null, subject_id: data.subjects[0]?.id || '', title: '', description: '', due_date: '', status: 'pending' });
          setShowForm(true);
        }} className="btn btn-primary">
          <Plus size={18} /> Add Assignment
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{formData.id ? 'Edit Assignment' : 'Create New Assignment'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            {formData.id ? (
              <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
              </select>
            ) : (
              <select className="input-field" value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} required>
                <option value="">Select Subject</option>
                {data.subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>)}
              </select>
            )}
            
            <input type="text" placeholder="Title" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <input type="date" className="input-field" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} required />
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea placeholder="Description" className="input-field" style={{ minHeight: '80px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">{formData.id ? 'Update' : 'Save'} Assignment</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.assignments.map((assignment) => (
          <div key={assignment.id} className="glass-card">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{assignment.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(assignment)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(assignment.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{assignment.subject_name}</p>
            <span className={`badge ${assignment.status === 'pending' ? 'badge-warning' : 'badge-primary'}`} style={{ marginBottom: '1rem', display: 'inline-block' }}>{assignment.status}</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{assignment.description}</p>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>Due:</strong> {assignment.due_date}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
