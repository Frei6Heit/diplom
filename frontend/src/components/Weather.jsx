import React, { useEffect, useState } from 'react';
import { fetchWeather } from '../api';
import '../styles/Weather.scss'

const Weather = ({ city }) => {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState('');
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => {
        setTime(new Date());
        }, 60000); // Обновляем время каждую минуту
    
        return () => clearInterval(interval); // Очистка интервала при размонтировании компонента
    }, []);
    
    const formattedTime = time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

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
            
            <p>Описание: {weather.description}</p>
            <p>Температура: {weather.temperature}°C</p>
            <p>Влажность: {weather.humidity}%</p>
            <p>Скорость ветра: {weather.wind_speed} м/с</p>

            <div className='weather-city'>
                <p>{weather.city}</p>
                <div />
                <p>currently</p>
                <div />
                <p>{formattedTime}</p>
            </div>
            
        </div>
    );
};

export default Weather;