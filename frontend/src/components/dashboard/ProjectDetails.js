import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { managerService } from '../../services/api';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Clock as ClockIcon,
  FileText,
  Users,
  BarChart3,
  Eye,
  MessageSquare
} from 'lucide-react';
import UserAvatar from '../common/userAvathar';
import Navbar from '../common/Navbar';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const [projectRes, tasksRes] = await Promise.all([
          managerService.getProjectById(projectId),
          managerService.getProjectTasks(projectId)
        ]);
        
        setProject(projectRes.data);
        
        // Handle the new response format from getProjectTasks
        let projectTasks = [];
        if (tasksRes.data && tasksRes.data.tasks) {
          projectTasks = Array.isArray(tasksRes.data.tasks) ? tasksRes.data.tasks : [];
        } else if (Array.isArray(tasksRes.data)) {
          projectTasks = tasksRes.data;
        }
        
        setTasks(projectTasks);
      } catch (err) {
        console.error('Failed to fetch project details:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleApproveTask = async (taskId, status) => {
    try {
      await managerService.approveRejectTask(taskId, status);
      setSuccess(`Task has been ${status}.`);
      // Refresh tasks
      const tasksRes = await managerService.getProjectTasks(projectId);
      let projectTasks = [];
      if (tasksRes.data && tasksRes.data.tasks) {
        projectTasks = Array.isArray(tasksRes.data.tasks) ? tasksRes.data.tasks : [];
      } else if (Array.isArray(tasksRes.data)) {
        projectTasks = tasksRes.data;
      }
      setTasks(projectTasks);
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pending approval': return 'bg-orange-100 text-orange-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested project could not be found.'}</p>
          <Link 
            to="/dashboard" 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <Navbar userRole="manager" />

      {/* Error Message */}
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
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Project Details
          </h1>
          <p className="text-gray-600">View project information and assigned tasks</p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{tasks.length}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Total Tasks</h3>
            <p className="text-sm text-gray-500">Assigned to project</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {tasks.filter(task => task.status === 'completed').length}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
            <p className="text-sm text-gray-500">Tasks finished</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {tasks.filter(task => task.status === 'in-progress').length}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">In Progress</h3>
            <p className="text-sm text-gray-500">Currently working</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{calculateProgress()}%</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Progress</h3>
            <p className="text-sm text-gray-500">Overall completion</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 mb-6">
          <div className="flex border-b border-white/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'team'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Team
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Description</h3>
                  <p className="text-gray-600 leading-relaxed">{project.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Deadline</p>
                          <p className="font-medium text-gray-800">
                            {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Estimated Hours</p>
                          <p className="font-medium text-gray-800">
                            {project.estimatedHours || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Assigned To</p>
                          <p className="font-medium text-gray-800">
                            {project.assignedTo?.name || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Progress Overview</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-medium text-gray-800">{calculateProgress()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${calculateProgress()}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <p className="text-2xl font-bold text-green-600">
                            {tasks.filter(task => task.status === 'completed').length}
                          </p>
                          <p className="text-sm text-green-600">Completed</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <p className="text-2xl font-bold text-blue-600">
                            {tasks.filter(task => task.status === 'in-progress').length}
                          </p>
                          <p className="text-sm text-blue-600">In Progress</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Project Tasks</h3>
                  <Link 
                    to="/assign-task" 
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Assign New Task
                  </Link>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tasks assigned to this project yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-800">{task.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            
                            <div className="flex items-center space-x-6 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{task.assignedTo?.name || 'Unassigned'}</span>
                              </div>
                              {task.estimatedHours && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.estimatedHours}h</span>
                                </div>
                              )}
                              {task.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {task.submittedBy && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <UserAvatar
                                avatar={task.submittedBy.avatar}
                                name={task.submittedBy.name}
                                size="sm"
                              />
                              <div>
                                <p className="text-xs text-gray-500">Submitted by</p>
                                <p className="text-sm font-medium text-gray-800">{task.submittedBy.name}</p>
                              </div>
                              {task.submittedAt && (
                                <span className="text-xs text-gray-500 ml-auto">
                                  {new Date(task.submittedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex justify-end space-x-2">
                          {task.status === 'pending approval' && (
                            <>
                              <button
                                onClick={() => handleApproveTask(task._id, 'approved')}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveTask(task._id, 'rejected')}
                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Project Team</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => task.assignedTo).filter((employee, index, arr) => 
                    employee && arr.findIndex(e => e._id === employee._id) === index
                  ).map((employee) => (
                    <div key={employee._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30">
                      <div className="relative mb-3">
                        <UserAvatar
                          avatar={employee.avatar}
                          name={employee.name}
                          className="mx-auto"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm bg-green-400"></div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-1">{employee.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{employee.role}</p>
                      <p className="text-xs text-gray-500 mb-3">{employee.email}</p>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-800">
                          {tasks.filter(task => task.assignedTo?._id === employee._id).length} tasks
                        </p>
                        <p className="text-xs text-gray-500">
                          {tasks.filter(task => task.assignedTo?._id === employee._id && task.status === 'completed').length} completed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
