import { createSlice } from "@reduxjs/toolkit";

const deviceSlice = createSlice({
  name: "device",
  initialState: null,
  reducers: {
    addDevice: (state, action) => {
      return action.payload;
    },
    removeDevice: (state, action) => {
      return null;
    },
  },
});

export const { addDevice, removeDevice } = deviceSlice.actions;

export default deviceSlice.reducer;
