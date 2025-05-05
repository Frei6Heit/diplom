import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import "./Settings.scss";
import NavSettings from "./NavSettings.jsx";
import { toast } from 'react-toastify';
import AppManagement from './AppManagement';

const titleBarIcons = [
    { id: 1, name: "microphone" },
    { id: 2, name: "voice assistant" },
    { id: 3, name: "text assistant" },
    { id: 4, name: "decoding" },
    { id: 5, name: "account" },
    { id: 6, name: "settings" },
    { id: 7, name: "main page" },
    { id: 8, name: "device control" },
    { id: 9, name: "search info" },
    { id: 10, name: "VPN" }
];

const colorVariables = [
    { name: 'primary-color', label: 'Primary Color' },
    { name: 'secondary-color', label: 'Secondary Color' },
    { name: 'background-color', label: 'Background' },
    { name: 'border-color', label: 'Border' },
    { name: 'button-color', label: 'Button' },
    { name: 'text-color', label: 'Text' },
    { name: 'contrast-text-color', label: 'Contrast Text' },
    { name: 'card-background', label: 'Card Background' },
    { name: 'shadow-color', label: 'Shadow' },
    { name: 'warning-background', label: 'Warning BG' },
    { name: 'warning-text', label: 'Warning Text' },
    { name: 'input-border', label: 'Input Border' },
    { name: 'input-background', label: 'Input BG' },
    { name: 'preview-border', label: 'Preview Border' },
    { name: 'section-background', label: 'Section BG' }
];

