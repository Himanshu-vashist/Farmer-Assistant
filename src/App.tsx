// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Assistant from "../component/Assistant";
import Home from "../component/Home";
import Farmer from "../component/Farmer";
import Trader from "../component/Trader";

function App() {
  return (
    <>
      <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/assistant" style={{ marginRight: '1rem' }}>Assistant</Link>
        <Link to="/farmer" style={{ marginRight: '1rem' }}>Farmer</Link>
        <Link to="/trader">Trader</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/farmer" element={<Farmer />} />
        <Route path="/trader" element={<Trader />} />
      </Routes>
    </>
  );
}

export default App;
