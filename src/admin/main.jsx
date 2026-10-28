import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Crm from './Crm.jsx';
import Login from './Login.jsx';
import './crm.css';

// admin.html atende /login e /admin/crm (rewrites em vercel.json). Nada aqui
// é pré-renderizado: o painel só existe para quem tem sessão.
const isLogin = window.location.pathname.replace(/\/+$/, '') === '/login';
document.title = isLogin ? 'Área da equipe | COUTS' : 'CRM | COUTS';

createRoot(document.getElementById('root')).render(<StrictMode>{isLogin ? <Login /> : <Crm />}</StrictMode>);
