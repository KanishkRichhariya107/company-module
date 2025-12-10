import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App(){
  return (
    <BrowserRouter>
      <nav style={{padding:12}}>
        <Link to="/register" style={{marginRight:12}}>Register</Link>
        <Link to="/login" style={{marginRight:12}}>Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div style={{padding:20}}>Open <Link to="/login">Login</Link></div>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
      </Routes>
    </BrowserRouter>
  );
}
