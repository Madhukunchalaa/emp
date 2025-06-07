import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import managerReducer from './slices/managerSlice';
import designReducer from './slices/designSlice';
import taskReducer from './slices/taskSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    manager: managerReducer,
    designs: designReducer,
    tasks: taskReducer,
  },
});

export default store; 