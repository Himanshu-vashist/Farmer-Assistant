import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AgriTradeProvider } from '../context/AgriTrade.tsx'; // Make sure path is correct

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AgriTradeProvider>
        <App />
      </AgriTradeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
