import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Events() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    setMessage(null);
    try {
      const response = await fetch('/api/register-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId })
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        await fetchEventsData();
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error registering for event', type: 'error' });
    } finally {
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
        <p style={{ color: 'var(--text-secondary)' }}>Discover and register for campus activities.</p>
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
          <span style={{ color: 'var(--accent-secondary)' }}>●</span> Upcoming Events
        </h2>
        
        <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.upcoming?.map((event: any, idx: number) => {
            const isRegistered = data?.registered?.some((r: any) => r.id === event.id);
            return (
              <div key={event.id} className="glass-card animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{event.event_name}</h3>
                  <span className="badge badge-primary">{event.event_type}</span>
                </div>
                
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '40px' }}>
                  {event.description}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} /> Date: {event.event_date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} /> {event.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} /> Org: {event.organizer}
                  </div>
                </div>
                
                {isRegistered ? (
                  <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }} disabled>
                    <CheckCircle2 size={16} /> Registered
                  </button>
                ) : (
                  <button onClick={() => handleRegister(event.id)} className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent-secondary), #d946ef)' }}>
                    Register for Event
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
