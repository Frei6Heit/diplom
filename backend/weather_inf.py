import requests

API_KEY = '9bcc4eb61448ce79da19ef489320395c'

def get_weather(city):
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric&lang=ru'
    print(f"Запрос к OpenWeatherMap: {url}")  # Отладочная информация
    response = requests.get(url)
    print(f"Ответ от OpenWeatherMap: {response.status_code}, {response.text}")  # Отладочная информация

    if response.status_code == 200:
        data = response.json()
        return {
            'city': city,
            'description': data['weather'][0]['description'],
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'wind_speed': data['wind']['speed']
        }
    else:
        return {'error': 'Не удалось получить данные о погоде'}