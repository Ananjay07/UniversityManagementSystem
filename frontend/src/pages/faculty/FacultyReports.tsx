import { useState, useEffect } from 'react';
import { Users, BookMarked, Activity } from 'lucide-react';

export default function FacultyReports() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/faculty/reports');
      if (response.ok) {
        setStudents(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (id: number) => {
    try {
      const response = await fetch(`/api/faculty/student/${id}`);
      if (response.ok) {
        setStudentDetails(await response.json());
        setSelectedStudent(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (selectedStudent && studentDetails) {
    const { student, attendance, assignments } = studentDetails;
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedStudent(null)} className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
          &larr; Back to Student List
        </button>
        
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)', border: '2px solid rgba(59,130,246,0.3)' }}>
              {student.full_name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{student.full_name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>ID: {student.student_id} | {student.program} | Semester {student.semester}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2">
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--success)" /> Attendance Record
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Subject</th>
                  <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((att: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem' }}>{att.subject_name}</td>
                    <td style={{ padding: '0.5rem', color: att.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                      {Math.round(att.percentage)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookMarked size={20} color="var(--warning)" /> Assignments Status
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Title</th>
                  <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((ass: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem' }}>{ass.title}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span className={`badge ${ass.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{ass.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} color="var(--accent-primary)" /> Student Reports
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>View detailed academic reports for all students.</p>
      </div>

      <div className="glass-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Student ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Program</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Semester</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>CGPA</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{student.student_id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{student.full_name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.program}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.semester}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.cgpa}</td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleSelectStudent(student.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                    View Report
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
