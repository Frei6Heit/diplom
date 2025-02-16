import React, { useEffect, useState } from 'react';
import "./styles/main.scss";
import TitleBar from './components/TitleBar';
import Auth from './components/Auth'; // Импортируем компонент Main

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/data')
            .then(response => response.json())
            .then(data => setData(data.message))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div className="App">
            <TitleBar />
            <Auth />
            {/* {data && <p>Данные с сервера: {data}</p>} Отображаем данные, если они есть */}
        </div>
    );
}

export default App;