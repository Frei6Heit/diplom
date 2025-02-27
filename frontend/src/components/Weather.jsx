import React, { useEffect, useState } from 'react';
import { fetchWeather } from '../api';

const Weather = ({ city }) => {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadWeather = async () => {
            try {
                const data = await fetchWeather(city);
                if (data.error) {
                    setError(data.error);
                } else {
                    setWeather(data);
                }
            } catch (err) {
                setError('Ошибка при загрузке данных');
            }
        };

        loadWeather();
    }, [city]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!weather) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="weather">
            <h2>Погода в {weather.city}</h2>
            <p>Описание: {weather.description}</p>
            <p>Температура: {weather.temperature}°C</p>
            <p>Влажность: {weather.humidity}%</p>
            <p>Скорость ветра: {weather.wind_speed} м/с</p>
        </div>
    );
};

export default Weather;