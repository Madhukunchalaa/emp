import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import managerReducer from './slices/managerSlice';
import designReducer from './slices/designSlice';
import taskReducer from './slices/taskSlice';
import projectReducer from './slices/projectSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    manager: managerReducer,
    designs: designReducer,
    tasks: taskReducer,
    projects: projectReducer,
  },
});

export default store; 