import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchEmployeeProjects,
  punchIn,
  punchOut,
  fetchAttendance,
  clearError,
  clearSuccess,
  addDailyUpdate,
} from '../../store/slices/employeeSlice';
import { 
  Clock, 
  Briefcase, 
  CheckSquare, 
  LogIn, 
  LogOut, 
  Send, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Target,
  Bell,
  Plus,
  Eye,
  Play,
  Square
} from 'lucide-react';
import './Dashboard.css';
import { employeeService } from '../../services/api';
import Chat from '../common/Chat';
import jwtDecode from 'jwt-decode';
import { userService } from '../../services/api';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { projects = [], attendance = null, loading = false, error = null, success = null } = useSelector((state) => state.employee || {});
  const { user = { name: 'Employee' } } = useSelector((state) => state.auth || {});

  const [dailyUpdateDialogOpen, setDailyUpdateDialogOpen] = useState(false);
  const [dailyUpdateText, setDailyUpdateText] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalHours: 0
  });
  const [taskUpdateLoading, setTaskUpdateLoading] = useState(false);
  const [managerUser, setManagerUser] = useState(null);
  const [employeeUser, setEmployeeUser] = useState(null);

  // Extract all tasks from projects
  const getAllTasks = () => {
    const allTasks = [];
    projects.forEach(project => {
      project.steps?.forEach(step => {
        step.tasks?.forEach(task => {
          allTasks.push({
            ...task,
            projectTitle: project.title,
            stepName: step.name,
            projectId: project._id
          });
        });
      });
    });
    console.log('DEBUG: allTasks array:', allTasks);
    return allTasks;
  };

  useEffect(() => {
    dispatch(fetchEmployeeProjects());
    dispatch(fetchAttendance());
  }, [dispatch]);

  useEffect(() => {
    if (error) setTimeout(() => dispatch(clearError()), 5000);
    if (success) setTimeout(() => dispatch(clearSuccess()), 5000);
  }, [error, success, dispatch]);

  useEffect(() => {
    const totalTasks = projects.reduce((sum, project) => {
      const projectTasks = project.steps?.reduce((stepSum, step) => 
        stepSum + (step.tasks?.length || 0), 0) || 0;
      return sum + projectTasks;
    }, 0);
    
    const completedTasks = projects.reduce((sum, project) => {
      const projectCompletedTasks = project.steps?.reduce((stepSum, step) => 
        stepSum + (step.tasks?.filter(task => task.status === 'completed')?.length || 0), 0) || 0;
      return sum + projectCompletedTasks;
    }, 0);
    
    const pendingTasks = projects.reduce((sum, project) => {
      const projectPendingTasks = project.steps?.reduce((stepSum, step) => 
        stepSum + (step.tasks?.filter(task => task.status === 'pending' || task.status === 'in-progress')?.length || 0), 0) || 0;
      return sum + projectPendingTasks;
    }, 0);
    
    const totalHours = projects.reduce((sum, project) => sum + (project.estimatedHours || 0), 0);

    setStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      totalHours
    });
  }, [projects]);

  const handlePunchIn = () => dispatch(punchIn());
  const handlePunchOut = () => dispatch(punchOut());

  const handleSubmitDailyUpdate = () => {
    const updateData = {
      date: new Date().toISOString(),
      description: dailyUpdateText.trim()
    };
    dispatch(addDailyUpdate(updateData));
    setDailyUpdateDialogOpen(false);
    setDailyUpdateText('');
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, task) => {
    try {
      setTaskUpdateLoading(true);
      console.log('DEBUG: handleUpdateTaskStatus called with:', { taskId, newStatus, task });
      let response;
      if (task.stepName === 'Main Task') {
        console.log('DEBUG: Using updateTaskProgress (project-as-task)');
        response = await employeeService.updateTaskProgress(taskId, newStatus);
      } else {
        console.log('DEBUG: Using updateTaskStatus (real subdocument task)');
        response = await employeeService.updateTaskStatus(taskId, newStatus);
      }
      // Show success message
      dispatch({ type: 'employee/setSuccess', payload: `Task status updated to ${newStatus}` });
      // Refresh the projects data to get updated state
      dispatch(fetchEmployeeProjects());
      // Update the selected task if it's the one being updated
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
      console.log(`Task status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update task status';
      dispatch({ type: 'employee/setError', payload: errorMessage });
      // Revert the selected task change on error
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: selectedTask.status }));
      }
    } finally {
      setTaskUpdateLoading(false);
    }
  };

  const today = attendance?.today || {};
  const isPunchedIn = today.punchIn && !today.punchOut;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch employee user info (with _id) from token/localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObj = payload.user || payload;
        setEmployeeUser({ _id: userObj._id || userObj.id, ...userObj });
      } catch (e) {
        console.error('Failed to decode token for employee user', e);
      }
    }
  }, []);
  // Fetch manager user info for chat
  useEffect(() => {
    const fetchEmployeeAndManager = async () => {
      try {
        const empRes = await employeeService.getProfile();
        const empData = empRes.data;
        console.log('Employee profile:', empData);
        setEmployeeUser({ _id: empData._id || empData.id, ...empData });

        if (empData.managerId) {
          const mgrRes = await userService.getUserById(empData.managerId);
          const mgrData = mgrRes.data;
          console.log('Manager profile:', mgrData);
          setManagerUser({ _id: mgrData._id || mgrData.id, ...mgrData });
        } else {
          console.log('No managerId found in employee profile');
        }
      } catch (err) {
        console.error('Could not fetch employee or manager info for chat', err);
      }
    };
    fetchEmployeeAndManager();
  }, []);

  // Add debug logs before rendering chat panel
  console.log('employeeUser:', employeeUser);
  console.log('managerUser:', managerUser);

  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>
        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Debug Section - Remove this in production
        {process.env.NODE_ENV === 'development' && (
          <div className="mx-6 mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <h4 className="font-bold mb-2">Debug Info:</h4>
            <p>User Role from localStorage: {localStorage.getItem('userRole')}</p>
            <p>User Data: {localStorage.getItem('user')}</p>
            <button 
              onClick={() => {
                console.log('Current localStorage:', {
                  token: localStorage.getItem('token'),
                  user: localStorage.getItem('user'),
                  userRole: localStorage.getItem('userRole')
                });
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Log localStorage
            </button>
          </div>
        )} */}

        <div className="px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              {getGreeting()}, {user.name}!
            </h1>
            <p className="text-gray-600">Here's your personalized workspace for today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.totalTasks}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Total Tasks</h3>
              <p className="text-sm text-gray-500">Assigned to you</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.completedTasks}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
              <p className="text-sm text-gray-500">Tasks finished</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.pendingTasks}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Pending</h3>
              <p className="text-sm text-gray-500">Tasks to complete</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.totalHours}h</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Total Hours</h3>
              <p className="text-sm text-gray-500">Estimated work</p>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Attendance Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
                  <p className="text-sm text-gray-600">Track your work hours</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Today's Status</p>
                {isPunchedIn ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Punched In at {new Date(today.punchIn).toLocaleTimeString()}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Ready to start your day</span>
                  </div>
                )}
              </div>

              <button
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  isPunchedIn 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                }`}
                onClick={isPunchedIn ? handlePunchOut : handlePunchIn}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isPunchedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{isPunchedIn ? 'Punch Out' : 'Punch In'}</span>
                </div>
              </button>
            </div>

            {/* Daily Update Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Daily Update</h3>
                  <p className="text-sm text-gray-600">Log your progress</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Share what you've accomplished today with your manager.
              </p>

              <button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                onClick={() => setDailyUpdateDialogOpen(true)}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Update</span>
                </div>
              </button>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Common tasks</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">View All Tasks</span>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">View Schedule</span>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Notifications</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
                  <p className="text-sm text-gray-600">Tasks assigned by your manager</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {getAllTasks().length} task{getAllTasks().length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading your tasks...</p>
                </div>
              ) : getAllTasks().length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks assigned yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Your manager will assign tasks here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAllTasks().map((task, idx) => (
                    <div 
                      key={task._id || `${task.projectId}-${task.stepName}-${task.title}-${idx}`}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30 cursor-pointer"
                      onClick={() => handleViewTask(task)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 line-clamp-2">{task.title}</h4>
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{task.projectTitle}</p>
                      <p className="text-xs text-gray-500 mb-3">{task.stepName}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Daily Update Modal */}
        <AnimatePresence>
          {dailyUpdateDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Today's Update</h2>
                <p className="text-sm text-gray-600 mb-4">What have you accomplished today?</p>
                
                <textarea 
                  placeholder="Tell us about your progress, completed tasks, and any challenges..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
                  rows={4}
                  value={dailyUpdateText}
                  onChange={(e) => setDailyUpdateText(e.target.value)}
                ></textarea>
                
                <div className="flex space-x-3">
                  <button 
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                    onClick={() => setDailyUpdateDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    onClick={handleSubmitDailyUpdate}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Submit</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Task Detail Modal */}
        <AnimatePresence>
          {showTaskModal && selectedTask && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Task Details</h3>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{selectedTask.title}</h4>
                    <p className="text-sm text-gray-600">{selectedTask.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className={`inline-block ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <div className={`inline-block ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Deadline:</span>
                      <span className="ml-2 text-gray-700">{new Date(selectedTask.deadline).toLocaleDateString()}</span>
                    </div>
                    {selectedTask.estimatedHours && (
                      <div>
                        <span className="text-gray-500">Hours:</span>
                        <span className="ml-2 text-gray-700">{selectedTask.estimatedHours}h</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-6">
                  <button 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl hover:shadow-md transition-all duration-200 text-center disabled:opacity-50"
                    onClick={() => handleUpdateTaskStatus(selectedTask._id, 'in-progress', selectedTask)}
                    disabled={taskUpdateLoading || selectedTask.status === 'in-progress'}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Start Task</span>
                    </div>
                  </button>
                  <button 
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
                    onClick={() => handleUpdateTaskStatus(selectedTask._id, 'completed', selectedTask)}
                    disabled={taskUpdateLoading || selectedTask.status === 'completed'}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </div>
                  </button>
                </div>
                
                {/* Status Update Dropdown */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateTaskStatus(selectedTask._id, e.target.value, selectedTask)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={taskUpdateLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
      {/* Persistent Chat Panel */}
      {employeeUser && managerUser && (
        <div style={{
          width: 420,
          minWidth: 320,
          maxWidth: 420,
          height: '100vh',
          position: 'fixed',
          right: 0,
          top: 0,
          background: 'rgba(255,255,255,0.98)',
          boxShadow: '-2px 0 16px rgba(0,0,0,0.08)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e0e0e0',
        }}>
          <Chat currentUser={employeeUser} otherUser={managerUser} />
        </div>
      )}
    </>
  );
};

export default EmployeeDashboard; 