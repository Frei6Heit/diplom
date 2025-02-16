import React, { useState } from "react";
import icons from "./import/ImportSVG";
import "../styles/Auth.scss";

const Auth = () => {
  // Состояние для управления видимостью пароля
    const [showPassword, setShowPassword] = useState(false);

    // Функция для переключения видимости пароля
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                        <form>
                            <div className="user-box">
                                <input type="text" required />
                                <label>username</label>
                            </div>

                            
                            <div className="user-box">
                                <input
                                type={showPassword ? "text" : "password"} // Переключаем тип поля
                                required
                                />
                                <label>password</label>
                                <span
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                >
                                {showPassword ? <icons.EyeOFF /> : <icons.Eye />}{" "}
                                {/* Используем ваши SVG-иконки */}
                                </span>
                            </div>


                            <button className="login">
                                login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            </div>
        </div>
        </>
    );
};

export default Auth;
