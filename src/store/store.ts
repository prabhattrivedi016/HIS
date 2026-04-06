import { configureStore } from "@reduxjs/toolkit";
import accessRightReducer from "./slices/accessRightSlices";

const PERSIST_KEY = "redux-store";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(PERSIST_KEY);
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    accessRights: accessRightReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
  try {
    const state = store.getState();
    const serializedState = JSON.stringify({
      accessRights: state.accessRights,
    });
    localStorage.setItem(PERSIST_KEY, serializedState);
  } catch {
    // ignore write errors
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
