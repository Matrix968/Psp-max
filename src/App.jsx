import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContexts';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import SolarProjects from './pages/SolarProjects';
import ElectricalProjects from './pages/ElectricalProjects';
import ProjectDetail from './pages/ProjectDetail';
import LearningHub from './pages/LearningHub';
import TopicDetail from './pages/TopicDetail';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import SignUp from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyMessages from './pages/MyMessages';

// Admin Pages
import Dashboard from "./pages/admin/Dashboard"
import AddTopic from './pages/admin/AddTopic';
import AddProject from './pages/admin/AddProject';
import AdminMessages from './pages/admin/AdminMessages';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/solar" element={<SolarProjects />} />
              <Route path="/electrical" element={<ElectricalProjects />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/learn" element={<LearningHub />} />
              <Route path="/learn/:id" element={<TopicDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-messages" element={<MyMessages />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="/admin/topics/new" element={<AdminRoute><AddTopic /></AdminRoute>} />
              <Route path="/admin/projects/new" element={<AdminRoute><AddProject /></AdminRoute>} />
              <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              
              {/* 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;