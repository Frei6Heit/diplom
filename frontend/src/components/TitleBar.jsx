import React, { useState } from "react";
import "../styles/TitleBar.scss";
import icons from './import/ImportSVG.jsx';
import Burger from './Burger'; // Импортируем компонент Burger
import Settings from './Settings'; // Импортируем компонент Settings

const TitleBar = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    const toggleSettings = () => {
        setSettingsOpen(!isSettingsOpen);
    };

    return (
        <div className="title-bar">
            <div className="burger" onClick={toggleMenu}>
                <icons.Menu />
            </div>

            {isMenuOpen && <Burger />} {/* Отображаем меню, если isMenuOpen равно true */}

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
                    <div onClick={toggleSettings}>
                        <icons.Settings />
                    </div>
                </div>
            </div>

            {isSettingsOpen && <Settings />} {/* Отображаем настройки, если isSettingsOpen равно true */}

            <div className="title-bar-controls">
                <button className="curtail" onClick={() => window.electron.minimize()} />
                <button className="minimize" onClick={() => window.electron.maximize()} />
                <button className="close" onClick={() => window.electron.close()} />
            </div>
        </div>
    );
};

export default TitleBar;