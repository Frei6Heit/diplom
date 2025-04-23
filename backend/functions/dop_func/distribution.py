import json
import subprocess

def check_app_exists(key, app_mapping):
    """
    Проверяет, существует ли приложение в массиве app_mapping.
    """
    return key in app_mapping


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


def open_app(app_name):
    try:
        # Пробуем найти и открыть приложение
        subprocess.Popen(["start", "", app_name], shell=True)
        return f"Открываю приложение {app_name}"
    except Exception as e:
        return f"Ошибка: {e}"