import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleBasedLayout from "./components/RoleBasedLayout";
import RoleBasedLogin from "./pages/RoleBasedLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import RegularAdminDashboard from "./pages/RegularAdminDashboard";
import { RequireAuth, RequireSuperAdmin, RequireContentAccess } from "./components/RoleBasedProtection";

// Import existing pages (these remain the same)
import Speakers from "./pages/Speakers";
import AddSpeaker from "./pages/AddSpeaker";
import EditSpeaker from "./pages/EditSpeaker";
import Papers from "./pages/Papers";
import AddPaper from "./pages/AddPaper";
import EditPaper from "./pages/EditPaper";
// Journals removed
import Registrations from "./pages/Registrations";
import AddRegistration from "./pages/AddRegistration";
import EditRegistration from "./pages/EditRegistration";
import Services from "./pages/Services";
import AddService from "./pages/AddServices";
import EditService from "./pages/EditServices";
// Conferences removed
import Events from "./pages/Events";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import News from "./pages/News";
import AddNews from "./pages/AddNews";
import EditNews from "./pages/EditNews";
import FAQ from "./pages/FAQ";
import AddFAQ from "./pages/AddFAQ";
import EditFAQ from "./pages/EditFAQ";
import ContactRequests from "./pages/ContactRequests";
import Testimonials from "./pages/Testimonials";
import AddTestimonial from "./pages/AddTestimonial";
import EditTestimonial from "./pages/EditTestimonial";
// Gallery removed
import About from "./pages/About";
import AddAbout from "./pages/AddAbout";
import EditAbout from "./pages/EditAbout";
import Mission from "./pages/Mission";
import AddMission from "./pages/AddMission";
import EditMission from "./pages/EditMission";
import Vision from "./pages/Vision";
import AddVision from "./pages/AddVision";
import EditVision from "./pages/EditVision";

