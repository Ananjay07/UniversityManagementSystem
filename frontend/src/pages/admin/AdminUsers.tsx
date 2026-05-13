import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function AdminUsers() {
  const [data, setData] = useState<{students: any[], faculties: any[]}>({ students: [], faculties: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'faculties'>('students');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', user_type: 'student', full_name: '', email: '',
    student_id: '', program: '', semester: '', cgpa: '',
    faculty_id: '', department: '', designation: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        setData(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, type: 'student' | 'faculty') => {
    try {
      await fetch(`/api/admin/remove-${type}/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setActiveTab('students')}
            className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
          >
            Students
          </button>
          <button 
            onClick={() => setActiveTab('faculties')}
            className={`btn ${activeTab === 'faculties' ? 'btn-primary' : 'btn-outline'}`}
          >
            Faculty
          </button>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus size={18} /> Add User
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New {formData.user_type === 'student' ? 'Student' : 'Faculty'}</h3>
          <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <select className="input-field" value={formData.user_type} onChange={e => setFormData({...formData, user_type: e.target.value})}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            <input type="text" placeholder="Username (Login ID)" className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            <input type="password" placeholder="Password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <input type="text" placeholder="Full Name" className="input-field" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            <input type="email" placeholder="Email Address" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            
            {formData.user_type === 'student' ? (
              <>
                <input type="text" placeholder="Student ID" className="input-field" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} required />
                <input type="text" placeholder="Program" className="input-field" value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} required />
                <input type="number" placeholder="Semester" className="input-field" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
                <input type="number" step="0.01" placeholder="CGPA" className="input-field" value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: e.target.value})} />
              </>
            ) : (
              <>
                <input type="text" placeholder="Faculty ID" className="input-field" value={formData.faculty_id} onChange={e => setFormData({...formData, faculty_id: e.target.value})} required />
                <input type="text" placeholder="Department" className="input-field" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required />
                <input type="text" placeholder="Designation" className="input-field" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} required />
              </>
            )}
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Create User</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
              {activeTab === 'students' ? (
                <>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Program</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Sem</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>CGPA</th>
                </>
              ) : (
                <>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Department</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Designation</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Email</th>
                </>
              )}
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'students' ? data.students : data.faculties).map((user: any) => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{user.student_id || user.faculty_id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{user.full_name}</td>
                {activeTab === 'students' ? (
                  <>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.program}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.semester}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.cgpa}</td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.department}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.designation}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                  </>
                )}
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleDelete(user.id, activeTab === 'students' ? 'student' : 'faculty')} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
