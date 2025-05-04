import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
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

    // Получаем username из localStorage при монтировании компонента
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
                }
            } catch (err) {
                console.error('Ошибка получения пользователя:', err);
            }
        };
        
        fetchCurrentUser();
    }, []);

    const saveAppsToServer = async (appsToSave) => {
        if (!username) return;
        
        try {
            await fetch('http://localhost:5000/auth/save_apps', {
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
        } catch (err) {
            console.error('Ошибка сохранения:', err);
        }
    };

    const handleAppInputChange = (field, value) => {
        setNewApp(prev => ({ ...prev, [field]: value }));
    };

    const handleTriggerWordSubmit = () => {
        if (!triggerWordInput.trim()) return;
        
        setNewApp(prev => ({
            ...prev,
            triggerWords: [...(prev.triggerWords || []), triggerWordInput.trim()]
        }));
        
        setTriggerWordInput('');
        setShowTriggerWordModal(false);
    };

    const handleRemoveTriggerWord = (idx) => {
        setNewApp(prev => ({
            ...prev,
            triggerWords: (prev.triggerWords || []).filter((_, i) => i !== idx)
        }));
    };

    const handleAddOrUpdateApp = () => {
        if (!username) {
            alert('Пользователь не определен. Пожалуйста, войдите заново.');
            return;
        }

        if (!newApp.name || !newApp.path) {
            return alert('Имя и путь обязательны!');
        }

        const updatedApps = editingAppIndex === -1
            ? [...(apps || []), newApp]
            : (apps || []).map((app, i) => i === editingAppIndex ? newApp : app);

        setApps(updatedApps);
        saveAppsToServer(updatedApps);
        setNewApp(initialAppItem);
        setEditingAppIndex(-1);
        markUnsaved();
    };

    const handleDeleteApp = (index) => {
        if (!window.confirm('Удалить это приложение?')) return;
        const updatedApps = (apps || []).filter((_, i) => i !== index);
        setApps(updatedApps);
        saveAppsToServer(updatedApps);
        markUnsaved();
    };

    const handleEditApp = (index) => {
        setNewApp(apps[index]);
        setEditingAppIndex(index);
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
                }
            } catch (err) {
                console.error('Ошибка загрузки приложений:', err);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchApps();
    }, [username]);

    return (
        <div className="settings shadow content">
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
                            <button onClick={() => setShowTriggerWordModal(false)}>
                                Отмена
                            </button>
                            <button onClick={handleTriggerWordSubmit}>
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2>Управление приложениями</h2>
            
            {isLoading ? (
                <p>Загрузка приложений...</p>
            ) : (
                <>
                    <div className="form-group">
                        <label>Имя приложения</label>
                        <input
                            value={newApp.name}
                            onChange={(e) => handleAppInputChange('name', e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Путь к приложению</label>
                        <input
                            value={newApp.path}
                            onChange={(e) => handleAppInputChange('path', e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Триггерные слова</label>
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
                    
                    <button 
                        onClick={handleAddOrUpdateApp}
                        className="save-app-button"
                    >
                        {editingAppIndex === -1 ? 'Добавить приложение' : 'Обновить приложение'}
                    </button>

                    <div className="apps-list">
                        <h3>Список приложений</h3>
                        {(apps || []).length === 0 ? (
                            <p>Нет добавленных приложений</p>
                        ) : (
                            <ul>
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
                                            <button onClick={() => handleEditApp(index)}>
                                                Редактировать
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteApp(index)}
                                                className="delete-app"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AppManagement;