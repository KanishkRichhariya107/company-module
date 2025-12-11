import React, { useState } from 'react';
import { register } from '../api/auth'; // uses the API wrapper shown earlier
import { useNavigate } from 'react-router-dom';
import { saveToken } from '../utils/auth';
import { setAuthToken } from '../api/auth';
import '../styles.css';

export default function Register(){
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    mobile_no: '',
    gender: 'o' // default 'o' (other)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  function change(e){
    setForm(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  function setGender(g){
    setForm(prev => ({...prev, gender: g}));
  }

  async function submit(e){
    e.preventDefault();
    setError('');
    if(!form.full_name || !form.email || !form.password) {
      setError('Please fill required fields');
      return;
    }
    if(form.password !== form.confirm_password){
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try{
      // you may want to remove confirm_password before sending
      const payload = { full_name: form.full_name, email: form.email, password: form.password, mobile_no: form.mobile_no, gender: form.gender };
      const res = await register(payload);
      
      // If registration returns token, save it and navigate to companies
      const token = res.data.data?.token || res.data.token;
      const user = res.data.data?.user || res.data.user;
      
      if(token) {
        saveToken(token);
        setAuthToken(token);
        if(user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        nav('/companies');
      } else {
        // Otherwise go to login
        nav('/login');
      }
    }catch(err){
      setError(err?.response?.data?.message || err.message);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card" role="main">
        <div className="left">
          IMG Placeholder
        </div>
        <div className="right">
          <h1>Register as a Company</h1>

          <form onSubmit={submit}>
            <div className="form-row">
              <label className="label">Full Name</label>
              <input className="input" name="full_name" value={form.full_name} onChange={change} placeholder="Enter Your Full Name" />
            </div>

            <div className="form-row">
              <label className="label">Mobile No</label>
              <input className="input" name="mobile_no" value={form.mobile_no} onChange={change} placeholder="+91 9876543210" />
            </div>

            <div className="form-row">
              <label className="label">Organization Email</label>
              <input className="input" name="email" type="email" value={form.email} onChange={change} placeholder="Official Email" />
            </div>

            <div className="form-row">
              <label className="label">Gender</label>
              <div className="gender-group">
                <button type="button" onClick={()=>setGender('m')} className={`gender-btn ${form.gender==='m' ? 'active':''}`}>Male</button>
                <button type="button" onClick={()=>setGender('f')} className={`gender-btn ${form.gender==='f' ? 'active':''}`}>Female</button>
                <button type="button" onClick={()=>setGender('o')} className={`gender-btn ${form.gender==='o' ? 'active':''}`}>Other</button>
              </div>
            </div>

            <div className="small-row form-row">
              <div style={{flex:1}}>
                <label className="label">Password</label>
                <input className="input" name="password" type="password" value={form.password} onChange={change} />
              </div>
              <div style={{flex:1}}>
                <label className="label">Confirm Password</label>
                <input className="input" name="confirm_password" type="password" value={form.confirm_password} onChange={change} />
              </div>
            </div>

            <div style={{marginTop:8}}>
              <label style={{display:'flex', alignItems:'center', gap:8}}><input type="checkbox" required/> <small style={{color:'#7b8899'}}>I agree to privacy policy</small></label>
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Register'}</button>

            {error && <div className="error">{error}</div>}
            <div className="footer-note">Already have an account? <a href="/login">Login</a></div>
          </form>
        </div>
      </div>
    </div>
  );
}
