# 🎓 University Management System (UMS)

A professional, full-featured **University Management System** designed to streamline academic operations, placement drives, and student-faculty interactions. Built with a **Flask REST API** backend and a modern **React Single Page Application (SPA)** frontend, it offers a robust, high-performance dashboard for students, faculty, and administrators.

---

## 🌐 Live Demo
Check out the live application here: [**University Management System**](https://web-production-0221d.up.railway.app/)

---

## 🚀 Key Features

### 👨‍🎓 Student Portal
- **Dashboard**: Overview of academic progress, upcoming events, and announcements.
- **Academics**: Track courses, attendance, and internal marks.
- **Placement Portal**: View and apply for active placement drives.
- **Events**: Register for university-wide events and workshops.
- **Profile**: Manage personal information and academic records.

### 👩‍🏫 Faculty Portal
- **Class Management**: View assigned classes and student lists.
- **Attendance**: Effortlessly mark and track student attendance.
- **Assignments**: Create, edit, and manage student assignments.
- **Reports**: Generate academic and attendance reports for students.

### 🛠️ Admin Dashboard
- **User Management**: Add or remove students and faculty members.
- **Placement Management**: Create and manage placement drives (add/delete).
- **Event Coordination**: Schedule university events and manage registrations.
- **Announcements**: Post important updates and news to the dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router DOM, Lucide React (Responsive Glassmorphism UI)
- **Backend**: Python (Flask REST API)
- **Database**: SQLite3
- **Deployment**: Railway
- **Environment**: Node.js & Python Virtualenv

---

## 📦 Project Structure

```text
├── app.py              # Main Flask REST API application
├── database/           # SQLite database storage
├── frontend/           # React SPA frontend (Vite, TypeScript)
│   ├── src/            # React components, pages, and hooks
│   ├── package.json    # Frontend dependencies and scripts
│   └── index.html      # React entry HTML
├── requirements.txt    # Python backend dependencies
├── Procfile            # Deployment configuration for Railway
└── README.md           # Project documentation
```

---

## 💻 Setup & Installation

### Backend Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

This project is deployed on **Railway**. You can access it via the [Live Demo](https://web-production-0221d.up.railway.app/) link above.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

---

## 📄 License

This project is licensed under the MIT License.
