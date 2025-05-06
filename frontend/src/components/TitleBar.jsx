import React, { useState } from "react";
import "../styles/TitleBar.scss";
import icons from './import/ImportSVG.jsx';
import Settings from './settings/Settings'; 

const TitleBar = () => {
    const [isSettingsOpen] = useState(false);

    return (
        <div className="title-bar">
            <div></div>

            <div className="title-bar-trapezoid">
                <div className="title-bar-content-left">

                    <div className="messaget"> 
                        <a href="/assistant" className="mic">
                            <icons.Message />
                        </a>
                    </div>
                </div>

                <div className="title-bar-content-right">
                    <a href="/account">
                        <icons.Home />
                    </a>
                    <a href="/settings">
                        <icons.Settings />
                    </a>
                </div>
            </div>

            {isSettingsOpen && <Settings />}

            <div className="title-bar-controls">
                <button className="curtail" onClick={() => window.electronAPI?.windowControl.minimize()}>
                </button>
                <button className="minimize" onClick={() => window.electronAPI?.windowControl.maximize()}>
                </button>
                <button className="close" onClick={() => window.electronAPI?.windowControl.close()}>
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
