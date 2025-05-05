import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/Assistant.scss";
import { toast } from "react-toastify";

const Assistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
    const [listeningState, setListeningState] = useState("idle"); // Добавлено состояние

    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(new AbortController());
    const eventSourceRef = useRef(null);

    // Прокрутка к новым сообщениям
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // SSE соединение для получения сообщений
    useEffect(() => {
        if (!isVoiceAssistantActive) {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        return;
        }

        const token = localStorage.getItem("token");
        eventSourceRef.current = new EventSource(
        `http://localhost:5000/api/assistant/events?token=${token}`
        );

        eventSourceRef.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data?.messages?.length > 0) {
            setMessages((prev) => [...prev, ...data.messages]);

            // Обновляем состояние на основе последнего сообщения
            const lastMessage = data.messages[data.messages.length - 1];
            if (lastMessage.type === "command") {
            setListeningState("processing");
            } else if (lastMessage.type === "response") {
            setListeningState("waiting");
            }
        }
        };

        eventSourceRef.current.onerror = () => {
        eventSourceRef.current?.close();
        setListeningState("idle");
        setIsVoiceAssistantActive(false);
        toast.error("Соединение с ассистентом прервано");
        };

        return () => {
        eventSourceRef.current?.close();
        };
    }, [isVoiceAssistantActive]);

    const safeApiCall = async (text) => {
        abortControllerRef.current = new AbortController();
        const token = localStorage.getItem("token");

        try {
        const response = await axios.post(
            "http://localhost:5000/api/assistant/chat",
            { command: text }, // Убедитесь, что поле называется "command"
            {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            signal: abortControllerRef.current.signal,
            }
        );
        return response.data;
        } catch (error) {
        if (!axios.isCancel(error)) {
            throw error;
        }
        return null;
        }
    };

    const startVoiceAssistant = async () => {
        try {
        setListeningState("waiting");
        const token = localStorage.getItem("token");
        await axios.post(
            "http://localhost:5000/api/assistant/start_voice_assistant",
            {},
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );
        setIsVoiceAssistantActive(true);
        toast.info('Скажите "ассистент" для активации');
        } catch (error) {
        toast.error(
            `Ошибка запуска: ${error.response?.data?.error || error.message}`
        );
        setListeningState("idle");
        }
    };

    const stopVoiceAssistant = async () => {
        try {
        setListeningState("idle");
        const token = localStorage.getItem("token");
        await axios.post(
            "http://localhost:5000/api/assistant/stop_voice_assistant",
            {},
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );
        setIsVoiceAssistantActive(false);
        } catch (error) {
        toast.error(`Ошибка остановки: ${error.message}`);
        }
    };

    const toggleVoiceAssistant = () => {
        if (isVoiceAssistantActive) {
        stopVoiceAssistant();
        } else {
        startVoiceAssistant();
        }
    };

    const handleSend = async (text = input) => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setMessages((prev) => [...prev, { text, sender: "user", isVoice: false }]);
        setInput("");

        try {
        const data = await safeApiCall(text);
        if (data) {
            setMessages((prev) => [
            ...prev,
            {
                text: data.response,
                sender: "assistant",
                ...(data.app_path && {
                isApp: true,
                appName: data.command,
                appPath: data.app_path,
                }),
            },
            ]);
        }
        } catch (error) {
        const errorMessage =
            error.response?.data?.error || error.message || "Ошибка запроса";
        setMessages((prev) => [
            ...prev,
            { text: errorMessage, sender: "assistant", isError: true },
        ]);
        toast.error(errorMessage);
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="assistant-container">
        <div className="chat-window">
            {messages.map((msg, i) => (
            <div
                key={i}
                className={`message ${msg.sender} ${msg.isError ? "error" : ""}`}
            >
                <div className="message-content">
                <div className="message-sender">
                    {msg.sender === "user" ? "Вы" : "Ассистент"}
                </div>
                <div className="message-text">{msg.text}</div>
                {msg.isApp && (
                    <button
                    className="launch-app-btn"
                    onClick={() => window.electron?.shell?.openPath(msg.appPath)}
                    >
                    Открыть {msg.appName}
                    </button>
                )}
                </div>
            </div>
            ))}
            {isLoading && (
            <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Введите сообщение..."
            disabled={isLoading}
            />

            <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className={isLoading ? "loading" : ""}
            >
            {isLoading ? "Отправка..." : "Отправить"}
            </button>

            <div className="voice-controls">
            <button
                onClick={toggleVoiceAssistant}
                className={`voice-btn ${
                isVoiceAssistantActive ? "active" : ""
                } ${listeningState}`}
                disabled={isLoading}
            >
                {listeningState === "idle" && "Активировать ассистента"}
                {listeningState === "waiting" && 'Ожидание "ассистент"...'}
                {listeningState === "listening" && "Слушаю команду..."}
                {listeningState === "processing" && "Обработка..."}
            </button>
            </div>
        </div>
        </div>
    );
};

export default Assistant;
