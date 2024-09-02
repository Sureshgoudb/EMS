import { combineReducers } from "redux";
import userReducer from "./slices/userSlice";
import deviceReducer from "./slices/deviceSlice";
const rootReducer = combineReducers({
  user: userReducer,
  devices: deviceReducer,
});

export default rootReducer;
