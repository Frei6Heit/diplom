import React, { useState } from "react";
import icons from "./import/ImportSVG.jsx";
import "../styles/MainPage.scss";
// import BackgroundShapes from "./dop_func/BackgroundShapes.jsx";

const Main = () => {
    const [favorites, setFavorites] = useState([
        {
            id: 1,
            name: "decoding",
            isFavorite: true,
            placeholder: "file name",
            btnFirst: "choice file",
            btnSecond: "download",
        },
        {
            id: 2,
            name: "VPN",
            isFavorite: true,
            placeholder: "server name",
            btnFirst: "connected",
            btnSecond: "disconnected",
        },
        {
            id: 3,
            name: "off PC",
            isFavorite: true,
            placeholder: "time",
            btnFirst: "set time",
            btnSecond: "turn off",
        },
        {
            id: 4,
            name: "assistant",
            isFavorite: true,
            placeholder: "request",
            btnFirst: "send",
            btnSecond: "main page",
        },
    ]);

    const toggleFavorite = (id) => {
        setFavorites((prevFavorites) =>
            prevFavorites.map((item) =>
                item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
            )
        );
    };

    // Проверяем, есть ли элементы в favorite
    const hasFavorites = favorites.some(item => item.isFavorite);
    // Проверяем, есть ли элементы в non-favorite
    const hasNonFavorites = favorites.some(item => !item.isFavorite);

    return (
        <div className="main">
            {/* <BackgroundShapes /> */}
            <div className="main-search shadow">
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
            <div className="pattern">
                <icons.Pattern/>
            </div>

            <div className="content shadow">
                <div className="favorite">
                    <div className="favorite-circle" />
                    <p>favorite</p>
                    <hr className="favorite-line" />
                </div>

                <div className="fav-list">
                    {hasFavorites ? (
                        favorites
                            .filter((item) => item.isFavorite)
                            .map((item) => (
                                <div className="fav-list-cont" key={item.id}>
                                    <button
                                        onClick={() => toggleFavorite(item.id)}
                                        className="heart"
                                    >
                                        {item.isFavorite ? <icons.FavHeart /> : <icons.NonFavHeart />}
                                    </button>

                                    <div className="fav-list-item">
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
                            ))
                    ) : (
                        <div className="empty-message">
                            i'm sad that it's empty here
                        </div>
                    )}
                </div>

                <div className="favorite">
                    <div className="favorite-circle" />
                    <p>non favorite</p>
                    <hr className="favorite-line" />
                </div>

                <div className="fav-list">
                    {hasNonFavorites ? (
                        favorites
                            .filter((item) => !item.isFavorite)
                            .map((item) => (
                                <div className="fav-list-cont" key={item.id}>
                                    <button
                                        onClick={() => toggleFavorite(item.id)}
                                        className="heart"
                                    >
                                        {item.isFavorite ? <icons.FavHeart /> : <icons.NonFavHeart />}
                                    </button>

                                    <div className="fav-list-item">
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
                            ))
                    ) : (
                        <div className="empty-message">
                            the author is glad that you like everything
                        </div>
                    )}
                </div>
            </div>
            <div className="pattern">
                <icons.Pattern/>
            </div>
        </div>
    );
};

export default Main;