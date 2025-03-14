import React, { useEffect, useState } from 'react';
import "./styles/main.scss";

import TitleBar from './components/TitleBar';
import Auth from './components/Auth'; // Импортируем компонент Auth
import Main from './components/Main';
import Settings from './components/Settings';
import Assistant from './components/Assistant';
import Account from './components/Account';
import Decoding from './components/Decoding';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
    return (
        <Router>
            <TitleBar />
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/main" element={<Main />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/account" element={<Account />} />
                <Route path="/decoding" element={<Decoding />} />
                {/* <Route path="/contact" element={<Contact />} />
                <Route path="/user/:userId" element={<UserProfile />} /> */}
            </Routes>
        </Router>
    );
}

export default App;