import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import userReducer from "../features/user/User";
import softPhoneReducer from "../features/softphone/Call";
import zendeskReducer from "../features/zendesk";
import sessionPhoneReducer from "../features/softphone/Session";
import phoneSlice from "../features/phoneSlice/phoneSlice";

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "softphoneSlice/addCall",
          "softphoneSlice/setCallMuted",
          "softphoneSlice/setCallHolded",
          "sessionSlice/setUserSession",
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["session.data", "softphone.data"],
        // Ignore these paths in the state
        ignoredPaths: ["session.data", "softphone.data"],
      },
    }),
  reducer: {
    user: userReducer,
    softphone: softPhoneReducer,
    counter: counterReducer,
    session: sessionPhoneReducer,
    zendesk: zendeskReducer,
    phone: phoneSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
