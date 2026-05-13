import { useState, useEffect } from 'react';
import { Building2, Trash2, Plus } from 'lucide-react';

export default function AdminPlacements() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '', position: '', eligibility_criteria: '', 
    drive_date: '', min_cgpa: '', description: ''
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await fetch('/api/admin/placements');
      if (response.ok) {
        setDrives(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/placements/${id}`, { method: 'DELETE' });
      fetchDrives();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchDrives();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={24} color="var(--accent-primary)" /> Placement Drives
        </h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus size={18} /> Add Drive
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Placement Drive</h3>
          <form onSubmit={handleAddDrive} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <input type="text" placeholder="Company Name" className="input-field" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} required />
            <input type="text" placeholder="Position" className="input-field" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required />
            <input type="text" placeholder="Eligibility Criteria" className="input-field" value={formData.eligibility_criteria} onChange={e => setFormData({...formData, eligibility_criteria: e.target.value})} required />
            <input type="date" className="input-field" value={formData.drive_date} onChange={e => setFormData({...formData, drive_date: e.target.value})} required />
            <input type="number" step="0.01" placeholder="Minimum CGPA" className="input-field" value={formData.min_cgpa} onChange={e => setFormData({...formData, min_cgpa: e.target.value})} required />
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea placeholder="Description" className="input-field" style={{ minHeight: '80px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Save Drive</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {drives.map((drive) => (
          <div key={drive.id} className="glass-card">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{drive.company_name}</h3>
              <button onClick={() => handleDelete(drive.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
            </div>
            <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>{drive.position}</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{drive.description}</p>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <div><strong>Date:</strong> {drive.drive_date}</div>
              <div><strong>Min CGPA:</strong> {drive.min_cgpa}</div>
              <div><strong>Eligibility:</strong> {drive.eligibility_criteria}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
