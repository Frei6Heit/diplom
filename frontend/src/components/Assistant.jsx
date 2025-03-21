import React from "react";
import { useLocation } from "react-router-dom";

const Assistant = () => {
    const location = useLocation();
    const searchText = location.state?.searchText || "";

    return (
        <div>
            <h1>Assistant Page</h1>
            <input type="text" value={searchText} readOnly />
        </div>
    );
};

export default Assistant;