import React from "react";
import { titleBarIcons } from "./constants";
import "./Settings.scss";


const TitleBarSettings = ({
    titleBarType,
    selectedIcon,
    handleTitleBarSelect,
    handleIconSelect,
    }) => {
    const showTitleBarPicker = titleBarType === "custom";

    const renderIconOption = ({ id, name }) => (
        <div
        key={id}
        className={`icon-option ${selectedIcon == id ? "selected" : ""}`}
        onClick={() => handleIconSelect(id)}
        >
        <span>{name}</span>
        {selectedIcon == id && <span className="checkmark">✓</span>}
        </div>
    );

    return (
        <div id="view-settings" className="settings-block">
        <div className="items">
            <div className="items-it">
            <p>title bar</p>
            <div className="items-blc choice">
                <button
                className={titleBarType === "standard" ? "active" : ""}
                onClick={() => handleTitleBarSelect("standard")}
                >
                standard
                </button>
                <button
                className={titleBarType === "custom" ? "active" : ""}
                onClick={() => handleTitleBarSelect("custom")}
                >
                custom
                </button>
            </div>
            </div>
        </div>

        <div
            className={`picker-container ${
            showTitleBarPicker ? "visible" : "hidden"
            }`}
        >
            <hr />
            <div className="picker-content">
            <div className="icon-selection">
                <div className="icon-grid">
                {titleBarIcons.map((icon) => renderIconOption(icon))}
                </div>
            </div>
            </div>
            <hr />
        </div>
        </div>
    );
};

export default TitleBarSettings;
