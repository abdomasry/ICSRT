import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context providers
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

// Page components
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import UserRegister from './pages/UserRegister';
import UserTickets from './pages/UserTickets';
import UserServiceOrdersNew from './pages/UserServiceOrdersNew';
import Services from './pages/Services';
import Articles from './pages/Articles';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmailVerification from './pages/EmailVerification';
import PhoneInputDemo from './pages/PhoneInputDemo';
import CountryCodeDemo from './pages/CountryCodeDemo';
import PurchasePage from './pages/PurchasePage';
import PaymobTest from './pages/PaymobTest';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserPayments from './pages/UserPayments';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">ICSRT</h1>
            <p className="text-lg text-gray-600 mb-4">International Conference on Science, Research & Technology</p>
            <p className="text-red-500 mb-4">Something went wrong. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <div className="App">
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/user-dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/register" element={<UserRegister />} />
                  <Route path="/tickets" element={<UserTickets />} />
                  <Route path="/service-orders" element={<UserServiceOrdersNew />} />
                  <Route path="/payments" element={<UserPayments />} />
                  <Route path="/purchase/:token" element={<PurchasePage />} />
                  <Route path="/test-payment" element={<PaymobTest />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/phone-demo" element={<PhoneInputDemo />} />
                  <Route path="/country-demo" element={<CountryCodeDemo />} />
                </Route>
              </Routes>
            </div>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
