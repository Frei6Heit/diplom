import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./styles/main.scss";
import { ThemeProvider } from '../src/components/settings/ThemeContext';

import TitleBar from './components/TitleBar';
import Auth from './components/Auth';
import Settings from './components/settings/Settings';
import Assistant from './components/Assistant';
import Account from './components/Account';
import Decoding from './components/Decoding';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Router>
            <TitleBar />
            <ThemeProvider>
                <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/assistant" element={<Assistant />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/decoding" element={<Decoding />} />
                    <Route path="*" element={<Auth />} />
                </Routes>
            </ThemeProvider>

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