const Settings = () => {
    // Theme states
    const [theme, setTheme] = useState("white");
    const [contrastWarning, setContrastWarning] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    const showColorPicker = theme === "custom";
    const showPreview = theme === "custom";

    // const [theme, setTheme] = useState("white");
    const [apps, setApps] = useState([]); // <-- Добавили состояние для приложений

    // Title bar states
    const [titleBarType, setTitleBarType] = useState("standard");
    const [showTitleBarPicker, setShowTitleBarPicker] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(titleBarIcons[0].id);

    // API states
    const [apiSettings, setApiSettings] = useState({
        vpn: "",
        assistant: "",
        textCorrection: "",
    });

    // All colors from :root
    const [allColors, setAllColors] = useState({});

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
            colorVariables.forEach(variable => {
                document.documentElement.style.setProperty(
                    `--${variable.name}`,
                    newColors[variable.name]
                );
            });
            setContrastWarning(checkContrast(
                newColors['primary-color'],
                newColors['secondary-color']
            ));
        }, 300),
        [checkContrast]
    );

    // Save to backend
    const saveSettingsToBackend = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User not authenticated");
            }

            const settingsData = {
                theme,
                colors: allColors,
                title_bar: {
                    type: titleBarType,
                    selectedIcon: selectedIcon
                },
                api_settings: apiSettings,
                apps
            };

            const response = await fetch("http://localhost:5000/auth/save_settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(settingsData)
            });

            if (!response.ok) {
                throw new Error("Failed to save settings");
            }

            return await response.json();
        } catch (error) {
            console.error("Error saving settings:", error);
            throw error;
        }
    };

    // Load from backend
    const loadSettingsFromBackend = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            const response = await fetch("http://localhost:5000/auth/get_settings", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to load settings");
            }

            const data = await response.json();
            return data.settings;
        } catch (error) {
            console.error("Error loading settings:", error);
            return null;
        }
    };

    // Save all settings function
    const saveAllSettings = async () => {
        try {
            await saveSettingsToBackend();
            
            // Save to localStorage for immediate access
            localStorage.setItem("selectedTheme", theme);
            if (theme === "custom") {
                colorVariables.forEach(variable => {
                    localStorage.setItem(variable.name, allColors[variable.name]);
                });
            }
            localStorage.setItem("titleBarType", titleBarType);
            if (titleBarType === "custom") {
                localStorage.setItem("selectedIcon", selectedIcon);
            }
            
            Object.keys(apiSettings).forEach(key => {
                localStorage.setItem(`api_${key}`, apiSettings[key]);
            });
            
            setSaveMessage("Settings saved successfully!");
            setHasUnsavedChanges(false);
            
            setTimeout(() => {
                setSaveMessage("");
            }, 3000);
        } catch (error) {
            toast.error("Failed to save settings: " + error.message);
        }
    };

    // Handlers that mark changes as unsaved
    const markUnsaved = () => setHasUnsavedChanges(true);

    const handleApiChange = (field, value) => {
        const newSettings = { ...apiSettings, [field]: value };
        setApiSettings(newSettings);
        markUnsaved();
    };

    const handleThemeSelect = (selectedTheme) => {
        if (theme === selectedTheme) return;
        
        setTheme(selectedTheme);
        markUnsaved();

        if (selectedTheme === "white") {
            const whiteThemeColors = {
                'primary-color': '#DD9090',
                'secondary-color': '#723A3A',
                'background-color': 'white',
                'border-color': 'black',
                'button-color': '#237E3F',
                'text-color': '#333',
                'contrast-text-color': 'white',
                'card-background': 'white',
                'shadow-color': 'rgba(0, 0, 0, 0.1)',
                'warning-background': '#fff3cd',
                'warning-text': '#856404',
                'input-border': 'black',
                'input-background': 'white',
                'preview-border': '#ddd',
                'section-background': '#f5f5f5'
            };
            setAllColors(whiteThemeColors);
            updateColors(whiteThemeColors);
        } else if (selectedTheme === "black") {
            const blackThemeColors = {
                'primary-color': '#333333',
                'secondary-color': '#DD9090',
                'background-color': 'black',
                'border-color': '#444',
                'button-color': '#237E3F',
                'text-color': 'white',
                'contrast-text-color': '#000',
                'card-background': '#222',
                'shadow-color': 'rgba(255, 255, 255, 0.1)',
                'warning-background': '#333',
                'warning-text': '#ffcc00',
                'input-border': '#444',
                'input-background': '#222',
                'preview-border': '#444',
                'section-background': '#1a1a1a'
            };
            setAllColors(blackThemeColors);
            updateColors(blackThemeColors);
        } else if (selectedTheme === "custom") {
            updateColors(allColors);
        }
    };

    const handleColorChange = (variableName, value) => {
        const newColors = { ...allColors, [variableName]: value };
        setAllColors(newColors);
        markUnsaved();
        updateColors(newColors);
    };

    const handleTitleBarSelect = (type) => {
        const isCustom = type === "custom";
        const newType = titleBarType === type ? "standard" : type;

        setTitleBarType(newType);
        setShowTitleBarPicker(isCustom && newType === "custom");
        markUnsaved();
    };

    const handleIconSelect = (iconId) => {
        setSelectedIcon(iconId);
        markUnsaved();
    };

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const savedSettings = await loadSettingsFromBackend();
                
                if (savedSettings) {
                    // Apply theme settings
                    if (savedSettings.theme) {
                        setTheme(savedSettings.theme);
                        
                        if (savedSettings.theme === "custom" && savedSettings.colors) {
                            setAllColors(savedSettings.colors);
                            updateColors(savedSettings.colors);
                        } else {
                            handleThemeSelect(savedSettings.theme);
                        }
                    }
                    
                    // Apply title bar settings
                    if (savedSettings.title_bar) {
                        setTitleBarType(savedSettings.title_bar.type || "standard");
                        setSelectedIcon(savedSettings.title_bar.selectedIcon || titleBarIcons[0].id);
                    }
                    
                    // Apply API settings
                    if (savedSettings.api_settings) {
                        setApiSettings(savedSettings.api_settings);
                    }
                } else {
                    // Fallback to localStorage if no backend settings
                    const localTheme = localStorage.getItem("selectedTheme") || "white";
                    setTheme(localTheme);
                    
                    if (localTheme === "custom") {
                        const localColors = {};
                        colorVariables.forEach(variable => {
                            const color = localStorage.getItem(variable.name) || 
                                getComputedStyle(document.documentElement).getPropertyValue(`--${variable.name}`).trim();
                            localColors[variable.name] = color;
                        });
                        setAllColors(localColors);
                        updateColors(localColors);
                    } else {
                        handleThemeSelect(localTheme);
                    }
                    
                    const localTitleBarType = localStorage.getItem("titleBarType") || "standard";
                    setTitleBarType(localTitleBarType);
                    
                    const localSelectedIcon = localStorage.getItem("selectedIcon") || titleBarIcons[0].id;
                    setSelectedIcon(localSelectedIcon);
                    
                    const localApiSettings = {};
                    ['vpn', 'assistant', 'textCorrection'].forEach(key => {
                        localApiSettings[key] = localStorage.getItem(`api_${key}`) || "";
                    });
                    setApiSettings(localApiSettings);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
                toast.error("Failed to load settings");
            } finally {
                setIsLoading(false);
            }
        };
        
        loadSettings();
    }, [updateColors]);

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

    const renderColorPickers = () => (
        <div className="color-inputs-grid">
            {colorVariables.map(variable => (
                <div key={variable.name} className="color-input-group">
                    <input
                        type="color"
                        value={allColors[variable.name] || "#ffffff"}
                        onChange={(e) => handleColorChange(variable.name, e.target.value)}
                        aria-label={`Select ${variable.label} color`}
                    />
                    <input
                        value={allColors[variable.name] || ""}
                        className="color-input"
                        onChange={(e) => handleColorChange(variable.name, e.target.value)}
                    />
                    <label>{variable.label}</label>
                </div>
            ))}
        </div>
    );

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

    if (isLoading) {
        return (
            <div className="settings-loading">
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <>
            {/* <NavSettings /> */}

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
                                    <div className="picker-content">
                                        {renderColorPickers()}
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
                                    <div className="picker-content">
                                        <div className="icon-selection">
                                            <div className="icon-grid">
                                                {titleBarIcons.map(icon => renderIconOption(icon))}
                                            </div>
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
                                        style={{ backgroundColor: allColors['primary-color'] }}
                                    >
                                        primary: {allColors['primary-color']}
                                    </div>
                                    <div
                                        className="preview-secondary"
                                        style={{
                                            backgroundColor: allColors['secondary-color'],
                                            color: getContrastColor(allColors['secondary-color']),
                                        }}
                                    >
                                        secondary: {allColors['secondary-color']}
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

                <AppManagement 
                    markUnsaved={markUnsaved} 
                    apps={apps} 
                    setApps={setApps} 
                />

                {/* Global Save Button */}
                <div className="global-save-section">
                    {hasUnsavedChanges && (
                        <button 
                            className="save-button"
                            onClick={saveAllSettings}
                        >
                            Save All Settings
                        </button>
                    )}
                    {saveMessage && (
                        <div className="save-message">
                            {saveMessage}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Settings;