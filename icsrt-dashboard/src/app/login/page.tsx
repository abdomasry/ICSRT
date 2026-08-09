'use client';
import Login from '../../components/Login';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  return <Login onLogin={login} />;
}
