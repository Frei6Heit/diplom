import React, { useState } from 'react';
import Weather from './Weather';
import Settings from './Settings';
import '../styles/MainPage.scss';

const Main = () => {
    const [city, setCity] = useState('');

    return (
        <div className="main">
            <Weather city={city} />
            <Settings setCity={setCity} />
        </div>
    );
};

export default Main;