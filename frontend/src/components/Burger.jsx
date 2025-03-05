import React from "react";
import "../styles/Burger.scss"; // Предположим, что у вас есть стили для меню

const Burger = () => {
    return (
        <div className="burger-menu">
            {/* Здесь разместите элементы меню, например: */}
            <div className="menu-item">Функция 1</div>
            <div className="menu-item">Функция 2</div>
            <div className="menu-item">Функция 3</div>
            {/* и так далее */}
        </div>
    );
};

export default Burger;