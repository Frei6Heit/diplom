import speech_recognition as sr

def get_voice_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Скажите название города...")
        audio = recognizer.listen(source)

    try:
        city = recognizer.recognize_google(audio, language="ru-RU")
        print(f"Вы сказали: {city}")
        return city
    except sr.UnknownValueError:
        print("Извините, я не понял ваш запрос.")
        return None
    except sr.RequestError:
        print("Не удалось подключиться к сервису распознавания речи.")
        return None
    