import os
import json
import subprocess
import webbrowser

def open_app(app_name):
    try:
        # Пробуем найти и открыть приложение
        subprocess.Popen(["start", "", app_name], shell=True)
        return f"Открываю приложение {app_name}"
    except Exception as e:
        return f"Ошибка: {e}"

def handle_message(message):
    """
    Обрабатывает сообщение, ищет триггерные слова в JSON и выполняет соответствующую функцию.
    """
    # Загрузка JSON-файла
    with open("trigger.json", "r", encoding="utf-8") as file:
        commands = json.load(file)

    # Поиск подходящей команды
    for command in commands:
        for trigger in command["trigger"]:
            if trigger in message:
                # Получаем имя функции из JSON
                func_name = command["func"]
                # Получаем текст ответа
                response = command["response"]

                # Обработка команды "Открой"
                if func_name == "open_app":
                    # Извлекаем название приложения из сообщения
                    app_name = message.replace(trigger, "").strip().lower()

                    # Проверяем, есть ли приложение в app_mapping
                    app_mapping = command.get("app_mapping", {})
                    if check_app_exists(app_name, app_mapping):
                        # Открываем приложение
                        system_app_name = app_mapping[app_name]
                        result = open_app(system_app_name)
                        return f"{response} {result}"
                    else:
                        # Проверяем, есть ли запрос в website_mapping
                        website_mapping = command.get("website_mapping", {})
                        if check_app_exists(app_name, website_mapping):
                            # Открываем сайт в браузере
                            url = website_mapping[app_name]
                            webbrowser.open(url)
                            return f"Открываю сайт: {url}"
                        else:
                            # Открываем запрос в Yandex
                            webbrowser.open(f"https://yandex.ru/search/?text={app_name}")
                            return f"Запрос '{app_name}' открыт в Yandex."

                # Обработка команды "Добавь приложение"
                elif func_name == "add_app":
                    # Извлекаем ключ и путь из сообщения
                    parts = message.replace(trigger, "").strip().split(maxsplit=1)
                    if len(parts) == 2:
                        key, path = parts
                        # Вызов функции add_app
                        result = add_app(key, path)
                        return f"{response} {result}"
                    else:
                        return "Ошибка: укажите ключ и путь к приложению."

                # Обработка команды "Включи" (для видео)
                elif func_name == "play_video":
                    # Извлекаем название видео из сообщения
                    video_name = message.replace(trigger, "").strip().lower()

                    # Выбор платформы для поиска видео
                    platform = input("Выберите платформу для поиска видео (ютуб, вк, кинопоиск, lordfilm): ").strip().lower()

                    # Открываем видео на выбранной платформе
                    if platform == "ютуб":
                        webbrowser.open(f"https://www.youtube.com/results?search_query={video_name}")
                        return f"Ищу видео '{video_name}' на YouTube."
                    elif platform == "вк":
                        webbrowser.open(f"https://vk.com/video?q={video_name}")
                        return f"Ищу видео '{video_name}' в VK Видео."
                    elif platform == "кинопоиск":
                        webbrowser.open(f"https://www.kinopoisk.ru/index.php?kp_query={video_name}")
                        return f"Ищу фильм '{video_name}' на Кинопоиске."
                    elif platform == "lordfilm":
                        webbrowser.open(f"https://lordfilm.ru/index.php?do=search&subaction=search&story={video_name}")
                        return f"Ищу фильм '{video_name}' на Lordfilm."
                    else:
                        return "Неверная платформа. Попробуйте снова."

    return "Команда не распознана."

def add_app(key, path):
    """
    Добавляет новое приложение в JSON-файл.
    """
    try:
        # Загрузка JSON-файла
        with open("trigger.json", "r", encoding="utf-8") as file:
            commands = json.load(file)

        # Поиск команды с app_mapping
        for command in commands:
            if "app_mapping" in command:
                # Добавляем новое приложение в app_mapping
                command["app_mapping"][key] = path
                break

        # Сохранение обновленного JSON-файла
        with open("trigger.json", "w", encoding="utf-8") as file:
            json.dump(commands, file, ensure_ascii=False, indent=4)

        return f"Приложение '{key}' с путем '{path}' успешно добавлено."
    except Exception as e:
        return f"Ошибка при добавлении приложения: {e}"

def check_app_exists(key, app_mapping):
    """
    Проверяет, существует ли приложение в массиве app_mapping.
    """
    return key in app_mapping

def choice_func():
    user_choice = input("Choice function\n1. Add app\n2. Open app\n3. Play video\n>>> ")

    if user_choice == "1":
        message = input("Enter app name who will be add to filesystem\n>>> ")
        result = handle_message(message)
        print(result)

    elif user_choice == "2":
        message = input("Please enter the command\n>>> ")
        result = handle_message(message)
        print(result)

    elif user_choice == "3":
        message = input("Введите название видео или фильма\n>>> ")
        result = handle_message(message)
        print(result)

choice_func()