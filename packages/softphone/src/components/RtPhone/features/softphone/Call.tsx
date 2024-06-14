import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RTCSession } from "jssip/lib/RTCSession";

interface ExtendedRTCSession extends RTCSession {
  muted?: boolean;
  holded?: boolean;
}

export interface CallState {
  data: ExtendedRTCSession[];
  conferenceData: ExtendedRTCSession[];
  muted: boolean;
  holded: boolean;
}

const initialState: CallState = {
  data: [],
  conferenceData: [],
  muted: false,
  holded: false,
};

const checkAndMoveSingleConferenceCall = (state: any) => {
  if (state.conferenceData.length === 1) {
    const session = state.conferenceData.pop();
    if (session) {
      state.data.push(session);
    }
  }
};

export const softphoneSlice = createSlice({
  name: "softphoneSlice",
  initialState,
  reducers: {
    addCall: (state, action: PayloadAction<ExtendedRTCSession>) => {
      const existingCall = state.data.find(
        (call) => call?.id === action.payload?.id
      );
      if (!existingCall) {
        state.data.push(action.payload);
      }
    },
    removeCall: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(
        (session) => session.id !== action.payload
      );
    },
    setCallMuted: (
      state,
      action: PayloadAction<{ id: string; muted: boolean }>
    ) => {
      const idx = state.data.findIndex(
        (session) => session.id === action.payload.id
      );
      if (idx !== -1) {
        state.data[idx].muted = action.payload.muted;
      }
    },
    setCallHolded: (
      state,
      action: PayloadAction<{ id: string; holded: boolean }>
    ) => {
      const idx = state.data.findIndex(
        (session) => session.id === action.payload.id
      );
      if (idx !== -1) {
        state.data[idx].holded = action.payload.holded;
      }
    },

    // Conferência
    addToConference: (state, action: PayloadAction<ExtendedRTCSession[]>) => {
      action.payload.forEach((session) => {
        const existingCallIndex = state.data.findIndex(
          (call) => call.id === session.id
        );
        let callToAdd;
        const callExistsInConference = state.conferenceData.some(
          (call) => call.id === session.id
        );

        if (!callExistsInConference) {
          if (existingCallIndex !== -1) {
            callToAdd = state.data[existingCallIndex];
            state.data.splice(existingCallIndex, 1);
          } else {
            callToAdd = session;
          }

          state.conferenceData.push(callToAdd);
        }
      });
    },
    removeConferenceCall: (state, action: PayloadAction<string>) => {
      state.conferenceData = state.conferenceData.filter(
        (session) => session.id !== action.payload
      );

      checkAndMoveSingleConferenceCall(state);
    },
  },
});

export const {
  addCall,
  removeCall,
  setCallMuted,
  setCallHolded,
  addToConference,
  removeConferenceCall,
} = softphoneSlice.actions;

export default softphoneSlice.reducer;
