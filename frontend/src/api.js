export const fetchWeather = async (city) => {
    try {
        const response = await fetch(`http://localhost:5000/api/weather?city=${city}`);
        console.log("Ответ от бэкенда:", response);  // Отладочная информация
        const data = await response.json();
        console.log("Данные о погоде:", data);  // Отладочная информация
        return data;
    } catch (error) {
        console.error("Ошибка при запросе к бэкенду:", error);  // Отладочная информация
        return { error: "Ошибка при запросе к бэкенду" };
    }
};