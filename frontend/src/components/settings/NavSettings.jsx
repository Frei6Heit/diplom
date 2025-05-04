import React, { useState } from "react";
import "../../styles/NavSettings.scss";

const NavSettings = () => {
    return (
        <div className="nav">
            <div className="item">
                <a href="#api-settings">
                    API
                </a>
            </div>

            <div className="item">
                <a href="#view-settings">
                    view
                </a>
            </div>

            <div className="item">
                <a href="#assistant-settings">
                    assistant
                </a>
            </div>

            <div className="item">
                <a href="#lang-settings">
                    language
                </a>
            </div>

            <div className="item">
                <a href="#apps-settings">
                    apps
                </a>
            </div>

            <div className="item">
                <a href="#other-settings">
                    other
                </a>
            </div>
        </div>
    );
};

export default NavSettings;