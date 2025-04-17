import React from 'react';
import { AgriTradeProvider } from './context/AgriTrade';
import { AppRouter } from './Router/Router';
import './App.css';

function App() {
  return (
    <AgriTradeProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AgriTradeProvider>
  );
}

export default App;