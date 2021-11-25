import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user";
import gameDataReducer from "./slices/gameData";

const store = configureStore({
    reducer: {
        user: userReducer,
        gameData: gameDataReducer,
    },
});

export default store;
