import React, { useState } from "react";
import "../styles/TitleBar.scss";
import icons from './import/ImportSVG.jsx';
import Burger from './Burger'; // Импортируем компонент Burger
import Settings from './settings/Settings'; // Импортируем компонент Settings

const TitleBar = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    const toggleMenu = () => {
        console.log("Toggle Menu"); // Отладка
        setMenuOpen(!isMenuOpen);
    };

    return (
        <div className="title-bar">
            <button className="burger" onClick={toggleMenu}>
                <icons.Menu />
            </button>

            {isMenuOpen && <Burger />} {/* Отображаем меню, если isMenuOpen равно true */}

            <div className="title-bar-trapezoid">
                <div className="title-bar-content-left">
                    <div className="microphonet">
                        <a className="mic">
                            <icons.Microphone />
                        </a>
                        <icons.MicrophoneSl /> {/* Эта иконка не кликабельна */}

                    </div>

                    <div className="decoding">
                        <a href="/account" className="mic">
                            <icons.Video />
                        </a>
                        <button>
                            <icons.Voice />
                        </button>
                    </div>

                    <div className="messaget"> 
                        <a href="/assistant" className="mic">
                            <icons.Message />
                        </a>
                    </div>
                </div>

                <div className="title-bar-content-right">
                    <a href="/main">
                        <icons.Home />
                    </a>
                    <a href="/settings">
                        <icons.Settings />
                    </a>
                </div>
            </div>

            {isSettingsOpen && <Settings />} {/* Отображаем настройки, если isSettingsOpen равно true */}

            <div className="title-bar-controls">
                <button className="curtail" onClick={() => window.electron?.minimize()}>
                </button>
                <button className="minimize" onClick={() => window.electron?.maximize()}>
                </button>
                <button className="close" onClick={() => window.electron?.close()}>
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
