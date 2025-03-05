import React, { useState } from 'react';
// import Weather from './Weather';
import Settings from './Settings';
import '../styles/MainPage.scss';

const Main = () => {
    // const [city, setCity] = useState('Москва');

    return (
        <div className="main">
            {/* <Weather city={city} /> */}
            <Settings />
        </div>
    );
};

export default Main;