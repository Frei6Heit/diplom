import React, { useEffect } from "react";

const GoogleAuthButton = () => {
  // Функция для перенаправления на бэкенд для аутентификации
    const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google";
    };

    // Проверяем, есть ли данные пользователя после успешной аутентификации
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get("success");

        if (success) {
        // Запрашиваем данные пользователя у бэкенда
        fetch("http://localhost:5000/auth/user", {
            credentials: "include", // Включаем куки для сессии
        })
            .then((response) => response.json())
            .then((data) => {
            console.log("User data:", data);
            alert(`Welcome, ${data.name}!`);
            })
            .catch((error) => {
            console.error("Error fetching user data:", error);
            });
        }
    }, []);

    return (
        <div>
        <button
            onClick={handleLogin}
            style={{ padding: "10px 20px", fontSize: "16px" }}
        >
            Sign in with Google
        </button>
        </div>
    );
};

export default GoogleAuthButton;
