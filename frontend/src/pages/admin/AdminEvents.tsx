import { useState, useEffect } from 'react';
import { Calendar, Trash2, Plus, MapPin } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    event_name: '', event_type: '', event_date: '', 
    location: '', organizer: '', description: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        // Combine upcoming and past events for the admin view
        setEvents([...(data.upcoming || []), ...(data.past || [])].sort((a,b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={24} color="var(--accent-secondary)" /> Events Management
        </h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus size={18} /> Add Event
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Event</h3>
          <form onSubmit={handleAddEvent} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <input type="text" placeholder="Event Name" className="input-field" value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})} required />
            <input type="text" placeholder="Event Type (e.g. Technical, Cultural)" className="input-field" value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})} required />
            <input type="date" className="input-field" value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} required />
            <input type="text" placeholder="Location" className="input-field" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
            <input type="text" placeholder="Organizer" className="input-field" value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} required />
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea placeholder="Description" className="input-field" style={{ minHeight: '80px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Save Event</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="glass-card">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{event.event_name}</h3>
              <button onClick={() => handleDelete(event.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
            </div>
            <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>{event.event_type}</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{event.description}</p>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <div><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> {event.event_date}</div>
              <div><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {event.location}</div>
              <div><strong>Org:</strong> {event.organizer}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
