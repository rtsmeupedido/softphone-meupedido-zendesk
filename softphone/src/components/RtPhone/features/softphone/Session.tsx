import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UA } from "jssip/lib/JsSIP";
export interface SessionState {
  data?: UA;
}
const initialState: SessionState = {
  data: undefined,
};

export const sessionSlice = createSlice({
  name: "sessionSlice",
  initialState,
  reducers: {
    setUserSession: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
  },
});

export const { setUserSession } = sessionSlice.actions;

export default sessionSlice.reducer;
