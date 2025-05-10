export const titleBarIcons = [
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

export const colorVariables = [
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

export const initialAppItem = {
    name: "",
    path: "",
    triggerWords: []
};

export const themePresets = {
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