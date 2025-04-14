import React from 'react'
import { Routes, Route } from "react-router-dom";
import Assistant from '../components/Assistant';
import Weather from '../components/Weather';
const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Assistant />} />
            <Route path="/weather" element={<Weather />} />
        </Routes>
    )
}

export default Router
