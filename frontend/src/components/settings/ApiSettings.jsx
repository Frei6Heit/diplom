import React from "react";
import "./Settings.scss";

const ApiSettings = ({ apiSettings, handleApiChange }) => {
    const renderApiInput = (label, field) => (
        <div className="items">
        <div className="items-it">
            <p>{label}</p>
            <div className="items-blc">
            <input
                placeholder="insert"
                value={apiSettings[field]}
                onChange={(e) => handleApiChange(field, e.target.value)}
            />
            <button value="link">link</button>
            </div>
        </div>
        </div>
    );

    return (
        <div className="settings shadow content">
        <div className="head shadow">
            <h1>API</h1>
        </div>
        <div id="api-settings" className="settings-block">
            {renderApiInput("VPN", "vpn")}
            {renderApiInput("assistant", "assistant")}
            {renderApiInput("text correction", "textCorrection")}
        </div>
        </div>
    );
};

export default ApiSettings;
