import React, { useState, useEffect } from "react";
import "./Settings.scss";
import { toast } from 'react-toastify';
import AppManagement from './AppManagement';

const Settings = () => {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [apps, setApps] = useState([]);

    // Save to backend
    const saveSettingsToBackend = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User not authenticated");
            }

            const settingsData = {
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

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const savedSettings = await loadSettingsFromBackend();
                
                if (savedSettings && savedSettings.apps) {
                    setApps(savedSettings.apps);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
                toast.error("Failed to load settings");
            } finally {
                setIsLoading(false);
            }
        };
        
        loadSettings();
    }, []);

    if (isLoading) {
        return (
            <div className="settings-loading">
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <>
            <div className="settings-container">
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