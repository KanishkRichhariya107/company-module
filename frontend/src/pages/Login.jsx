import React, { useState } from 'react';
import { login, setAuthToken } from '../api/auth';
import { saveToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try{
      const res = await login(form);
      const token = res.data.data?.token || res.data.token;
      const user = res.data.data?.user || res.data.user;
      
      if(!token) throw new Error('No token returned');
      
      saveToken(token);
      setAuthToken(token);
      
      // Save user data to localStorage
      if(user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      nav('/companies');
    }catch(err){
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card" role="main">
        <div className="left">
          IMG Placeholder
        </div>
        <div className="right">
          <h1>Login to Your Account</h1>

          <form onSubmit={onSubmit}>
            <div className="form-row">
              <label className="label">Email</label>
              <input 
                className="input" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={onChange} 
                placeholder="Enter your email" 
                required 
              />
            </div>

            <div className="form-row">
              <label className="label">Password</label>
              <input 
                className="input" 
                name="password" 
                type="password" 
                value={form.password} 
                onChange={onChange} 
                placeholder="Enter your password" 
                required 
              />
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {error && <div className="error">{error}</div>}
            <div className="footer-note">Don't have an account? <a href="/register">Register</a></div>
          </form>
        </div>
      </div>
    </div>
  );
}
