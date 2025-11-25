import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from './services/auth';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PasswordGenerator from './components/PasswordGenerator';
import SecurityReport from './components/SecurityReport';
import Settings from './components/Settings';
import ImportExport from './components/ImportExport';
import Layout from './components/Layout';

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    // Verificar autenticación cada minuto
    const interval = setInterval(() => {
      setAuthenticated(isAuthenticated());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authenticated ? <Navigate to="/dashboard" /> : <Login onLogin={() => setAuthenticated(true)} />
          }
        />
        <Route
          path="/register"
          element={
            authenticated ? <Navigate to="/dashboard" /> : <Register onRegister={() => setAuthenticated(true)} />
          }
        />
        
        {/* Rutas protegidas */}
        <Route
          element={
            authenticated ? <Layout onLogout={() => setAuthenticated(false)} /> : <Navigate to="/login" />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generator" element={<PasswordGenerator />} />
          <Route path="/security" element={<SecurityReport />} />
          <Route path="/import-export" element={<ImportExport />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
