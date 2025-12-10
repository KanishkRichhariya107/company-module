import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getToken } from './utils/auth';
import { setAuthToken } from './api/auth';
import './styles.css';
// If token exists set default header on load
const token = getToken();
if(token) setAuthToken(token);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
