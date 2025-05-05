import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Settings.scss';

const initialAppItem = {
    name: '',
    path: '',
    triggerWords: []
};

const AppManagement = ({ 
    markUnsaved = () => {}, 
    apps = [], 
    setApps = () => {}
}) => {
    const [newApp, setNewApp] = useState(initialAppItem);
    const [editingAppIndex, setEditingAppIndex] = useState(-1);
    const [triggerWordInput, setTriggerWordInput] = useState('');
    const [showTriggerWordModal, setShowTriggerWordModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/current_user', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.current_user);
                } else {
                    toast.error('Ошибка получения данных пользователя');
                }
            } catch (err) {
                console.error('Ошибка получения пользователя:', err);
                toast.error('Не удалось загрузить данные пользователя');
            }
        };
        
        fetchCurrentUser();
    }, []);

    const saveAppsToServer = async (appsToSave) => {
        if (!username) {
            toast.warning('Пользователь не определен. Пожалуйста, войдите заново.');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/auth/save_apps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    apps: appsToSave,
                    username: username 
                })
            });

            if (response.ok) {
                toast.success('Приложения успешно сохранены');
            } else {
                toast.error('Ошибка при сохранении приложений');
            }
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            toast.error('Не удалось сохранить приложения');
        }
    };

    const handleAppInputChange = (field, value) => {
        setNewApp(prev => ({ ...prev, [field]: value }));
    };

    const handleTriggerWordSubmit = () => {
        if (!triggerWordInput.trim()) {
            toast.warning('Пожалуйста, введите триггерное слово');
            return;
        }
        
        setNewApp(prev => ({
            ...prev,
            triggerWords: [...(prev.triggerWords || []), triggerWordInput.trim()]
        }));
        
        setTriggerWordInput('');
        setShowTriggerWordModal(false);
        toast.success('Триггерное слово добавлено');
    };

    const handleRemoveTriggerWord = (idx) => {
        setNewApp(prev => ({
            ...prev,
            triggerWords: (prev.triggerWords || []).filter((_, i) => i !== idx)
        }));
        toast.info('Триггерное слово удалено');
    };

    const handleAddOrUpdateApp = () => {
        if (!username) {
            toast.error('Пользователь не определен. Пожалуйста, войдите заново.');
            return;
        }

        if (!newApp.name || !newApp.path) {
            toast.warning('Пожалуйста, заполните имя и путь приложения');
            return;
        }

        const updatedApps = editingAppIndex === -1
            ? [...(apps || []), newApp]
            : (apps || []).map((app, i) => i === editingAppIndex ? newApp : app);

        setApps(updatedApps);
        saveAppsToServer(updatedApps);
        setNewApp(initialAppItem);
        setEditingAppIndex(-1);
        markUnsaved();

        const message = editingAppIndex === -1 
            ? 'Приложение успешно добавлено' 
            : 'Приложение успешно обновлено';
        toast.success(message);
    };

    const handleDeleteApp = async (index) => {
        const confirm = window.confirm('Удалить это приложение?');
        if (!confirm) {
            toast.info('Удаление отменено');
            return;
        }

        const updatedApps = (apps || []).filter((_, i) => i !== index);
        setApps(updatedApps);
        await saveAppsToServer(updatedApps);
        markUnsaved();
        toast.success('Приложение удалено');
    };

    const handleEditApp = (index) => {
        setNewApp(apps[index]);
        setEditingAppIndex(index);
        toast.info('Режим редактирования приложения');
    };

    useEffect(() => {
        const fetchApps = async () => {
            if (!username) return;
            
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/auth/get_apps?username=${encodeURIComponent(username)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке приложений');
                }
                
                const data = await response.json();
                if (data.apps) {
                    setApps(data.apps);
                    toast.success('Приложения успешно загружены');
                }
            } catch (err) {
                console.error('Ошибка загрузки приложений:', err);
                toast.error('Не удалось загрузить приложения');
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchApps();
    }, [username]);

    return (
        <div className="settings shadow content">
            <div className="head shadow">
                <h1>apps</h1>
            </div>
            
            <div className="settings-block items">
                {showTriggerWordModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Добавить триггерное слово</h3>
                            <input
                                value={triggerWordInput}
                                onChange={(e) => setTriggerWordInput(e.target.value)}
                                placeholder="Например: калькулятор"
                            />
                            <div className="modal-actions">
                                <button onClick={() => {
                                    setShowTriggerWordModal(false);
                                    toast.info('Добавление слова отменено');
                                }}>
                                    Отмена
                                </button>
                                <button onClick={handleTriggerWordSubmit}>
                                    Добавить
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <p>Загрузка приложений...</p>
                ) : (
                    <>
                        <div className="items">
                            <div className="items-it">
                                <p>Имя приложения</p>
                                <div className="items-blc">
                                    <input
                                        value={newApp.name}
                                        onChange={(e) => handleAppInputChange('name', e.target.value)}
                                        placeholder="insert"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="items">
                            <div className="items-it">
                                <p>Путь к приложению</p>
                                <div className="items-blc">
                                    <input
                                        value={newApp.path}
                                        onChange={(e) => handleAppInputChange('path', e.target.value)}
                                        placeholder="insert"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="items">
                            <div className="items-it">
                                <p>Триггерные слова</p>
                                <div className="items-blc">
                                    <div className="trigger-words">
                                        {(newApp.triggerWords || []).map((word, i) => (
                                            <div key={i} className="trigger-word-item">
                                                {word}
                                                <button 
                                                    onClick={() => handleRemoveTriggerWord(i)}
                                                    className="delete-trigger"
                                                >
                                                    <FaTrash size={10}/>
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => setShowTriggerWordModal(true)}
                                            className="add-trigger"
                                        >
                                            <FaPlus/> Добавить слово
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="items">
                            <div className="items-it">
                                <p></p>
                                <div className="items-blc">
                                    <button 
                                        onClick={handleAddOrUpdateApp}
                                        className="save-app-button"
                                    >
                                        {editingAppIndex === -1 ? 'Добавить приложение' : 'Обновить приложение'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="items">
                            <div className="items-it">
                                <p>Список приложений</p>
                                <div className="items-blc">
                                    {(apps || []).length === 0 ? (
                                        <p>Нет добавленных приложений</p>
                                    ) : (
                                        <ul className="apps-list">
                                            {(apps || []).map((app, index) => (
                                                <li key={index} className="app-item">
                                                    <div className="app-info">
                                                        <strong>{app.name}</strong>
                                                        <span>{app.path}</span>
                                                        <div className="trigger-words-list">
                                                            Триггеры: {(app.triggerWords || []).join(', ')}
                                                        </div>
                                                    </div>
                                                    <div className="app-actions">
                                                        <button 
                                                            onClick={() => handleEditApp(index)}
                                                            className="edit-button"
                                                        >
                                                            Редактировать
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteApp(index)}
                                                            className="delete-button"
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AppManagement;