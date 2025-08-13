import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Papers from "./pages/Papers";
import AddPaper from "./pages/AddPaper";
import EditPaper from "./pages/EditPaper";
import Services from "./pages/Services";
import AddService from "./pages/AddServices";
import EditService from "./pages/EditServices";
import Events from "./pages/Events";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import FAQ from "./pages/FAQ";
import AddFAQ from "./pages/AddFAQ";
import EditFAQ from "./pages/EditFAQ";
import Testimonials from "./pages/Testimonials";
import AddTestimonial from "./pages/AddTestimonial";
import EditTestimonial from "./pages/EditTestimonial";
import Coupons from "./pages/Coupons";
import About from "./pages/About";
import AddAbout from "./pages/AddAbout";
import EditAbout from "./pages/EditAbout";
import Mission from "./pages/Mission";
import AddMission from "./pages/AddMission";
import EditMission from "./pages/EditMission";
import Vision from "./pages/Vision";
import AddVision from "./pages/AddVision";
import EditVision from "./pages/EditVision";
import Home from "./pages/Home";
import UserList from "./pages/Users/UserList";
import AddUser from "./pages/Users/AddUser";
import UserView from "./pages/Users/UserView";
import EditUser from "./pages/Users/EditUser";
import ServiceOrders from "./pages/ServiceOrders";
import ViewServiceOrder from "./pages/ViewServiceOrder";
import EditServiceOrder from "./pages/EditServiceOrder";
import NewsletterSubscribers from "./pages/Newsletter/NewsletterSubscribers";
import Admins from "./pages/Admins";
import AddAdmin from "./pages/AddAdmin";
import EditAdmin from "./pages/EditAdmin";
import Roles from "./pages/Roles";
import AddRole from "./pages/AddRole";
import EditRole from "./pages/EditRole";
import ChangePassword from "./pages/ChangePassword";
import ContactRequests from "./pages/ContactRequests";
import TicketsManagement from "./pages/TicketsManagement";
import SocialMediaManagement from "./pages/SocialMediaManagement";
import { api } from './lib/api';

// Main App Component with Authentication
const AppContent = () => {
  const { login } = useAuth();

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<Login onLogin={login} />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admins" element={<Admins />} />
        <Route path="admins/add" element={<AddAdmin />} />
        <Route path="admins/edit/:id" element={<EditAdmin />} />
        <Route path="roles" element={<Roles />} />
        <Route path="roles/add" element={<AddRole />} />
        <Route path="roles/edit/:id" element={<EditRole />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="contact-requests" element={<ContactRequests />} />
        <Route path="tickets" element={<TicketsManagement />} />
        <Route path="social-media" element={<SocialMediaManagement />} />
        <Route path="papers" element={<Papers />} />
        <Route path="papers/add" element={<AddPaper />} />
        <Route path="papers/edit/:id" element={<EditPaper />} />
        <Route path="services" element={<Services />} />
        <Route path="services/add" element={<AddService />} />
        <Route path="services/edit/:id" element={<EditService />} />
        <Route path="events" element={<Events />} />
        <Route path="events/add" element={<AddEvent />} />
        <Route path="events/edit/:id" element={<EditEvent />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="faq/add" element={<AddFAQ />} />
        <Route path="faq/edit/:id" element={<EditFAQ />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="testimonials/add" element={<AddTestimonial />} />
        <Route path="testimonials/edit/:id" element={<EditTestimonial />} />
        <Route path="about" element={<About />} />
        <Route path="about/add" element={<AddAbout />} />
        <Route path="about/edit/:id" element={<EditAbout />} />
        <Route path="mission" element={<Mission />} />
        <Route path="mission/add" element={<AddMission />} />
        <Route path="mission/edit/:id" element={<EditMission />} />
        <Route path="vision" element={<Vision />} />
        <Route path="vision/add" element={<AddVision />} />
        <Route path="vision/edit/:id" element={<EditVision />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/add" element={<AddUser />} />
        <Route path="users/view/:id" element={<UserView />} />
        <Route path="users/edit/:id" element={<EditUser />} />
        <Route path="service-orders" element={<ServiceOrders />} />
        <Route path="service-orders/view/:id" element={<ViewServiceOrder />} />
        <Route path="service-orders/edit/:id" element={<EditServiceOrder />} />
        <Route path="newsletter-subscribers" element={<NewsletterSubscribers />} />
  <Route path="coupons" element={<Coupons />} />
        <Route path="home" element={<Home />} />
      </Route>
      
      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    // Track visit - but don't let it crash the app if backend is down
    api.post('/api/track-visitor', {
      page: window.location?.pathname || '/',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
    }).catch(err => {
      console.log("Track visit failed (backend may be down):", err.message);
    });
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;