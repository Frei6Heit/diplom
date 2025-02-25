import requests

# Ваш API-ключ от OpenWeatherMap
API_KEY = '9bcc4eb61448ce79da19ef489320395c'

# Город, для которого нужно получить погоду
CITY = 'Москва'

# URL для запроса текущей погоды
URL = f'http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric&lang=ru'

# Отправляем GET-запрос
response = requests.get(URL)

# Проверяем статус ответа
if response.status_code == 200:
    # Парсим JSON-ответ
    data = response.json()

    # Извлекаем нужные данные
    weather_description = data['weather'][0]['description']
    temperature = data['main']['temp']
    humidity = data['main']['humidity']
    wind_speed = data['wind']['speed']

    # Выводим результат
    print(f"Погода в городе {CITY}:")
    print(f"Описание: {weather_description}")
    print(f"Температура: {temperature}°C")
    print(f"Влажность: {humidity}%")
    print(f"Скорость ветра: {wind_speed} м/с")
else:
    print(f"Ошибка: {response.status_code}")
    print(response.json())  # Выводим сообщение об ошибке, если есть