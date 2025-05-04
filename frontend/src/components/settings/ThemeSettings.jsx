import React from "react";
import { colorVariables } from "./constants";
import "./Settings.scss";

const ThemeSettings = ({
    theme = "white",
    colors = {},
    onThemeSelect,       // Синхронизировано с Settings.jsx
    onColorChange,       // Синхронизировано с Settings.jsx
    checkContrast = () => false,
    getContrastColor = () => '#000000',
}) => {
    const safeColors = {
        'primary-color': '#ffffff',
        'secondary-color': '#000000',
        ...colors
    };

    const showColorPicker = theme === "custom";
    const showPreview = theme === "custom";
    const contrastWarning = checkContrast(
        safeColors["primary-color"],
        safeColors["secondary-color"]
    );

    const renderThemeButton = (type, label) => (
        <button
            className={theme === type ? "active" : ""}
            onClick={() => onThemeSelect(type)}  // Используем onThemeSelect
        >
            {label}
        </button>
    );

    const renderColorPickers = () => (
        <div className="color-inputs-grid">
            {colorVariables.map((variable) => (
                <div key={variable.name} className="color-input-group">
                    <input
                        type="color"
                        value={safeColors[variable.name] || "#ffffff"}
                        onChange={(e) => onColorChange(variable.name, e.target.value)} // Используем onColorChange
                        aria-label={`Select ${variable.label} color`}
                    />
                    <input
                        value={safeColors[variable.name] || ""}
                        className="color-input"
                        onChange={(e) => onColorChange(variable.name, e.target.value)} // Используем onColorChange
                    />
                    <label>{variable.label}</label>
                </div>
            ))}
        </div>
    );


    return (
        <div id="view-settings" className="settings-block">
            <div className="items">
                <div className="items-it">
                    <p>theme</p>
                    <div className="items-blc choice">
                        {renderThemeButton("white", "white")}
                        {renderThemeButton("black", "black")}
                        {renderThemeButton("custom", "custom")}
                    </div>
                </div>
            </div>

            <div className={`picker-container ${showColorPicker ? "visible" : "hidden"}`}>
                <hr />
                <div className="picker-content">{renderColorPickers()}</div>
                <hr />
            </div>

            {showPreview && (
                <div className="color-preview-sidebar">
                    <div className="preview-header">preview the color scheme</div>
                    {contrastWarning && (
                        <div className="contrast-warning">
                            ⚠️ low contrast between colors
                        </div>
                    )}
                    <div className="preview-colors">
                        <div
                            className="preview-primary"
                            style={{ backgroundColor: safeColors["primary-color"] }}
                        >
                            primary: {safeColors["primary-color"]}
                        </div>
                        <div
                            className="preview-secondary"
                            style={{
                                backgroundColor: safeColors["secondary-color"],
                                color: getContrastColor(safeColors["secondary-color"]),
                            }}
                        >
                            secondary: {safeColors["secondary-color"]}
                        </div>
                    </div>
                    <div className="preview-elements">
                        <button className="example-button">example of a button</button>
                        <div className="example-card">
                            <h3>example of a card</h3>
                            <p>text of the cards with a demonstration of colors</p>
                        </div>
                        <div className="example-text">
                            example of a text with a selected color scheme
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSettings;