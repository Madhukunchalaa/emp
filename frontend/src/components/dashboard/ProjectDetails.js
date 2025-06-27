import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { managerService } from '../../services/api';
import ProjectSteps from '../common/ProjectSteps';
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

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const projectRes = await managerService.getProjectById(projectId);
        const projectData = projectRes.data;
        setProject(projectData);

        // Extract tasks from the project's steps
        if (projectData && projectData.steps) {
          const allTasks = projectData.steps.reduce((acc, step) => {
            return acc.concat(step.tasks.map(task => ({ ...task, stepName: step.name })));
          }, []);
          setTasks(allTasks);

          // Extract unique team members from tasks
          const uniqueTeamMembers = [];
          const memberIds = new Set();
          
          allTasks.forEach(task => {
            if (task.assignedTo && !memberIds.has(task.assignedTo._id)) {
              memberIds.add(task.assignedTo._id);
              uniqueTeamMembers.push(task.assignedTo);
            }
          });

          // Add project creator if not already in team
          if (projectData.createdBy && !memberIds.has(projectData.createdBy._id)) {
            uniqueTeamMembers.push(projectData.createdBy);
          }

          setTeamMembers(uniqueTeamMembers);
        }
        
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

  const handleUpdateTasks = async () => {
    try {
      const projectRes = await managerService.getProjectById(projectId);
      const projectData = projectRes.data;
      setProject(projectData);

      if (projectData && projectData.steps) {
        const allTasks = projectData.steps.reduce((acc, step) => {
          return acc.concat(step.tasks.map(task => ({ ...task, stepName: step.name })));
        }, []);
        setTasks(allTasks);

        // Extract unique team members from tasks
        const uniqueTeamMembers = [];
        const memberIds = new Set();
        
        allTasks.forEach(task => {
          if (task.assignedTo && !memberIds.has(task.assignedTo._id)) {
            memberIds.add(task.assignedTo._id);
            uniqueTeamMembers.push(task.assignedTo);
          }
        });

        // Add project creator if not already in team
        if (projectData.createdBy && !memberIds.has(projectData.createdBy._id)) {
          uniqueTeamMembers.push(projectData.createdBy);
        }

        setTeamMembers(uniqueTeamMembers);
      }
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
      setError('Failed to refresh tasks.');
    }
  };

  const handleApproveTask = async (taskId, status) => {
    try {
      await managerService.approveRejectTask(taskId, status);
      setSuccess(`Task has been ${status}.`);
      // Refresh tasks
      handleUpdateTasks();
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const response = await managerService.updateProjectTaskStatus(taskId, newStatus);
      setSuccess(`Task status updated to ${newStatus}.`);
      
      // Update the project data with the new progress
      if (response.data && response.data.project) {
        setProject(response.data.project);
        
        // Update tasks list
        if (response.data.project.steps) {
          const allTasks = response.data.project.steps.reduce((acc, step) => {
            return acc.concat(step.tasks.map(task => ({ ...task, stepName: step.name })));
          }, []);
          setTasks(allTasks);
        }
      }
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setLoading(false);
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

        {/* Project Steps, Tasks, and Progress */}
        <div className="bg-white/80 rounded-2xl shadow-sm p-6 mb-6">
          <ProjectSteps project={project} />
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
              Team ({teamMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'files'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Files
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Project Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/50 p-6 rounded-xl border-t border-white/20">
                    <h4 className="font-semibold text-gray-800 mb-3">Details</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start">
                        <FileText className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                        <p>
                          <span className="font-semibold text-gray-700">Description:</span>{' '}
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        <p>
                          <span className="font-semibold text-gray-700">Created:</span>{' '}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        <p>
                          <span className="font-semibold text-gray-700">Deadline:</span>{' '}
                          {new Date(project.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        <p>
                          <span className="font-semibold text-gray-700">Team Size:</span>{' '}
                          {teamMembers.length}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        <p>
                          <span className="font-semibold text-gray-700">Status:</span>{' '}
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        <p>
                          <span className="font-semibold text-gray-700">Priority:</span>{' '}
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/50 p-6 rounded-xl border-t border-white/20">
                    <h4 className="font-semibold text-gray-800 mb-3">Key Personnel</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      {project.createdBy && (
                        <div className="flex items-center space-x-3">
                          <UserAvatar username={project.createdBy.name} />
                          <div>
                            <p className="font-semibold text-gray-700">{project.createdBy.name}</p>
                            <p className="text-xs text-gray-500">Project Creator</p>
                          </div>
                        </div>
                      )}
                      {project.assignedTo && (
                        <div className="flex items-center space-x-3">
                          <UserAvatar username={project.assignedTo.name} />
                          <div>
                            <p className="font-semibold text-gray-700">{project.assignedTo.name}</p>
                            <p className="text-xs text-gray-500">Project Manager</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="p-6">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No tasks have been created for this project yet.</p>
                    <p className="text-sm text-gray-400">Use the "Assign Task" feature to create and assign tasks to team members.</p>
                  </div>
                ) : (
                  <>
                    {tasks.every(task => !task.assignedTo) && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-1">Tasks Need Assignment</h4>
                            <p className="text-sm text-blue-600">
                              All tasks in this project are currently unassigned. Use the "Assign Task" feature to assign tasks to team members.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Task
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assigned To
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                          <tr key={task._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{task.title}</div>
                              <div className="text-sm text-gray-500">{task.stepName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {task.assignedTo ? (
                                <div className="flex items-center space-x-3">
                                  <UserAvatar username={task.assignedTo.name} />
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">{task.assignedTo.name}</p>
                                    <p className="text-xs text-gray-500">{task.assignedTo.role}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">Unassigned</span>
                                  <span className="text-xs text-gray-400">(Use Assign Task to assign)</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {/* Status Update Dropdown */}
                                <select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  disabled={loading}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                                
                                {/* Approval buttons for pending approval tasks */}
                                {task.status === 'pending approval' && (
                                  <div className="flex space-x-1">
                                    <button 
                                      onClick={() => handleApproveTask(task._id, 'approved')}
                                      className="text-green-600 hover:text-green-900 text-xs"
                                      disabled={loading}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleApproveTask(task._id, 'rejected')}
                                      className="text-red-600 hover:text-red-900 text-xs"
                                      disabled={loading}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Project Team</h3>
                {teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map(member => (
                      <div key={member._id} className="bg-white/50 p-4 rounded-xl border flex items-center space-x-4">
                        <UserAvatar username={member.name} />
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role || 'Team Member'}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No team members assigned yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Project Files</h3>
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No files uploaded yet</p>
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
