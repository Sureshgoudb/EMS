import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

const appStore = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});

export default appStore;
