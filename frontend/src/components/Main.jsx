import React, { useState } from "react";
// import Weather from './Weather';
// import Settings from './Settings';
import icons from "./import/ImportSVG.jsx";
import "../styles/MainPage.scss";

const Main = () => {
  // const [city, setCity] = useState('Москва');

    return (
        <div className="main">
        <div className="main-search">
            <div className="main-search-field" >
                <input className="main-search-field-inp"/>
            </div>
            

            <div className="main-search-btns-bot">
            <icons.MicrophoneB className="micro" />
            <a className="main-search-btns-bot-btn" href="/assistant">
                move
            </a>
            </div>
        </div>
        </div>
    );
};

export default Main;
