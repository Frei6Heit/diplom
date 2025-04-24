
import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import "../styles/Settings.scss";
import NavSettings from "../components/dop_func/NavSettings.jsx";

const titleBarIcons = [
    { id: 1, name: "microphone"},
    { id: 2, name: "voice assistant"},
    { id: 3, name: "text assistant"},
    { id: 4, name: "decoding"},
    { id: 5, name: "account"},
    { id: 6, name: "settings"},
    { id: 7, name: "main page"},
    { id: 8, name: "device control"},
    { id: 9, name: "search info"},
    { id: 10, name: "VPN"},

    ];

    const Settings = () => {
    // Theme states
    const [theme, setTheme] = useState(
        () => localStorage.getItem("selectedTheme") || ""
    );
    const [colors, setColors] = useState(() => ({
        primary: localStorage.getItem("primaryColor") || "#DD9090",
        secondary: localStorage.getItem("secondaryColor") || "#723A3A",
    }));
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [contrastWarning, setContrastWarning] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Title bar states
    const [titleBarType, setTitleBarType] = useState(
        () => localStorage.getItem("titleBarType") || "standard"
    );
    const [showTitleBarPicker, setShowTitleBarPicker] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(
        () => localStorage.getItem("selectedIcon") || titleBarIcons[0].id
    );

    // API states
    const [apiSettings, setApiSettings] = useState({
        vpn: localStorage.getItem("api_vpn") || "",
        assistant: localStorage.getItem("api_assistant") || "",
        textCorrection: localStorage.getItem("api_text_correction") || "",
    });

    // Helper functions
    const getContrastColor = (hexColor) => {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    };

    const checkContrast = useCallback((primary, secondary) => {
        const getLuminance = (hex) => {
        const rgb = parseInt(hex.substring(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        return Math.abs(getLuminance(primary) - getLuminance(secondary)) < 120;
    }, []);

    const updateColors = useCallback(
        debounce((newColors) => {
        document.documentElement.style.setProperty(
            "--primary-color",
            newColors.primary
        );
        document.documentElement.style.setProperty(
            "--secondary-color",
            newColors.secondary
        );
        setContrastWarning(checkContrast(newColors.primary, newColors.secondary));
        }, 300),
        []
    );

    // Handlers
    const handleApiChange = (field, value) => {
        const newSettings = { ...apiSettings, [field]: value };
        setApiSettings(newSettings);
        localStorage.setItem(`api_${field}`, value);
    };

    const handleThemeSelect = (selectedTheme) => {
        const isCustom = selectedTheme === "custom";
        const newTheme = theme === selectedTheme ? "" : selectedTheme;

        setTheme(newTheme);
        setShowColorPicker(isCustom && newTheme === "custom");
        setShowPreview(isCustom && newTheme === "custom");

        if (newTheme) localStorage.setItem("selectedTheme", newTheme);
        else localStorage.removeItem("selectedTheme");

        if (selectedTheme === "white") {
        handleColorChange("primary", "#DD9090");
        handleColorChange("secondary", "#723A3A");
        } else if (selectedTheme === "black") {
        handleColorChange("primary", "#333333");
        handleColorChange("secondary", "#000000");
        }
    };

    const handleColorChange = (type, value) => {
        const newColors = { ...colors, [type]: value };
        setColors(newColors);
        localStorage.setItem(`${type}Color`, value);
        updateColors(newColors);
    };

    const handleTitleBarSelect = (type) => {
        const isCustom = type === "custom";
        const newType = titleBarType === type ? "standard" : type;

        setTitleBarType(newType);
        setShowTitleBarPicker(isCustom && newType === "custom");

        if (newType === "custom") localStorage.setItem("titleBarType", newType);
        else localStorage.removeItem("titleBarType");
    };

    const handleIconSelect = (iconId) => {
        setSelectedIcon(iconId);
        localStorage.setItem("selectedIcon", iconId);
    };

    // Effects
    useEffect(() => {
        updateColors(colors);
        setContrastWarning(checkContrast(colors.primary, colors.secondary));
        setShowPreview(theme === "custom");
        return () => updateColors.cancel();
    }, [colors, theme, updateColors, checkContrast]);

    // Render helpers
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

    const renderThemeButton = (type, label) => (
        <button
        className={theme === type ? "active" : ""}
        onClick={() => handleThemeSelect(type)}
        >
        {label}
        </button>
    );

    const renderColorPicker = (type, label) => (
        <div className="color-input-group">
        <input
            type="color"
            value={colors[type]}
            onChange={(e) => handleColorChange(type, e.target.value)}
            aria-label={`Select ${label} color`}
        />
        <input
            value={colors[type]}
            className="color-input"
            onChange={(e) => handleColorChange(type, e.target.value)}
        />
        <label>{label}</label>
        </div>
    );

    const renderIconOption = ({ id, icon, name }) => (
        <div
        key={id}
        className={`icon-option ${selectedIcon == id ? "selected" : ""}`}
        onClick={() => handleIconSelect(id)}
        >
        <span className="icon">{icon}</span>
        <span>{name}</span>
        </div>
    );

    return (
        <>
        <NavSettings />

        <div className="settings-container">
            <div className="settings-content">
            {/* API Block */}
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

            {/* View Block */}
            <div className="view-section">
                <div className="settings shadow content">
                    <div className="head shadow">
                    <h1>view</h1>
                    </div>
                {/* Theme Section */}
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

                    <div
                    className={`picker-container ${
                        showColorPicker ? "visible" : "hidden"
                    }`}
                    >
                    <hr />
                    <div className="items-color">
                        {renderColorPicker("primary", "primary")}
                        {renderColorPicker("secondary", "secondary")}
                    </div>
                    <hr />
                    </div>
                </div>

                {/* Title Bar Section */}
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
                    <div className="items-color">
                        <div className="icon-selection">

                        </div>
                    </div>
                    <hr />
                    </div>
                </div>
                </div>

                {/* Color Preview */}
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
                        style={{ backgroundColor: colors.primary }}
                    >
                        primary: {colors.primary}
                    </div>
                    <div
                        className="preview-secondary"
                        style={{
                        backgroundColor: colors.secondary,
                        color: getContrastColor(colors.secondary),
                        }}
                    >
                        secondary: {colors.secondary}
                    </div>
                    </div>
                    <div className="preview-elements">
                    <button className="example-button">
                        example of a button
                    </button>
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
            </div>
        </div>
        </>
    )}

export default Settings;