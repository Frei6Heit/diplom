import React, { useEffect, useState } from 'react';
import "./styles/main.scss";

import TitleBar from './components/TitleBar';
import Auth from './components/Auth'; // Импортируем компонент Auth
import Main from './components/Main';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/data')

            .then(response => response.json())
            .then(data => setData(data.message))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <Router>
            <TitleBar />
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/main" element={<Main />} />
                {/* <Route path="/contact" element={<Contact />} />
                <Route path="/user/:userId" element={<UserProfile />} /> */}
            </Routes>
        </Router>
    );
}

export default App;