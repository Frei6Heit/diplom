import React, { useState } from "react";
import "../styles/Settings.scss";

const Settings = () => {
    const [appKeyword, setAppKeyword] = useState("");
    const [appLink, setAppLink] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleAddApp = () => {
        console.log("Adding app:", { keyword: appKeyword, link: appLink }); // Проверка данных
        fetch('http://localhost:5000/api/add_app', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword: appKeyword, link: appLink }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response from server:", data); // Проверка ответа
            // alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    const handleSearch = () => {
        // Отправка запроса на сервер для поиска
        fetch('http://localhost:5000/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: searchQuery }),
        })
        .then(response => response.json())
        .then(data => {
            // alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div className="settings">
            <h2>Настройки</h2>
            <div className="settings-section">
                <h3>Добавить приложение</h3>
                <input
                    type="text"
                    placeholder="Ключевое слово"
                    value={appKeyword}
                    onChange={(e) => setAppKeyword(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Ссылка на приложение"
                    value={appLink}
                    onChange={(e) => setAppLink(e.target.value)}
                />
                <button onClick={handleAddApp}>Добавить</button>
            </div>
            <div className="settings-section">
                <h3>Поиск</h3>
                <input
                    type="text"
                    placeholder="Введите запрос"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>Найти</button>
            </div>
        </div>
    );
};

export default Settings;