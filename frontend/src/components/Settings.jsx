import React, { useState } from 'react';

const Settings = ({ setCity }) => {
    const [newCity, setNewCity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setCity(newCity);
    };

    return (
        <div className="settings">
            <h1>Настройки</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Город:
                    <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default Settings;