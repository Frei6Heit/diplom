// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('white');
    const [colors, setColors] = useState({});
    
    const applyTheme = (theme, themeColors) => {
        if (theme === 'custom') {
            Object.entries(themeColors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--${key}`, value);
            });
        } else {
            // Применяем стандартные темы
            const themePresets = {
                white: {
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
                },
                black: {
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
                }
            };
            Object.entries(themePresets[theme]).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--${key}`, value);
            });
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, colors, setTheme, setColors, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);