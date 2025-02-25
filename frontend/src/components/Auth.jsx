import React, { useState, useRef } from "react";
import icons from "./import/ImportSVG";
import "../styles/Auth.scss";

const Auth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [errors, setErrors] = useState({ username: "", password: "" });

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const handleClick = () => {
        setIsClicked(!isClicked);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        setErrors({ username: "", password: "" });

        if (!username || !password) {
            setErrors({
                username: !username ? "Поле обязательно для заполнения" : "",
                password: !password ? "Поле обязательно для заполнения" : "",
            });
            return;
        }

        const endpoint = isLogin ? "/login" : "/register";
        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                    rememberMe: isClicked,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    const field = errorData.error.split(":")[0].trim();
                    const message = errorData.error.split(":")[1].trim();
                    setErrors({ ...errors, [field]: message });
                } else {
                    setErrors({ username: "", password: errorData.error });
                }
                throw new Error(errorData.error || "Ошибка при отправке данных на сервер");
            }

            const data = await response.json();
            console.log("Ответ от сервера:", data);

            if (endpoint === "/register") {
                alert("Регистрация прошла успешно!");
            }

            if (isClicked) {
                localStorage.setItem("token", data.token);
            } else {
                localStorage.removeItem("token");
            }

            usernameRef.current.value = "";
            passwordRef.current.value = "";

            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }
        } catch (error) {
            console.error("Ошибка:", error);
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
                            <h1>{isLogin ? "Login" : "Create Account"}</h1>

                            <div className="auth-box">
                                <form onSubmit={handleSubmit}>
                                    <div className="user-box">
                                        <input
                                            type="text"
                                            required
                                            ref={usernameRef}
                                        />
                                        <label>username</label>
                                        
                                    </div>

                                    <div className="user-box">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            ref={passwordRef}
                                        />
                                        <label>password</label>
                                        
                                        <span
                                            className="password-toggle"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <icons.EyeOFF /> : <icons.Eye />}
                                        </span>
                                    </div>
                                    <button type="submit" className="login">
                                        {isLogin ? "Login" : "Create Account"}
                                    </button>
                                </form>
                                <button onClick={() => setIsLogin(!isLogin)}>
                                    {isLogin ? "Create Account" : "Login"}
                                </button>
                            </div>
                        </div>
                    </div>
                    {errors.username && <span className="error">{errors.username}</span>}
                    {errors.password && <span className="error">{errors.password}</span>}

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