// Super admin only pages
import AddAdmin from "./pages/AddAdmin";
import AdminPowers from "./pages/AdminPowers";
import RolesManagement from "./pages/RolesManagement";
import UserList from "./pages/Users/UserList";
import AddUser from "./pages/Users/AddUser";
import UserView from "./pages/Users/UserView";
import EditUser from "./pages/Users/EditUser";
import Collaborations from "./pages/Collaborations";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<RoleBasedLogin />} />

        {/* Protected routes with layout */}
        <Route path="/*" element={
          <RequireAuth>
            <RoleBasedLayout>
              <Routes>
                {/* Dashboard routes */}
                <Route path="/super-dashboard" element={
                  <RequireSuperAdmin>
                    <SuperAdminDashboard />
                  </RequireSuperAdmin>
                } />
                
                <Route path="/regular-dashboard" element={
                  <RequireContentAccess>
                    <RegularAdminDashboard />
                  </RequireContentAccess>
                } />

                {/* Super Admin Only Routes */}
                <Route path="/users" element={
                  <RequireSuperAdmin>
                    <UserList />
                  </RequireSuperAdmin>
                } />
                <Route path="/users/add" element={
                  <RequireSuperAdmin>
                    <AddUser />
                  </RequireSuperAdmin>
                } />
                <Route path="/users/view/:id" element={
                  <RequireSuperAdmin>
                    <UserView />
                  </RequireSuperAdmin>
                } />
                <Route path="/users/edit/:id" element={
                  <RequireSuperAdmin>
                    <EditUser />
                  </RequireSuperAdmin>
                } />
                <Route path="/admin-powers" element={
                  <RequireSuperAdmin>
                    <AdminPowers />
                  </RequireSuperAdmin>
                } />
                <Route path="/roles" element={
                  <RequireSuperAdmin>
                    <RolesManagement />
                  </RequireSuperAdmin>
                } />
                <Route path="/add-admin" element={
                  <RequireSuperAdmin>
                    <AddAdmin />
                  </RequireSuperAdmin>
                } />
                <Route path="/registrations" element={
                  <RequireSuperAdmin>
                    <Registrations />
                  </RequireSuperAdmin>
                } />
                <Route path="/registrations/add" element={
                  <RequireSuperAdmin>
                    <AddRegistration />
                  </RequireSuperAdmin>
                } />
                <Route path="/registrations/edit/:id" element={
                  <RequireSuperAdmin>
                    <EditRegistration />
                  </RequireSuperAdmin>
                } />

                {/* Content Routes (Both Super Admin and Content Admin) */}
                <Route path="/papers" element={
                  <RequireContentAccess>
                    <Papers />
                  </RequireContentAccess>
                } />
                <Route path="/papers/add" element={
                  <RequireContentAccess>
                    <AddPaper />
                  </RequireContentAccess>
                } />
                <Route path="/papers/edit/:id" element={
                  <RequireContentAccess>
                    <EditPaper />
                  </RequireContentAccess>
                } />

                {/* Journals routes removed */}

                <Route path="/speakers" element={
                  <RequireContentAccess>
                    <Speakers />
                  </RequireContentAccess>
                } />
                <Route path="/speakers/add" element={
                  <RequireContentAccess>
                    <AddSpeaker />
                  </RequireContentAccess>
                } />
                <Route path="/speakers/edit/:id" element={
                  <RequireContentAccess>
                    <EditSpeaker />
                  </RequireContentAccess>
                } />

                {/* Conferences routes removed */}

                <Route path="/events" element={
                  <RequireContentAccess>
                    <Events />
                  </RequireContentAccess>
                } />
                <Route path="/events/add" element={
                  <RequireContentAccess>
                    <AddEvent />
                  </RequireContentAccess>
                } />
                <Route path="/events/edit/:id" element={
                  <RequireContentAccess>
                    <EditEvent />
                  </RequireContentAccess>
                } />

                <Route path="/news" element={
                  <RequireContentAccess>
                    <News />
                  </RequireContentAccess>
                } />
                <Route path="/news/add" element={
                  <RequireContentAccess>
                    <AddNews />
                  </RequireContentAccess>
                } />
                <Route path="/news/edit/:id" element={
                  <RequireContentAccess>
                    <EditNews />
                  </RequireContentAccess>
                } />

                <Route path="/services" element={
                  <RequireContentAccess>
                    <Services />
                  </RequireContentAccess>
                } />
                <Route path="/services/add" element={
                  <RequireContentAccess>
                    <AddService />
                  </RequireContentAccess>
                } />
                <Route path="/services/edit/:id" element={
                  <RequireContentAccess>
                    <EditService />
                  </RequireContentAccess>
                } />

                <Route path="/faq" element={
                  <RequireContentAccess>
                    <FAQ />
                  </RequireContentAccess>
                } />
                <Route path="/faq/add" element={
                  <RequireContentAccess>
                    <AddFAQ />
                  </RequireContentAccess>
                } />
                <Route path="/faq/edit/:id" element={
                  <RequireContentAccess>
                    <EditFAQ />
                  </RequireContentAccess>
                } />

                <Route path="/contact-requests" element={
                  <RequireContentAccess>
                    <ContactRequests />
                  </RequireContentAccess>
                } />

                <Route path="/collaborations" element={
                  <RequireContentAccess>
                    <Collaborations />
                  </RequireContentAccess>
                } />

                <Route path="/testimonials" element={
                  <RequireContentAccess>
                    <Testimonials />
                  </RequireContentAccess>
                } />
                <Route path="/testimonials/add" element={
                  <RequireContentAccess>
                    <AddTestimonial />
                  </RequireContentAccess>
                } />
                <Route path="/testimonials/edit/:id" element={
                  <RequireContentAccess>
                    <EditTestimonial />
                  </RequireContentAccess>
                } />

                {/* Gallery routes removed */}

                <Route path="/about" element={
                  <RequireContentAccess>
                    <About />
                  </RequireContentAccess>
                } />
                <Route path="/about/add" element={
                  <RequireContentAccess>
                    <AddAbout />
                  </RequireContentAccess>
                } />
                <Route path="/about/edit/:id" element={
                  <RequireContentAccess>
                    <EditAbout />
                  </RequireContentAccess>
                } />

                <Route path="/mission" element={
                  <RequireContentAccess>
                    <Mission />
                  </RequireContentAccess>
                } />
                <Route path="/mission/add" element={
                  <RequireContentAccess>
                    <AddMission />
                  </RequireContentAccess>
                } />
                <Route path="/mission/edit/:id" element={
                  <RequireContentAccess>
                    <EditMission />
                  </RequireContentAccess>
                } />

                <Route path="/vision" element={
                  <RequireContentAccess>
                    <Vision />
                  </RequireContentAccess>
                } />
                <Route path="/vision/add" element={
                  <RequireContentAccess>
                    <AddVision />
                  </RequireContentAccess>
                } />
                <Route path="/vision/edit/:id" element={
                  <RequireContentAccess>
                    <EditVision />
                  </RequireContentAccess>
                } />

                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/super-dashboard" replace />} />
                <Route path="/dashboard" element={<Navigate to="/super-dashboard" replace />} />
              </Routes>
            </RoleBasedLayout>
          </RequireAuth>
        } />
      </Routes>
    </AuthProvider>
  );
};

export default App;
