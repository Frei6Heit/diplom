import React, { useState } from "react";
import icons from "./import/ImportSVG.jsx";
import "../styles/MainPage.scss";

const Main = () => {
    const [favorites, setFavorites] = useState([
        { 
            id: 1, 
            name: "decoding", 
            isFavorite: true,
            placeholder: "file name",
            btnFirst: "choice file",
            btnSecond: "download"
        },
        { 
            id: 2, 
            name: "VPN", 
            isFavorite: true,
            placeholder: "server name",
            btnFirst: "connected",
            btnSecond: "disconnected"
        },
        { 
            id: 3, 
            name: "off PC", 
            isFavorite: true,
            placeholder: "time",
            btnFirst: "set time",
            btnSecond: "turn off"
        },
        { 
            id: 4, 
            name: "assistant", 
            isFavorite: true,
            placeholder: "request",
            btnFirst: "send",
            btnSecond: "main page"
        },
    ]);

    const toggleFavorite = (id) => {
        setFavorites((prevFavorites) =>
            prevFavorites.map((item) =>
                item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
            )
        );
    };

    return (
        <div className="main">
            <div className="main-search">
                <div className="main-search-field">
                    <input className="main-search-field-inp" />
                </div>

                <div className="main-search-btns-bot">
                    <icons.MicrophoneB className="micro" />
                    <a className="main-search-btns-bot-btn" href="/assistant">
                        move
                    </a>
                </div>
            </div>

            <div className="favorite">
                <div className="favorite-circle" />
                <p>favorite</p>
                <hr className="favorite-line" />
            </div>

            <div className="fav-list">
                {favorites
                    .filter((item) => item.isFavorite)
                    .map((item) => (
                        <div className="fav-list-cont">
                            <button onClick={() => toggleFavorite(item.id)} className="heart">
                                {item.isFavorite ? <icons.FavHeart /> : <icons.NonFavHeart />}
                            </button>

                            <div key={item.id} className="fav-list-item">

                                <div className="fav-list-item-block">
                                    <span>{item.name}</span>

                                    <div className="fav-list-item-block-btm">
                                        <input type="text" placeholder={item.placeholder}/>
                                        <button>{item.btnFirst}</button>
                                        <button>{item.btnSecond}</button>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>

                ))}
            </div>

            <div className="favorite">
                <div className="favorite-circle" />
                <p>non favorite</p>
                <hr className="favorite-line" />
            </div>

            <div className="fav-list">
                {favorites
                    .filter((item) => !item.isFavorite)
                    .map((item) => (
                        <div className="fav-list-cont">
                            <button onClick={() => toggleFavorite(item.id)} className="heart">
                                {item.isFavorite ? <icons.FavHeart /> : <icons.NonFavHeart />}
                            </button>

                            <div key={item.id} className="fav-list-item">

                                <div className="fav-list-item-block">
                                    <span>{item.name}</span>

                                    <div className="fav-list-item-block-btm">
                                        <input type="text" placeholder={item.placeholder} />
                                        <button>{item.btnFirst}</button>
                                        <button>{item.btnSecond}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Main;