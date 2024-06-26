import { PayloadAction, createSlice } from "@reduxjs/toolkit";
export interface InfoInterface {
  users?: any[];
  info?: {
    user: string | number | undefined;
  };
}
export interface ZdsState {
  zafClient: any;
  ticket: InfoInterface;
}
const initialState: ZdsState = {
  zafClient: null,
  ticket: {
    users: [],
    info: {
      user: undefined,
    },
  },
};

export const zendeskSlice = createSlice({
  name: "zendeskReducer",
  initialState,
  reducers: {
    setZafClient: (state, action: PayloadAction<any>) => {
      state.zafClient = action.payload;
    },
    setTicket: (state, action: PayloadAction<InfoInterface>) => {
      state.ticket = { ...state.ticket, ...(action.payload || {}) };
    },
    appendUser: (state, action: PayloadAction<InfoInterface>) => {
      state.ticket = {
        ...state.ticket,
        users: [...(state.ticket.users || []), action.payload || {}],
      };
    },
  },
});

export const { setZafClient, setTicket, appendUser } = zendeskSlice.actions;

export default zendeskSlice.reducer;
