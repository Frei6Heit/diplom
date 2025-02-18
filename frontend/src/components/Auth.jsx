import React, { useState } from "react";
import icons from "./import/ImportSVG";
import "../styles/Auth.scss";

const Auth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Функция для обработки нажатия на кнопку "Remember Me"
    const handleClick = async () => {
        const newState = !isClicked;
        setIsClicked(newState);

        // Отправляем состояние на бэкенд
        try {
            const response = await fetch('http://localhost:5000/update-remember-me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rememberMe: newState, username: username }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке данных на сервер');
            }

            const result = await response.json();
            console.log('Ответ от сервера:', result);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    // Функция для переключения видимости пароля
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Функция для обработки входа через Google
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google";
    };

    // Функция для обработки отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    password,
                    rememberMe: isClicked  // Добавляем состояние "Remember Me"
                }),
            });
    
            if (!response.ok) {
                throw new Error('Ошибка при входе');
            }
    
            const data = await response.json();
            console.log('Ответ от сервера:', data);
    
            // Сохраняем токен в localStorage
            localStorage.setItem('token', data.token);
    
            // Перенаправляем на новую страницу
            window.location.href = data.redirect_url;
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    return (
        <>
            <div className="bkg">
                <div className="bkg-l">
                    <div className="auth">
                        <span className="auth-pf">
                            <icons.PhotoProfile />
                        </span>
                        <div className="auth-b">
                            <h1>create account</h1>

                            <div className="auth-box">
                                <form onSubmit={handleSubmit}>
                                    <div className="user-box">
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                        <label>username</label>
                                    </div>

                                    <div className="user-box">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <label>password</label>
                                        <span
                                            className="password-toggle"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <icons.EyeOFF /> : <icons.Eye />}
                                        </span>
                                    </div>
                                    <a type="submit" className="login" href="/Main">
                                        <button>
                                            login
                                        </button>
                                    </a>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="save-info">
                        <div onClick={handleClick} className="remember">
                            {isClicked ? <icons.Save /> : <icons.UnSave />}
                            <p>remember me</p>
                        </div>

                        <button className="google-login" onClick={handleGoogleLogin}>
                            <icons.GoogleIcon /> <p>continue with Google</p>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Auth;