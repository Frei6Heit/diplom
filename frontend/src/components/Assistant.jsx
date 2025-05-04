import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/Assistant.scss';
import { toast } from 'react-toastify';

const Assistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isAudioRecording, setIsAudioRecording] = useState(false);
    
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(new AbortController());
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recognitionRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            abortControllerRef.current.abort();
            stopAudioRecording();
            stopRecording();
        };
    }, []);

    const safeApiCall = async (query, audioBlob = null) => {
        abortControllerRef.current = new AbortController();
        const token = localStorage.getItem('token');

        try {
            if (audioBlob) {
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                
                const response = await axios.post(
                    'http://localhost:5000/api/assistant/audio',
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        signal: abortControllerRef.current.signal
                    }
                );
                return response.data;
            } else {
                const response = await axios.post(
                    'http://localhost:5000/api/assistant/chat',
                    { query },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        signal: abortControllerRef.current.signal
                    }
                );
                return response.data;
            }
        } catch (error) {
            if (!axios.isCancel(error)) {
                throw error;
            }
            return null;
        }
    };

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await handleSend('', audioBlob);
            };

            mediaRecorderRef.current.start(1000);
            setIsAudioRecording(true);
            toast.info('Запись аудио начата');
        } catch (error) {
            toast.error(`Ошибка доступа к микрофону: ${error.message}`);
        }
    };

    const stopAudioRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsAudioRecording(false);
            toast.info('Запись аудио остановлена');
        }
    };

    const handleSend = async (text = input, audioBlob = null) => {
        if ((!text.trim() && !audioBlob) || isLoading) return;

        setIsLoading(true);
        if (text) {
            setMessages(prev => [...prev, { text, sender: 'user' }]);
            setInput('');
        } else {
            setMessages(prev => [...prev, { text: '[Аудиосообщение]', sender: 'user', isAudio: true }]);
        }

        try {
            const data = await safeApiCall(text, audioBlob);
            if (data) {
                setMessages(prev => [
                    ...prev,
                    {
                        text: data.response,
                        sender: 'assistant',
                        ...(data.app_path && {
                            isApp: true,
                            appName: data.command,
                            appPath: data.app_path
                        })
                    }
                ]);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Ошибка запроса';
            setMessages(prev => [...prev, { text: errorMessage, sender: 'assistant', isError: true }]);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error('Голосовой ввод не поддерживается');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsRecording(true);
            setInput('Слушаю...');
        };

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript.trim();
            if (transcript) {
                setInput(transcript);
                setTimeout(() => handleSend(transcript), 300);
            }
        };

        recognition.onerror = (e) => {
            if (e.error !== 'no-speech') {
                toast.error(`Ошибка: ${e.error}`);
            }
            setIsRecording(false);
            setInput('');
        };

        recognition.onend = () => {
            setIsRecording(false);
            if (input === 'Слушаю...') setInput('');
        };

        try {
            recognition.start();
        } catch (e) {
            toast.error('Не удалось получить доступ к микрофону');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        setIsRecording(false);
        if (input === 'Слушаю...') setInput('');
    };

    return (
        <div className="assistant-container">
            <div className="chat-window">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                        <div className="message-content">
                            <div className="message-sender">
                                {msg.sender === 'user' ? 'Вы' : 'Ассистент'}
                            </div>
                            {msg.isAudio ? (
                                <div className="audio-message">[Аудиосообщение]</div>
                            ) : (
                                <div className="message-text">{msg.text}</div>
                            )}
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Введите сообщение..."
                    disabled={isLoading || isAudioRecording}
                />

                <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || (!input.trim() && !isAudioRecording)}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Отправка...
                        </>
                    ) : 'Отправить'}
                </button>

                <div className="voice-controls">
                    {isRecording ? (
                        <button onClick={stopRecording} className="recording">
                            <span className="pulse"></span>
                            Остановить голос
                        </button>
                    ) : (
                        <button 
                            onClick={startRecording} 
                            disabled={isLoading || isAudioRecording}
                        >
                            Голосовой ввод
                        </button>
                    )}

                    {isAudioRecording ? (
                        <button onClick={stopAudioRecording} className="audio-recording">
                            <span className="pulse"></span>
                            Остановить запись
                        </button>
                    ) : (
                        <button 
                            onClick={startAudioRecording} 
                            disabled={isLoading || isRecording}
                        >
                            Запись аудио
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Assistant;