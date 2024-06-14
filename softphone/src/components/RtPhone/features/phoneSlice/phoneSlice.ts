import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PhoneState {
  pbxExtension: any | null;
  tenantSettings: any | null;
}

const initialState: PhoneState = {
  pbxExtension: null,
  tenantSettings: null,
};

export const phoneSlice = createSlice({
  name: "phone",
  initialState,
  reducers: {
    setPbxExtension: (state, action: PayloadAction<any>) => {
      state.pbxExtension = action.payload;
    },
    setTenantSettings: (state, action: PayloadAction<any>) => {
      state.tenantSettings = action.payload;
    },
  },
});

export const { setPbxExtension, setTenantSettings } = phoneSlice.actions;

export default phoneSlice.reducer;
