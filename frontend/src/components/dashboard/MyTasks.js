import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Clock, 
  Briefcase, 
  CheckSquare, 
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Target,
  Play,
  Eye
} from 'lucide-react';
import { fetchEmployeeProjects } from '../../store/slices/employeeSlice';
import { employeeService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const MyTasks = () => {
  const dispatch = useDispatch();
  const { projects = [], loading = false, error = null } = useSelector((state) => state.employee || {});
  const { user = { name: 'Employee' } } = useSelector((state) => state.auth || {});
  const [success, setSuccess] = useState('');
  const [taskUpdateLoading, setTaskUpdateLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployeeProjects());
  }, [dispatch]);

  // Extract all tasks from all projects
  const getAllTasks = () => {
    const allTasks = [];
    if (projects.length > 0 && !projects[0].steps) {
      projects.forEach(project => {
        allTasks.push({
          _id: project._id,
          title: project.title,
          description: project.description,
          status: project.status,
          priority: project.priority,
          deadline: project.deadline,
          estimatedHours: project.estimatedHours,
          projectTitle: project.title,
          stepName: 'Main Task',
          projectId: project._id
        });
      });
    } else {
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
    }
    return allTasks;
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, task) => {
    try {
      setTaskUpdateLoading(true);
      let response;
      if (task.stepName === 'Main Task') {
        response = await employeeService.updateTaskProgress(taskId, newStatus);
      } else {
        response = await employeeService.updateTaskStatus(taskId, newStatus);
      }
      setSuccess(`Task status updated to ${newStatus}`);
      dispatch(fetchEmployeeProjects());
      setTimeout(() => setSuccess(''), 3000);
      // Update modal if open
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update task status';
      alert(`Error: ${errorMessage}\n\nDetails: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setTaskUpdateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  const allTasks = getAllTasks();
  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(task => task.status === 'completed').length,
    pending: allTasks.filter(task => task.status === 'pending' || task.status === 'assigned').length
  };

  // Modal open handler
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/30 p-6 fixed left-0 top-0 z-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-orange-400 to-pink-400 rounded-full" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">Employee</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">My Tasks</h1>
          <div className="text-xs text-gray-500">Your task overview</div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-semibold mb-2">Stats</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600"><FileText className="w-4 h-4" /> {stats.total} Tasks</div>
            <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> {stats.completed} Completed</div>
            <div className="flex items-center gap-2 text-yellow-600"><Clock className="w-4 h-4" /> {stats.pending} Pending</div>
          </div>
        </div>
        <div className="mt-auto">
          <div className="text-xs text-gray-400">Logged in as</div>
          <div className="font-bold text-gray-700">{user.name}</div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen flex flex-col">
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
        <div className="px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent mb-2">
              My Tasks
            </h1>
            <p className="text-gray-600">View and manage your assigned tasks</p>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-8 mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-orange-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Total Tasks</h3>
              <p className="text-sm text-gray-500">Assigned to you</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-green-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.completed}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
              <p className="text-sm text-gray-500">Tasks finished</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-yellow-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Pending</h3>
              <p className="text-sm text-gray-500">Tasks to complete</p>
            </div>
          </div>
          {/* Tasks Section */}
          <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-7xl mx-auto my-16 animate-fade-in">
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
                  <p className="text-sm text-gray-600">Tasks assigned by your manager</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {allTasks.length} task{allTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="p-10">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading your tasks...</p>
                </div>
              ) : allTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks assigned yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Your manager will assign tasks here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allTasks.map((task, idx) => (
                    <div 
                      key={task._id || `${task.projectId}-${task.stepName}-${task.title}-${idx}`}
                      className={`relative bg-white/90 backdrop-blur rounded-2xl shadow-xl border-l-8 ${task.status === 'completed' ? 'border-green-400' : task.status === 'pending' ? 'border-yellow-400' : 'border-orange-400'} p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer group animate-fade-in`}
                      onClick={() => handleViewTask(task)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 line-clamp-2">{task.title}</h4>
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.projectTitle}</p>
                      <p className="text-xs text-gray-500 mb-3">{task.stepName}</p>
                      <div className="space-y-2 text-xs text-gray-500">
                        {task.deadline && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {/* Add a subtle animated bar at the bottom on hover */}
                      <div className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        {/* Task Detail Modal */}
        <AnimatePresence>
          {showTaskModal && selectedTask && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Task Details</h3>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-6 h-6" />
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
                      <div className={`inline-block ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedTask.status)}`}>{selectedTask.status}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <div className={`inline-block ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>{selectedTask.priority || 'medium'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Deadline:</span>
                      <span className="ml-2 text-gray-700">{selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : 'Not set'}</span>
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
                    <option value="assigned">Assigned</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyTasks; 