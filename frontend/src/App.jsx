import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyList from './pages/CompanyList';
import AddCompany from './pages/AddCompany';
import EditCompany from './pages/EditCompany';
import CompanyDetails from './pages/CompanyDetails';

// Layout wrapper to conditionally show Navbar
function Layout({ children, showNavbar = true }) {
  return (
    <>
      {showNavbar && <>{children}</>}
      {!showNavbar && children}
    </>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to companies page */}
        <Route path="/" element={<Navigate to="/companies" replace />} />
        
        {/* Auth Routes - No Navbar */}
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        
        {/* Protected Routes - With Navbar */}
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/companies" element={<CompanyList/>} />
        <Route path="/companies/add" element={<AddCompany/>} />
        <Route path="/companies/:id" element={<CompanyDetails/>} />
        <Route path="/companies/:id/edit" element={<EditCompany/>} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/companies" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
