import React, { useEffect, useState } from 'react';
import TitleBar from './components/TitleBar';

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
            <header className="App-header">
                <h1>React + Python Desktop App</h1>
                <p>Data from backend: {data}</p>
            </header>
        </div>
    );
}

export default App;