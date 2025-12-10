import React, { useState } from 'react';
import { login, setAuthToken } from '../api/auth';
import { saveToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try{
      const res = await login(form);
      const token = res.data.token;
      if(!token) throw new Error('No token returned');
      saveToken(token);
      setAuthToken(token);
      nav('/dashboard');
    }catch(err){
      setMsg(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{maxWidth:420, margin:'40px auto', fontFamily:'sans-serif'}}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div><input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required /></div>
        <div><input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required /></div>
        <button type="submit">Log in</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
