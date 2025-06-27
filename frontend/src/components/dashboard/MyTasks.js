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
  Target
} from 'lucide-react';
import { fetchEmployeeProjects } from '../../store/slices/employeeSlice';
import { employeeService } from '../../services/api';

const MyTasks = () => {
  const dispatch = useDispatch();

  const { projects = [], loading = false, error = null } = useSelector((state) => state.employee || {});
  const [success, setSuccess] = useState('');
  const [taskUpdateLoading, setTaskUpdateLoading] = useState(false);


  useEffect(() => {
    dispatch(fetchEmployeeProjects());
  }, [dispatch]);

  // Extract all tasks from all projects
  const getAllTasks = () => {
    console.log('Projects received:', projects);
    const allTasks = [];
    
    // If projects don't have steps, treat them as individual tasks
    if (projects.length > 0 && !projects[0].steps) {
      console.log('Projects appear to be individual tasks, treating as tasks');
      projects.forEach(project => {
        console.log('Adding project as task:', project.title, 'Status:', project.status);
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
      // Original logic for projects with steps
      projects.forEach(project => {
        console.log('Processing project:', project.title, 'Steps:', project.steps);
        project.steps?.forEach(step => {
          console.log('Processing step:', step.name, 'Tasks:', step.tasks);
          step.tasks?.forEach(task => {
            console.log('Adding task:', task.title, 'Status:', task.status);
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
    
    console.log('All extracted tasks:', allTasks);
    return allTasks;
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, task) => {
    try {
      setTaskUpdateLoading(true);
      let response;
      if (task.stepName === 'Main Task') {
        // This is a project-as-task
        response = await employeeService.updateTaskProgress(taskId, newStatus);
      } else {
        // This is a real subdocument task
        response = await employeeService.updateTaskStatus(taskId, newStatus);
      }
      console.log('Update response:', response);
      setSuccess(`Task status updated to ${newStatus}`);
      dispatch(fetchEmployeeProjects());
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating task status:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
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
    inProgress: allTasks.filter(task => task.status === 'in-progress').length,
    pending: allTasks.filter(task => task.status === 'pending' || task.status === 'assigned').length
  };

  // Debug log before return
  console.log('loading:', loading, 'allTasks:', allTasks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            My Tasks
          </h1>
          <p className="text-gray-600">View and manage your assigned tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Total Tasks</h3>
            <p className="text-sm text-gray-500">Assigned to you</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.completed}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
            <p className="text-sm text-gray-500">Tasks finished</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 text-white"/>
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.inProgress}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">In Progress</h3>
            <p className="text-sm text-gray-500">Currently working</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Pending</h3>
            <p className="text-sm text-gray-500">Awaiting start</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Task List</h2>
                <p className="text-sm text-gray-600">Your assigned tasks</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {allTasks.length} task{allTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTasks.map((task, idx) => (
                  <div 
                    key={task._id || `${task.projectId}-${task.stepName}-${task.title}-${idx}`}
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 line-clamp-2">{task.title}</h4>
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
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
                    {/* Status Update Dropdown */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Update Status</label>
                      <select
                        value={task.status}
                        onChange={e => handleUpdateTaskStatus(task._id, e.target.value, task)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={taskUpdateLoading}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks; 