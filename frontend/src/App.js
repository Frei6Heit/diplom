import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./styles/main.scss";

import TitleBar from './components/TitleBar';
import Auth from './components/Auth';
import Main from './components/Main';
import Settings from './components/settings/Settings';
import Assistant from './components/Assistant';
import Account from './components/Account';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Router>
            <TitleBar />
                <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/main" element={<Main />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/assistant" element={<Assistant />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="*" element={<Auth />} />
                </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
    );
}

export default App;