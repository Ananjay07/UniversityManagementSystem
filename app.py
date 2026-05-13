from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import sqlite3
from datetime import datetime, timedelta
from functools import wraps
import os
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'  # Change this in production!
CORS(app, supports_credentials=True)

DATABASE = 'database/university.db'

def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # This allows us to access columns by name
    return conn

def init_db():
    """Initialize the database with tables and sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Users table (for both students and faculty)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            user_type TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create Students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            student_id TEXT UNIQUE NOT NULL,
            program TEXT NOT NULL,
            semester INTEGER NOT NULL,
            cgpa REAL DEFAULT 0.0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Create Subjects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_code TEXT UNIQUE NOT NULL,
            subject_name TEXT NOT NULL,
            credits INTEGER NOT NULL
        )
    ''')
    
    # Create Attendance table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            subject_id INTEGER,
            total_classes INTEGER DEFAULT 0,
            attended_classes INTEGER DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )
    ''')
    
    # Create Assignments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            due_date DATE NOT NULL,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )
    ''')
    
    # Create Companies table (for placements)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL,
            visit_date DATE NOT NULL,
            position TEXT NOT NULL,
            package TEXT NOT NULL,
            description TEXT
        )
    ''')
    
    # Create Placement Drives table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS placement_drives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL,
            position TEXT NOT NULL,
            eligibility_criteria TEXT NOT NULL,
            drive_date DATE NOT NULL,
            status TEXT DEFAULT 'Open',
            min_cgpa REAL DEFAULT 0.0,
            description TEXT
        )
    ''')
    
    # Create Drive Registrations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS drive_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            drive_id INTEGER,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Registered',
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (drive_id) REFERENCES placement_drives(id),
            UNIQUE(student_id, drive_id)
        )
    ''')
    

    # Create Event Registrations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS event_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            event_id INTEGER,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Registered',
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (event_id) REFERENCES events(id),
            UNIQUE(user_id, event_id)
        )
    ''')

    # Create Events table (university happenings)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_date DATE NOT NULL,
            location TEXT,
            description TEXT,
            organizer TEXT
        )
    ''')
    
    # Create Faculty table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            faculty_id TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            designation TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # Create Announcements table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    
    # Insert sample data
    insert_sample_data(conn)
    
    conn.close()
    print("Database initialized successfully!")

def insert_sample_data(conn):
    """Insert sample data for testing"""
    cursor = conn.cursor()
    
    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        return  # Data already exists
    
    # Insert sample users (students, faculty, admin)
    cursor.execute("""
        INSERT INTO users (username, password, user_type, full_name, email)
        VALUES 
        ('2024001', 'pass123', 'student', 'Alex Johnson', 'alex.j@university.edu'),
        ('2024002', 'pass123', 'student', 'Sarah Williams', 'sarah.w@university.edu'),
        ('faculty1', 'pass123', 'faculty', 'Dr. Robert Smith', 'robert.s@university.edu'),
        ('admin', 'admin123', 'admin', 'System Administrator', 'admin@university.edu')
    """)
    
    # Insert student details
    cursor.execute("""
        INSERT INTO students (user_id, student_id, program, semester, cgpa)
        VALUES 
        (1, '2024001', 'Computer Science', 6, 8.7),
        (2, '2024002', 'Information Technology', 6, 8.3)
    """)

    # Insert subjects
    cursor.execute("""
        INSERT INTO subjects (subject_code, subject_name, credits)
        VALUES 
        ('CS301', 'Data Structures', 4),
        ('CS302', 'Database Management Systems', 4),
        ('CS303', 'Operating Systems', 4),
        ('CS304', 'Computer Networks', 3),
        ('CS305', 'Software Engineering', 3)
    """)
    
    # Insert attendance for student 1
    cursor.execute("""
        INSERT INTO attendance (student_id, subject_id, total_classes, attended_classes)
        VALUES 
        (1, 1, 45, 41),
        (1, 2, 40, 35),
        (1, 3, 38, 32),
        (1, 4, 42, 33),
        (1, 5, 40, 38)
    """)
    
    # Insert assignments
    today = datetime.now()
    cursor.execute("""
        INSERT INTO assignments (subject_id, title, description, due_date, status)
        VALUES 
        (2, 'Database Project', 'Design and implement a library management system', ?, 'pending'),
        (3, 'OS Case Study', 'Analyze process scheduling algorithms', ?, 'pending'),
        (4, 'Network Design', 'Design a campus network topology', ?, 'upcoming')
    """, (
        (today + timedelta(days=9)).strftime('%Y-%m-%d'),
        (today + timedelta(days=12)).strftime('%Y-%m-%d'),
        (today + timedelta(days=17)).strftime('%Y-%m-%d')
    ))
    
    # Insert companies visited
    cursor.execute("""
        INSERT INTO companies (company_name, visit_date, position, package, description)
        VALUES 
        ('TechCorp', '2026-02-10', 'Software Engineer', '$95,000', 'Leading technology company'),
        ('DataSystems Inc', '2026-02-12', 'Data Analyst', '$80,000', 'Data analytics firm'),
        ('CloudNine', '2026-02-14', 'Cloud Engineer', '$105,000', 'Cloud computing solutions'),
        ('AI Solutions', '2026-02-15', 'ML Engineer', '$110,000', 'Artificial Intelligence startup')
    """)
    
    # Insert placement drives
    cursor.execute("""
        INSERT INTO placement_drives (company_name, position, eligibility_criteria, drive_date, status, min_cgpa, description)
        VALUES 
        ('MegaTech', 'Full Stack Developer', 'CGPA > 7.5, No backlogs', '2026-02-20', 'Open', 7.5, 'We are looking for a skilled Full Stack Developer to join our dynamic team. You will prompt be working on cutting-edge technologies and building scalable web applications.'),
        ('FinanceHub', 'Software Developer', 'CGPA > 8.0, Strong coding skills', '2026-02-22', 'Open', 8.0, 'Join our fintech revolution! We need software developers with strong algorithmic skills to build high-performance financial systems.'),
        ('StartupX', 'Backend Engineer', 'CGPA > 7.0, Python/Java', '2026-02-25', 'Open', 7.0, 'Fast-paced startup environment. Looking for backend engineers proficient in Python or Java to build robust APIs.'),
        ('GlobalTech', 'DevOps Engineer', 'CGPA > 7.8, Cloud experience', '2026-03-01', 'Upcoming', 7.8, 'Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with AWS/Azure is a plus.')
    """)
    
    # Insert events
    cursor.execute("""
        INSERT INTO events (event_name, event_type, event_date, location, description, organizer)
        VALUES 
        ('Tech Fest 2026', 'Technical', '2026-03-15', 'Main Auditorium', 'Annual technical festival', 'CSE Department'),
        ('Career Fair', 'Placement', '2026-02-28', 'Sports Complex', 'Meet recruiters from top companies', 'Placement Cell'),
        ('Hackathon', 'Competition', '2026-03-05', 'Computer Lab', '24-hour coding competition', 'Tech Club'),
        ('Cultural Night', 'Cultural', '2026-03-20', 'Open Theater', 'Music, dance, and drama performances', 'Cultural Committee'),
        ('Workshop: Machine Learning', 'Workshop', '2026-02-25', 'Seminar Hall', 'Hands-on ML workshop', 'AI Club'),
        ('Sports Day', 'Sports', '2026-03-10', 'Sports Ground', 'Inter-department sports competition', 'Sports Committee')
    """)
    
    # Insert faculty
    cursor.execute("""
        INSERT INTO faculty (user_id, faculty_id, department, designation)
        VALUES 
        (3, 'FAC2024001', 'Computer Science', 'Professor')
    """)
    
    conn.commit()

# ==================== AUTHENTICATION DECORATOR ====================

from functools import wraps

def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized', 'message': 'Please log in to access this data.'}), 401
        return f(*args, **kwargs)
    return decorated_function

def api_student_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_type' not in session or session['user_type'] != 'student':
            return jsonify({'error': 'Forbidden', 'message': 'This endpoint is only accessible to students.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def api_faculty_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_type' not in session or session['user_type'] != 'faculty':
            return jsonify({'error': 'Forbidden', 'message': 'This endpoint is only accessible to faculty.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def api_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_type' not in session or session['user_type'] != 'admin':
            return jsonify({'error': 'Forbidden', 'message': 'This endpoint is only accessible to admins.'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ==================== API ROUTES ====================

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password)).fetchone()
    conn.close()
    if user:
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['user_type'] = user['user_type']
        session['full_name'] = user['full_name']
        return jsonify({'success': True, 'user': {'id': user['id'], 'username': user['username'], 'user_type': user['user_type'], 'full_name': user['full_name']}})
    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/user', methods=['GET'])
@api_login_required
def api_user():
    return jsonify({'user': {'id': session.get('user_id'), 'username': session.get('username'), 'user_type': session.get('user_type'), 'full_name': session.get('full_name')}})

@app.route('/api/profile', methods=['GET'])
@api_login_required
def api_profile():
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    conn.close()
    return jsonify(dict(user))

@app.route('/api/profile/update', methods=['POST'])
@api_login_required
def api_profile_update():
    data = request.get_json()
    email = data.get('email')
    conn = get_db_connection()
    conn.execute('UPDATE users SET email = ? WHERE id = ?', (email, session['user_id']))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Profile updated'})

@app.route('/api/profile/password', methods=['POST'])
@api_login_required
def api_profile_password():
    data = request.get_json()
    current = data.get('current_password')
    new_pass = data.get('new_password')
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    if user['password'] != current:
        conn.close()
        return jsonify({'success': False, 'message': 'Incorrect current password'}), 400
    conn.execute('UPDATE users SET password = ? WHERE id = ?', (new_pass, session['user_id']))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Password changed'})

@app.route('/api/dashboard', methods=['GET'])
@api_login_required
def api_dashboard():
    conn = get_db_connection()
    announcements = conn.execute('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5').fetchall()
    res = {'announcements': [dict(a) for a in announcements]}
    
    if session['user_type'] == 'student':
        student = conn.execute('SELECT * FROM students WHERE user_id = ?', (session['user_id'],)).fetchone()
        att = conn.execute('SELECT COUNT(*) as total, AVG(CAST(attended_classes AS FLOAT)/total_classes*100) as avg FROM attendance WHERE student_id = ?', (student['id'],)).fetchone()
        pend = conn.execute("SELECT COUNT(*) as c FROM assignments WHERE status='pending' AND due_date >= date('now')").fetchone()
        elig = conn.execute("SELECT COUNT(*) as c FROM placement_drives WHERE status='Open' AND min_cgpa <= ?", (student['cgpa'],)).fetchone()
        upc = conn.execute("SELECT COUNT(*) as c FROM events WHERE event_date >= date('now')").fetchone()
        
        res.update({
            'student': dict(student),
            'attendance_summary': dict(att) if att else None,
            'pending_assignments': pend['c'] if pend else 0,
            'eligible_drives': elig['c'] if elig else 0,
            'upcoming_events': upc['c'] if upc else 0
        })
    elif session['user_type'] == 'faculty':
        fac = conn.execute('SELECT * FROM faculty WHERE user_id = ?', (session['user_id'],)).fetchone()
        res['faculty'] = dict(fac) if fac else None
    elif session['user_type'] == 'admin':
        st_c = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
        fa_c = conn.execute('SELECT COUNT(*) FROM faculty').fetchone()[0]
        dr_c = conn.execute('SELECT COUNT(*) FROM placement_drives').fetchone()[0]
        ev_c = conn.execute('SELECT COUNT(*) FROM events').fetchone()[0]
        res.update({'stats': {'students': st_c, 'faculties': fa_c, 'drives': dr_c, 'events': ev_c}})
        
    conn.close()
    return jsonify(res)

@app.route('/api/academics', methods=['GET'])
@api_login_required
@api_student_required
def api_academics():
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE user_id = ?', (session['user_id'],)).fetchone()
    att = conn.execute('''
        SELECT s.subject_name, s.subject_code, a.total_classes, a.attended_classes, 
        CAST(a.attended_classes AS FLOAT)/a.total_classes*100 as percentage
        FROM attendance a JOIN subjects s ON a.subject_id = s.id WHERE a.student_id = ?
    ''', (student['id'],)).fetchall()
    ass = conn.execute('''
        SELECT a.id, a.title, a.description, a.due_date, a.status, s.subject_name
        FROM assignments a JOIN subjects s ON a.subject_id = s.id
        WHERE a.due_date >= date('now') ORDER BY a.due_date ASC
    ''').fetchall()
    conn.close()
    return jsonify({'attendance': [dict(x) for x in att], 'assignments': [dict(x) for x in ass]})

@app.route('/api/placements', methods=['GET'])
@api_login_required
@api_student_required
def api_placements():
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE user_id = ?', (session['user_id'],)).fetchone()
    comp = conn.execute('SELECT * FROM companies ORDER BY visit_date DESC LIMIT 10').fetchall()
    reg = conn.execute('''SELECT pd.*, dr.registration_date, dr.status as reg_status FROM placement_drives pd
        JOIN drive_registrations dr ON pd.id = dr.drive_id WHERE dr.student_id = ? ORDER BY pd.drive_date ASC''', (student['id'],)).fetchall()
    elig = conn.execute('''SELECT * FROM placement_drives WHERE min_cgpa <= ? AND status='Open' 
        AND id NOT IN (SELECT drive_id FROM drive_registrations WHERE student_id=?) ORDER BY drive_date ASC''', (student['cgpa'], student['id'])).fetchall()
    conn.close()
    return jsonify({'companies': [dict(x) for x in comp], 'registered_drives': [dict(x) for x in reg], 'eligible_drives': [dict(x) for x in elig]})

@app.route('/api/apply-drive', methods=['POST'])
@api_login_required
@api_student_required
def api_apply_drive():
    drive_id = request.get_json().get('drive_id')
    conn = get_db_connection()
    student = conn.execute('SELECT id FROM students WHERE user_id=?', (session['user_id'],)).fetchone()
    ex = conn.execute('SELECT * FROM drive_registrations WHERE student_id=? AND drive_id=?', (student['id'], drive_id)).fetchone()
    if ex:
        conn.close()
        return jsonify({'success': False, 'message': 'Already registered'}), 400
    conn.execute('INSERT INTO drive_registrations (student_id, drive_id) VALUES (?, ?)', (student['id'], drive_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Registered successfully'})

@app.route('/api/events', methods=['GET'])
@api_login_required
def api_events():
    conn = get_db_connection()
    upc = conn.execute("SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC").fetchall()
    past = conn.execute("SELECT * FROM events WHERE event_date < date('now') ORDER BY event_date DESC LIMIT 5").fetchall()
    reg = conn.execute('''SELECT e.*, er.registration_date FROM events e JOIN event_registrations er ON e.id=er.event_id 
        WHERE er.user_id=? ORDER BY er.registration_date DESC''', (session['user_id'],)).fetchall()
    conn.close()
    return jsonify({'upcoming': [dict(x) for x in upc], 'past': [dict(x) for x in past], 'registered': [dict(x) for x in reg]})

@app.route('/api/register-event', methods=['POST'])
@api_login_required
def api_register_event():
    event_id = request.get_json().get('event_id')
    conn = get_db_connection()
    ex = conn.execute('SELECT * FROM event_registrations WHERE user_id=? AND event_id=?', (session['user_id'], event_id)).fetchone()
    if ex:
        conn.close()
        return jsonify({'success': False, 'message': 'Already registered'}), 400
    conn.execute('INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)', (session['user_id'], event_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Registered successfully'})

# ADMIN ROUTES
@app.route('/api/admin/users', methods=['GET'])
@api_login_required
@api_admin_required
def api_admin_users():
    conn = get_db_connection()
    students = conn.execute('SELECT s.id, u.full_name, s.student_id, s.program, s.semester, s.cgpa FROM students s JOIN users u ON s.user_id = u.id').fetchall()
    faculties = conn.execute('SELECT f.id, u.full_name, f.faculty_id, f.department, f.designation, u.email FROM faculty f JOIN users u ON f.user_id = u.id').fetchall()
    conn.close()
    return jsonify({'students': [dict(x) for x in students], 'faculties': [dict(x) for x in faculties]})

@app.route('/api/admin/add-user', methods=['POST'])
@api_login_required
@api_admin_required
def api_admin_add_user():
    d = request.get_json()
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password, user_type, full_name, email) VALUES (?, ?, ?, ?, ?)",
                       (d['username'], d['password'], d['user_type'], d['full_name'], d.get('email')))
        uid = cursor.lastrowid
        if d['user_type'] == 'student':
            cursor.execute("INSERT INTO students (user_id, student_id, program, semester, cgpa) VALUES (?, ?, ?, ?, ?)",
                           (uid, d['student_id'], d['program'], d['semester'], d.get('cgpa', 0.0)))
        elif d['user_type'] == 'faculty':
            cursor.execute("INSERT INTO faculty (user_id, faculty_id, department, designation) VALUES (?, ?, ?, ?)",
                           (uid, d['faculty_id'], d['department'], d['designation']))
        conn.commit()
        return jsonify({'success': True, 'message': 'User added'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Username or ID already exists'}), 400
    finally:
        conn.close()

@app.route('/api/admin/remove-student/<int:sid>', methods=['DELETE'])
@api_login_required
@api_admin_required
def api_admin_del_student(sid):
    conn = get_db_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT user_id FROM students WHERE id=?", (sid,)).fetchone()
    if row:
        uid = row['user_id']
        cursor.execute("DELETE FROM attendance WHERE student_id=?", (sid,))
        cursor.execute("DELETE FROM drive_registrations WHERE student_id=?", (sid,))
        cursor.execute("DELETE FROM event_registrations WHERE user_id=?", (uid,))
        cursor.execute("DELETE FROM students WHERE id=?", (sid,))
        cursor.execute("DELETE FROM users WHERE id=?", (uid,))
        conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/remove-faculty/<int:fid>', methods=['DELETE'])
@api_login_required
@api_admin_required
def api_admin_del_faculty(fid):
    conn = get_db_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT user_id FROM faculty WHERE id=?", (fid,)).fetchone()
    if row:
        uid = row['user_id']
        cursor.execute("DELETE FROM event_registrations WHERE user_id=?", (uid,))
        cursor.execute("DELETE FROM faculty WHERE id=?", (fid,))
        cursor.execute("DELETE FROM users WHERE id=?", (uid,))
        conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/placements', methods=['GET', 'POST'])
@api_login_required
@api_admin_required
def api_admin_placements():
    conn = get_db_connection()
    if request.method == 'GET':
        drives = conn.execute("SELECT * FROM placement_drives ORDER BY drive_date ASC").fetchall()
        conn.close()
        return jsonify([dict(x) for x in drives])
    elif request.method == 'POST':
        d = request.get_json()
        conn.execute("INSERT INTO placement_drives (company_name, position, eligibility_criteria, drive_date, min_cgpa, description) VALUES (?, ?, ?, ?, ?, ?)",
            (d['company_name'], d['position'], d['eligibility_criteria'], d['drive_date'], d['min_cgpa'], d['description']))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/admin/placements/<int:did>', methods=['DELETE'])
@api_login_required
@api_admin_required
def api_admin_del_placement(did):
    conn = get_db_connection()
    conn.execute("DELETE FROM placement_drives WHERE id=?", (did,))
    conn.execute("DELETE FROM drive_registrations WHERE drive_id=?", (did,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/events', methods=['POST'])
@api_login_required
@api_admin_required
def api_admin_add_event():
    d = request.get_json()
    conn = get_db_connection()
    conn.execute("INSERT INTO events (event_name, event_type, event_date, location, description, organizer) VALUES (?, ?, ?, ?, ?, ?)",
        (d['event_name'], d['event_type'], d['event_date'], d['location'], d['description'], d['organizer']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/events/<int:eid>', methods=['DELETE'])
@api_login_required
@api_admin_required
def api_admin_del_event(eid):
    conn = get_db_connection()
    conn.execute("DELETE FROM events WHERE id=?", (eid,))
    conn.execute("DELETE FROM event_registrations WHERE event_id=?", (eid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/announcements', methods=['POST'])
@api_login_required
@api_admin_required
def api_admin_add_ann():
    d = request.get_json()
    conn = get_db_connection()
    conn.execute("INSERT INTO announcements (title, content) VALUES (?, ?)", (d['title'], d['content']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/announcements/<int:aid>', methods=['DELETE'])
@api_login_required
@api_admin_required
def api_admin_del_ann(aid):
    conn = get_db_connection()
    conn.execute("DELETE FROM announcements WHERE id=?", (aid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# FACULTY ROUTES
@app.route('/api/faculty/classes', methods=['GET'])
@api_login_required
@api_faculty_required
def api_fac_classes():
    conn = get_db_connection()
    classes = conn.execute('''SELECT s.id, s.subject_code, s.subject_name, s.credits, COUNT(DISTINCT st.id) as student_count
        FROM subjects s LEFT JOIN attendance a ON s.id = a.subject_id LEFT JOIN students st ON a.student_id = st.id GROUP BY s.id''').fetchall()
    conn.close()
    return jsonify([dict(x) for x in classes])

@app.route('/api/faculty/mark-attendance/<int:sid>', methods=['GET', 'POST'])
@api_login_required
@api_faculty_required
def api_fac_mark_att(sid):
    conn = get_db_connection()
    if request.method == 'GET':
        subject = conn.execute('SELECT * FROM subjects WHERE id=?', (sid,)).fetchone()
        students = conn.execute('''SELECT s.id, s.student_id, u.full_name, s.program, s.semester, COALESCE(a.total_classes, 0) as total_classes,
            COALESCE(a.attended_classes, 0) as attended_classes, a.id as attendance_id FROM students s JOIN users u ON s.user_id = u.id
            LEFT JOIN attendance a ON s.id = a.student_id AND a.subject_id = ? ORDER BY u.full_name''', (sid,)).fetchall()
        conn.close()
        return jsonify({'subject': dict(subject), 'students': [dict(x) for x in students]})
    elif request.method == 'POST':
        d = request.get_json()
        attended = d.get('attended', [])
        students = conn.execute('SELECT s.id, a.id as attendance_id FROM students s LEFT JOIN attendance a ON s.id = a.student_id AND a.subject_id = ?', (sid,)).fetchall()
        cursor = conn.cursor()
        for st in students:
            is_present = st['id'] in attended
            if st['attendance_id']:
                cursor.execute('UPDATE attendance SET total_classes = total_classes + 1, attended_classes = attended_classes + ? WHERE id = ?', (1 if is_present else 0, st['attendance_id']))
            else:
                cursor.execute('INSERT INTO attendance (student_id, subject_id, total_classes, attended_classes) VALUES (?, ?, 1, ?)', (st['id'], sid, 1 if is_present else 0))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/faculty/assignments', methods=['GET', 'POST'])
@api_login_required
@api_faculty_required
def api_fac_ass():
    conn = get_db_connection()
    if request.method == 'GET':
        ass = conn.execute('SELECT a.id, a.title, a.description, a.due_date, a.status, s.subject_name, s.subject_code FROM assignments a JOIN subjects s ON a.subject_id = s.id ORDER BY a.due_date DESC').fetchall()
        subs = conn.execute('SELECT id, subject_name, subject_code FROM subjects').fetchall()
        conn.close()
        return jsonify({'assignments': [dict(x) for x in ass], 'subjects': [dict(x) for x in subs]})
    elif request.method == 'POST':
        d = request.get_json()
        conn.execute("INSERT INTO assignments (subject_id, title, description, due_date, status) VALUES (?, ?, ?, ?, 'pending')",
            (d['subject_id'], d['title'], d['description'], d['due_date']))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/faculty/assignments/<int:aid>', methods=['PUT', 'DELETE'])
@api_login_required
@api_faculty_required
def api_fac_ass_mod(aid):
    conn = get_db_connection()
    if request.method == 'PUT':
        d = request.get_json()
        conn.execute('UPDATE assignments SET title=?, description=?, due_date=?, status=? WHERE id=?', (d['title'], d['description'], d['due_date'], d['status'], aid))
        conn.commit()
        res = {'success': True}
    elif request.method == 'DELETE':
        conn.execute('DELETE FROM assignments WHERE id=?', (aid,))
        conn.commit()
        res = {'success': True}
    conn.close()
    return jsonify(res)

@app.route('/api/faculty/reports', methods=['GET'])
@api_login_required
@api_faculty_required
def api_fac_reports():
    conn = get_db_connection()
    st = conn.execute('SELECT s.id, s.student_id, u.full_name, s.program, s.semester, s.cgpa, u.email FROM students s JOIN users u ON s.user_id = u.id ORDER BY u.full_name').fetchall()
    conn.close()
    return jsonify([dict(x) for x in st])

@app.route('/api/faculty/student/<int:sid>', methods=['GET'])
@api_login_required
@api_faculty_required
def api_fac_student_det(sid):
    conn = get_db_connection()
    student = conn.execute('SELECT s.id, s.student_id, u.full_name, s.program, s.semester, s.cgpa, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id=?', (sid,)).fetchone()
    att = conn.execute('SELECT s.subject_name, s.subject_code, a.total_classes, a.attended_classes, CAST(a.attended_classes AS FLOAT)/a.total_classes*100 as percentage FROM attendance a JOIN subjects s ON a.subject_id = s.id WHERE a.student_id=?', (sid,)).fetchall()
    ass = conn.execute('SELECT a.title, s.subject_name, a.due_date, a.status FROM assignments a JOIN subjects s ON a.subject_id = s.id ORDER BY a.due_date DESC').fetchall()
    conn.close()
    return jsonify({'student': dict(student), 'attendance': [dict(x) for x in att], 'assignments': [dict(x) for x in ass]})

# ==================== INITIALIZE DATABASE ON FIRST RUN ====================

if not os.path.exists('database'):
    os.makedirs('database')

if not os.path.exists(DATABASE):
    init_db()

# ==================== RUN APPLICATION ====================

if __name__ == '__main__':
    app.run(debug=True)
