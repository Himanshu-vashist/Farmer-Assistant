import { Routes, Route } from 'react-router-dom';
import Farmer from '../components/Farmer';
import Trader from '../components/Trader';
import Home from '../components/Home';
export const AppRouter = () => (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/farmer" element={<Farmer />} />
        <Route path="/trader" element={<Trader />} />
    </Routes>
);
