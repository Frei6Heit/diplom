import time
from datetime import datetime
import logging
import queue
import threading
import speech_recognition as sr
from typing import Dict, List, Any, Optional, Union
from collections import defaultdict
import audioop
import os
import simpleaudio as sa
import traceback
import json
from .chat_logic import process_user_query, parse_command, execute_command

# Настройка логирования
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AssistantManager:
    def __init__(self):
        self._lock = threading.Lock()
        self.active = False
        self.stop_event = threading.Event()
        self.audio_queue = queue.Queue(maxsize=100)
        self.recognizer = sr.Recognizer()
        self.microphone = None
        self.message_history = defaultdict(list)
        self.last_command_time = defaultdict(float)
        self.min_command_interval = 2
        self.background_listener = None
        self.unread_messages = defaultdict(list)
        self.voice_input_enabled = True
        self.noise_threshold = 200
        self._sound_cache = {}
        
        # Настройка распознавателя
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.energy_threshold = 400
        self.recognizer.pause_threshold = 0.8

    def start(self, username: str) -> bool:
        """Запуск голосового ассистента"""
        if self.active:
            logger.warning("Ассистент уже запущен")
            return False

        try:
            logger.info("Инициализация микрофона...")
            self._init_microphone()
            
            self.active = True
            self.stop_event.clear()
            self.voice_input_enabled = True

            with self._lock:
                if username not in self.message_history:
                    self.message_history[username] = []
                    self.unread_messages[username] = []

            logger.info("Запуск фонового слушателя...")
            self.background_listener = self.recognizer.listen_in_background(
                self.microphone,
                self._audio_callback,
                phrase_time_limit=5
            )

            logger.info("Запуск потока обработки аудио...")
            self.processing_thread = threading.Thread(
                target=self._process_audio_loop,
                args=(username,),
                daemon=True,
                name="AudioProcessingThread"
            )
            self.processing_thread.start()

            logger.info(f"Ассистент успешно запущен для {username}")
            return True

        except Exception as e:
            logger.critical(f"Ошибка запуска ассистента: {e}\n{traceback.format_exc()}")
            self._safe_shutdown()
            return False

    def _init_microphone(self):
        """Инициализация микрофона"""
        try:
            self.microphone = sr.Microphone()
            with self.microphone as source:
                logger.info("Калибровка уровня шума...")
                self.recognizer.adjust_for_ambient_noise(source, duration=3)
                self.noise_threshold = max(150, self.recognizer.energy_threshold * 0.7)
                logger.info(f"Порог шума установлен: {self.noise_threshold}")
        except Exception as e:
            logger.error(f"Ошибка инициализации микрофона: {e}")
            raise RuntimeError(f"Не удалось инициализировать микрофон: {e}")

    def _safe_shutdown(self):
        """Безопасное выключение"""
        with self._lock:
            self.active = False
            self.stop_event.set()
            self.voice_input_enabled = False
            
            if self.background_listener:
                try:
                    self.background_listener(wait_for_stop=False)
                except:
                    pass
                self.background_listener = None

    def stop(self):
        """Остановка ассистента"""
        if not self.active:
            return

        logger.info("Остановка ассистента...")
        self._safe_shutdown()
        logger.info("Ассистент успешно остановлен")

    def _audio_callback(self, recognizer, audio):
        """Callback для получения аудио"""
        if not self.active or not self.voice_input_enabled:
            return

        try:
            if self.audio_queue.qsize() < 90:
                self.audio_queue.put_nowait(audio)
            else:
                logger.warning("Очередь аудио переполнена, пропускаем данные")
        except Exception as e:
            logger.error(f"Ошибка в audio_callback: {e}")

    def _process_audio_loop(self, username: str):
        """Основной цикл обработки аудио с гарантированной обработкой команд"""
        logger.info(f"Запущен цикл обработки аудио для {username}")
        
        state = "waiting_trigger"
        last_activity = time.time()
        COMMAND_TIMEOUT = 10.0  # 3 секунды на команду после триггера

        while not self.stop_event.is_set() and self.active:
            try:
                # Получаем аудио с таймаутом
                try:
                    audio = self.audio_queue.get(timeout=1.0)
                    last_activity = time.time()
                except queue.Empty:
                    # Таймаут ожидания команды после триггера
                    if state == "waiting_command" and time.time() - last_activity > COMMAND_TIMEOUT:
                        state = "waiting_trigger"
                        logger.info("Таймаут команды, возврат в ожидание")
                    continue

                # Пропускаем тихие звуки
                rms = self._calculate_rms(audio)
                if rms < self.noise_threshold:
                    logger.debug(f"Тихий звук (RMS: {rms}), пропускаем")
                    continue

                # Распознаем речь
                text = self._recognize_audio(audio)
                if not text:
                    continue

                logger.info(f"[{state}] Распознано: {text}")

                # Обработка триггерного слова
                if state == "waiting_trigger":
                    if self._check_trigger(text):
                        logger.info("Триггер найден, жду команду")
                        state = "waiting_command"
                        last_activity = time.time()
                        self._play_notification_sound()
                        continue

                # Обработка команды
                if state == "waiting_command":
                    logger.info(f"Обработка команды: {text}")
                    self._process_user_command(username, text)
                    state = "waiting_trigger"

            except Exception as e:
                logger.error(f"Ошибка: {e}\n{traceback.format_exc()}")
                state = "waiting_trigger"
                time.sleep(0.5)

    def _process_user_command(self, username: str, command_text: str):
        """Гарантированная обработка команды с сохранением в историю"""
        if not command_text.strip():
            return

        current_time = time.time()
        if current_time - self.last_command_time[username] < self.min_command_interval:
            logger.debug("Слишком частая команда - пропускаем")
            return

        self.last_command_time[username] = current_time
        logger.info(f"Обработка команды от {username}: {command_text}")

        # 1. Сохраняем полученную команду
        command_msg = {
            "text": command_text,
            "sender": "user",
            "isVoice": True,
            "timestamp": datetime.now().isoformat(),
            "status": "received",
            "type": "command"
        }

        # 2. Готовим ответ
        try:
            response_text = self._execute_command(command_text, command_msg)
            status = "completed"
        except Exception as e:
            response_text = f"Ошибка: {str(e)}"
            status = "error"
            logger.error(f"Ошибка выполнения команды: {e}")

        response_msg = {
            "text": response_text,
            "sender": "assistant",
            "isVoice": True,
            "timestamp": datetime.now().isoformat(),
            "status": status,
            "type": "command_response"
        }

        # 3. Сохраняем оба сообщения
        with self._lock:
            self.message_history[username].extend([command_msg, response_msg])
            self.unread_messages[username].extend([command_msg, response_msg])

        logger.info(f"Команда обработана: {command_text} -> {response_text}")

    def _execute_command(self, command: str, username: str) -> str:
        """Унифицированный обработчик команд"""
        try:
            # 1. Сначала пробуем распарсить как команду (открыть приложение и т.д.)
            parsed = parse_command(command, username)
            if parsed:
                response = execute_command(
                    parsed["action"],
                    parsed["target"],
                    parsed.get("app_path"),
                    username
                )
                return response
            
            # 2. Если не команда - отправляем в общую обработку вопросов
            result = process_user_query(command, username, self)
            
            # Обрабатываем разные форматы ответа от process_user_query
            if isinstance(result, dict):
                return result.get("response", "Не удалось обработать запрос")
            return str(result)
            
        except Exception as e:
            logger.error(f"Ошибка выполнения команды: {e}\n{traceback.format_exc()}")
            return f"Произошла ошибка: {str(e)}"

    def _process_user_command(self, username: str, command_text: str):
        """Обновленная обработка команд с интеграцией process_user_query"""
        if not command_text.strip():
            return

        current_time = time.time()
        if current_time - self.last_command_time[username] < self.min_command_interval:
            logger.debug("Слишком частая команда - пропускаем")
            return

        self.last_command_time[username] = current_time
        logger.info(f"Обработка команды от {username}: {command_text}")

        # Сохраняем полученную команду
        command_msg = {
            "text": command_text,
            "sender": "user",
            "isVoice": True,
            "timestamp": datetime.now().isoformat(),
            "status": "received",
            "type": "command"
        }

        # Обрабатываем команду
        try:
            response_text = self._execute_command(command_text, username)
            status = "completed"
        except Exception as e:
            response_text = f"Ошибка: {str(e)}"
            status = "error"
            logger.error(f"Ошибка выполнения команды: {e}")

        # Формируем ответ
        response_msg = {
            "text": response_text,
            "sender": "assistant",
            "isVoice": True,
            "timestamp": datetime.now().isoformat(),
            "status": status,
            "type": "command_response"
        }

        # Сохраняем сообщения
        with self._lock:
            self.message_history[username].extend([command_msg, response_msg])
            self.unread_messages[username].extend([command_msg, response_msg])

        logger.info(f"Команда обработана: {command_text} -> {response_text}")

    def _extract_app_name(self, command: str) -> str:
        """Извлекает название приложения из команды"""
        triggers = ["открой", "запусти", "открыть"]
        for trigger in triggers:
            if trigger in command.lower():
                return command.lower().split(trigger)[-1].strip()
        return None

    def _find_app_in_config(self, username: str, app_name: str) -> str:
        """Ищет приложение в конфиге пользователя"""
        try:
            with open(f'users/{username}.json') as f:
                apps = json.load(f).get('apps', [])
                for app in apps:
                    if app_name in app.get('keywords', []):
                        return app['path']
        except Exception as e:
            logger.error(f"Ошибка чтения конфига: {str(e)}")
        return None

    def _ask_ai(self, question: str) -> str:
        """Отправляет вопрос к ИИ"""
        # Здесь должна быть ваша интеграция с ИИ
        return f"Ответ на вопрос: {question}"
    



    def _calculate_rms(self, audio: Union[sr.AudioData, bytes]) -> float:
        """Безопасный расчет уровня звука"""
        try:
            if isinstance(audio, sr.AudioData):
                raw_data = audio.get_raw_data()
            else:
                raw_data = audio
            return audioop.rms(raw_data, 2) if raw_data else 0
        except Exception as e:
            logger.error(f"Ошибка расчета RMS: {e}")
            return 0

    def _recognize_audio(self, audio: sr.AudioData) -> Optional[str]:
        """Распознавание речи с улучшенной обработкой ошибок"""
        try:
            return self.recognizer.recognize_google(
                audio,
                language='ru-RU',
                show_all=False
            ).strip()
        except sr.UnknownValueError:
            logger.debug("Речь не распознана")
            return None
        except sr.RequestError as e:
            logger.error(f"Ошибка API распознавания: {e}")
            return None
        except Exception as e:
            logger.error(f"Неожиданная ошибка распознавания: {e}")
            return None

    def _check_trigger(self, text: str) -> bool:
        """Проверка триггерных слов с вариациями"""
        triggers = ["ассистент", "асистент", "assistant", "помощник"]
        text_lower = text.lower()
        return any(trigger in text_lower for trigger in triggers)

    def _play_notification_sound(self):
        """Воспроизведение звукового уведомления"""
        sound_file = "notification.wav"
        try:
            if sound_file not in self._sound_cache:
                base_dir = os.path.dirname(os.path.abspath(__file__))
                sound_path = os.path.join(base_dir, sound_file)
                if os.path.exists(sound_path):
                    self._sound_cache[sound_file] = sa.WaveObject.from_wave_file(sound_path)
                else:
                    logger.warning(f"Файл звука не найден: {sound_file}")
                    # Временная заглушка, если файл не найден
                    print("\a")  # Системный beep
                    return
            
            play_obj = self._sound_cache[sound_file].play()
            play_obj.wait_done()
        except Exception as e:
            logger.error(f"Ошибка воспроизведения звука: {e}")
            print("\a")  # Системный beep как fallback

    # Остальные методы остаются без изменений
    def add_message(self, username: str, message: Dict[str, Any]):
        if not message.get('text'):
            return

        message.setdefault('sender', 'user')
        message.setdefault('isVoice', False)
        message.setdefault('timestamp', datetime.now().isoformat())
        message['read'] = False

        with self._lock:
            self.message_history[username].append(message)
            self.unread_messages[username].append(message)

    def get_messages(self, username: str) -> List[Dict[str, Any]]:
        with self._lock:
            return self.message_history.get(username, []).copy()

    def get_new_messages(self, username: str) -> List[Dict[str, Any]]:
        with self._lock:
            messages = self.unread_messages.get(username, []).copy()
            self.unread_messages[username] = []
            return messages

    def wait_for_messages(self, username: str, timeout: float = 30.0) -> List[Dict[str, Any]]:
        start_time = time.time()
        while time.time() - start_time < timeout:
            with self._lock:
                if self.unread_messages.get(username):
                    messages = self.unread_messages[username].copy()
                    self.unread_messages[username] = []
                    return messages
            if self.stop_event.is_set():
                return []
            time.sleep(0.1)
        return []

    def is_active(self, username: str) -> bool:
        with self._lock:
            return self.active and username in self.message_history

    def get_voice_status(self, username: str) -> Dict[str, Any]:
        with self._lock:
            return {
                "active": self.active,
                "voice_input_enabled": self.voice_input_enabled,
                "listening": self.background_listener is not None,
                "last_activity": self.last_command_time.get(username, 0),
                "queue_size": self.audio_queue.qsize()
            }

    def enable_voice_input(self, enable: bool = True):
        with self._lock:
            self.voice_input_enabled = enable
            logger.info(f"Голосовой ввод {'включён' if enable else 'выключен'}")

    def clear_history(self, username: str):
        with self._lock:
            self.message_history[username] = []
            self.unread_messages[username] = []
            logger.info(f"История очищена для {username}")