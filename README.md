# 🚀 Electron + Flask Application

![Electron+Flask](https://img.shields.io/badge/Electron-2C2E3B?style=for-the-badge&logo=electron)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)

Гибридное приложение для управления ПК через голосовые и текстовые команды с поддержкой многопользовательского режима.

## 🌟 Основные возможности

- **Голосовое управление** компьютером
- **Текстовый интерфейс** для команд
- **Мультипользовательский режим** (до 5 пользователей)
- **Кастомные приложения** и команды
- **Кроссплатформенность** (Windows, Linux)

## 📋 Предварительные требования

1. [Node.js v18+](https://nodejs.org/) (LTS версия)
2. [Python 3.10+](https://www.python.org/downloads/)
3. [Git](https://git-scm.com/downloads)

## 🛠 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/Frei6Heit/diplom.git
cd yourproject
```


## Установка зависимостей



Откройте три терминала в папке проекта:

=================
Терминал 1 (Backend):

```bash
cd backend
pip install -r requirements.txt
```
=================
Терминал 2 (Основные зависимости):

```bash
npm install
```
=================
Терминал 3 (Frontend):

```bash
cd frontend
npm install
```
=================
3. Запуск приложения
Терминал 1 (Flask сервер):

```bash
cd backend
python app.py
```
=================
Терминал 2 (Dev сервер):

```bash
cd frontend
npm start
```
=================
Терминал 3 (Electron приложение):

```bash
cd frontend
npm run electron-dev
```


🗂 Структура проекта

```project/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
└── main.js
```

## ⚠️ Возможные проблемы

Ошибки зависимостей Python:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```


Проблемы с Node.js:

```bash
rm -rf node_modules package-lock.json
npm install
```

Порт занят:

Измените порт в backend/app.py или завершите процесс, использующий порт.

📜 Лицензия
MIT License © 2023 [Popovich Ana]
