// TitleBar.jsx
import React from "react";
import "../styles/TitleBar.scss";

import icons from './import/ImportSVG.jsx'

const TitleBar = () => {
    return (
    <div className="title-bar">
        <div className="burger">
            <icons.Menu />
        </div>

        <div className="title-bar-trapezoid">
            <div className="title-bar-content-left">
                <div className="microphone">
                    <icons.Microphone />
                    <icons.MicrophoneSl />
                </div>

                <div className="decoding">
                    <icons.Video />
                    <icons.Voice />
                </div>

                <div className="message">
                    <icons.Message />
                </div>
            </div>

            <div className="title-bar-content-right">
                <icons.Home />
                <icons.Settings />
            </div>


        </div>

        <div className="title-bar-controls">
            <button className="curtail" onClick={() => window.electron.minimize()} />
            <button className="minimize" onClick={() => window.electron.maximize()} />
            <button className="close" onClick={() => window.electron.close()} />
        </div>
    </div>
    );
};

export default TitleBar;
