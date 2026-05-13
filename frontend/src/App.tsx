import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Placements from './pages/Placements';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPlacements from './pages/admin/AdminPlacements';
import AdminEvents from './pages/admin/AdminEvents';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyClasses from './pages/faculty/FacultyClasses';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import FacultyReports from './pages/faculty/FacultyReports';

// Student Pages
import Academics from './pages/Academics';
import Events from './pages/Events';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          {/* Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/placements" element={<AdminPlacements />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          
          {/* Faculty Routes */}
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/classes" element={<FacultyClasses />} />
          <Route path="/faculty/assignments" element={<FacultyAssignments />} />
          <Route path="/faculty/reports" element={<FacultyReports />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
