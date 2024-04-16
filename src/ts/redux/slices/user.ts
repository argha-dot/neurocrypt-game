import { createSlice } from "@reduxjs/toolkit";
import { userInterface } from "../../interfaces";

interface initialStateInterface {
  value: userInterface;
}

const initialState: initialStateInterface = {
  value: {
    uid: "",
    passSeq: [],
    noteSpeed: 8,
    noteGenerateLag: 30,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
