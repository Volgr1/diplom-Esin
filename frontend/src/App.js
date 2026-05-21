import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LotteryDetail from './pages/LotteryDetail';
import AdminPage from './pages/AdminPage';
import AuthCallback from './pages/AuthCallback';
import './App.css';

function App() {
  const [vkUser, setVkUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('vkUser');
    if (saved) {
      setVkUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = useCallback((user) => {
    setVkUser(user);
    localStorage.setItem('vkUser', JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    setVkUser(null);
    localStorage.removeItem('vkUser');
  }, []);

  return (
    <Router>
      <Header vkUser={vkUser} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lottery/:id" element={<LotteryDetail vkUser={vkUser} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;