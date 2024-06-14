import { PayloadAction, createSlice } from "@reduxjs/toolkit";
export interface UserState {
  data: any;
}
const initialState: UserState = {
  data: {},
};

export const userSlice = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
