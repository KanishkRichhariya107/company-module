import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../api/auth';
import { getToken, removeToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard(){
  const [data, setData] = useState(null);
  const nav = useNavigate();

  useEffect(()=>{
    const t = getToken();
    if(!t){ nav('/login'); return; }
    setAuthToken(t);
    // example protected call: you can create /api/auth/me if needed
    api.get('/auth/me').then(r=> setData(r.data)).catch(err=>{
      console.error(err);
      removeToken();
      nav('/login');
    });
  }, []);

  const logout = ()=>{
    removeToken();
    setAuthToken(null);
    nav('/login');
  };

  return (
    <div style={{maxWidth:720, margin:'40px auto', fontFamily:'sans-serif'}}>
      <h2>Dashboard</h2>
      <button onClick={logout}>Logout</button>
      <pre>{data ? JSON.stringify(data, null, 2) : 'Loading...'}</pre>
    </div>
  );
}
