import { createSlice } from "@reduxjs/toolkit";
import { gameDataInterface } from "../../interfaces";

interface initialStateInterface {
  value: gameDataInterface;
}

const initialState: initialStateInterface = {
  value: {
    gameVer: 0,
    AUD: false,
    VIS: false,
    SESSION: "TRAIN",
  },
};

const gameDataSlice = createSlice({
  name: "game_data",
  initialState: initialState,
  reducers: {
    setGameData: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setGameData } = gameDataSlice.actions;
export default gameDataSlice.reducer;
