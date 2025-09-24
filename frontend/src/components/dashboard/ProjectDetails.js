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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  Edit,
  X,
  Plus,
  Play,
  Pause,
  Square,
  History,
  Globe,
  Server,
  ExternalLink,
  Link as LinkIcon,
  Database,
  Shield,
  Monitor,
  HardDrive,
  Wifi
} from 'lucide-react';
import UserAvatar from '../common/userAvathar';

const ProjectDetails = () => {
  const { id: projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        setError(`Failed to load project details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    } else {
      setLoading(false);
      setError('No project ID provided');
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


  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending approval': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const calculatePhaseProgress = (phase) => {
    if (!phase.tasks || !phase.tasks.length) return 0;
    const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / phase.tasks.length) * 100);
  };

  const togglePhaseExpansion = (phaseId) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTimelineModal(true);
  };

 const handleAddComment = async () => {
  if (!newComment.trim() || !selectedTask) return;
  try {
    await managerService.addTaskComment(selectedTask._id, newComment.trim());
    setNewComment('');
    setAttachedFile(null);
    setSuccess('Comment added successfully');
    
    // Refresh project/tasks to include latest comments
    await handleUpdateTasks();
    
    // CRITICAL FIX: Update the selectedTask with the refreshed data
    const updatedProject = await managerService.getProjectById(projectId);
    const updatedProjectData = updatedProject.data;
    
    if (updatedProjectData && updatedProjectData.steps) {
      const allUpdatedTasks = updatedProjectData.steps.reduce((acc, step) => {
        return acc.concat(step.tasks.map(task => ({ ...task, stepName: step.name })));
      }, []);
      
      // Find the updated version of the selected task
      const updatedTask = allUpdatedTasks.find(task => task._id === selectedTask._id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
    
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    console.error('Failed to add comment:', err);
    setError(err.response?.data?.message || 'Failed to add comment');
  }
};

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setAttachedFile(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Link 
            to="/projects" 
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{project.title}</h1>
            <p className="text-gray-300 mt-2">{project.description}</p>
          </div>
          <Link 
            to="/projects" 
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
        
        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-sm text-gray-400">Created Date</div>
                <div className="font-medium text-white">{formatDate(project.startDate)}</div>
              </div>
            </div>
          </div>
        
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">End Date</div>
                <div className="font-medium text-white">{formatDate(project.endDate)}</div>
              </div>
            </div>
          </div>
        
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-blue-400"/>
              <div>
                <div className="text-sm text-gray-400">Overall Progress</div>
                <div className="font-medium text-white">{calculateProgress()}%</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm text-gray-400">Team Members</div>
                <div className="font-medium text-white">{teamMembers.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Project Progress</span>
            <span>{calculateProgress()}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-400 to-pink-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="p-6">
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'phases', label: 'Phases & Tasks', icon: FileText },
            { id: 'technical', label: 'Technical Details', icon: Server },
            { id: 'timeline', label: 'Timeline', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Created By</div>
                      <div className="font-medium text-white">{project.createdBy?.name || 'Unknown'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-gray-400">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Priority</div>
                      <div className="font-medium text-white capitalize">{project.priority}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Project Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <FileText className="w-4 h-4" /> 
                    <span className="text-white">{tasks.length} Total Tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" /> 
                    <span className="text-white">{tasks.filter(t => t.status === 'completed').length} Completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400">
                    <ClockIcon className="w-4 h-4" /> 
                    <span className="text-white">{tasks.filter(t => t.status === 'in-progress').length} In Progress</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4" /> 
                    <span className="text-white">{tasks.filter(t => t.status === 'pending').length} Pending</span>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member._id} className="flex items-center space-x-3">
                      <UserAvatar name={member.name} avatar={member.avatar} />
                      <div>
                        <div className="font-medium text-white">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.role || 'Team Member'}</div>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-gray-400 text-sm">No team members assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'phases' && (
          <div className="space-y-6">
            {project.steps && project.steps.length > 0 ? (
              project.steps.map((phase, index) => (
                <div key={phase._id || index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
                  {/* Phase Header */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => togglePhaseExpansion(phase._id || index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-orange-400">#{index + 1}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{phase.name}</h3>
                          <p className="text-gray-400">{phase.description || 'No description available'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Progress</div>
                          <div className="font-medium text-white">{calculatePhaseProgress(phase)}%</div>
                        </div>
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${calculatePhaseProgress(phase)}%` }}
                          ></div>
                        </div>
                        {expandedPhases[phase._id || index] ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phase Tasks */}
                  {expandedPhases[phase._id || index] && (
                    <div className="border-t border-white/10 p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-gray-300">Task</th>
                              <th className="text-left py-3 px-4 text-gray-300">Priority</th>
                              <th className="text-left py-3 px-4 text-gray-300">Status</th>
                              <th className="text-left py-3 px-4 text-gray-300">Assigned To</th>
                              <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase.tasks && phase.tasks.length > 0 ? (
                              phase.tasks.map((task, taskIndex) => (
                                <tr key={task._id || taskIndex} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="py-3 px-4">
                                    <div 
                                      className="text-white cursor-pointer hover:text-orange-400 transition-colors"
                                      onClick={() => handleTaskClick(task)}
                                    >
                                      {task.title}
                                    </div>
                                    <div className="text-sm text-gray-400">{task.description}</div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                      {task.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    {task.assignedTo ? (
                                      <div className="flex items-center space-x-2">
                                        <UserAvatar name={task.assignedTo.name} avatar={task.assignedTo.avatar} />
                                        <span className="text-white text-sm">{task.assignedTo.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">Unassigned</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <select
                                        value={task.status}
                                        onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="overdue">Overdue</option>
                                      </select>
                                      <button
                                        onClick={() => {
                                          setSelectedTask(task);
                                          setShowCommentsModal(true);
                                        }}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                        title="Add Comment"
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-400">
                                  No tasks in this phase
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No phases defined for this project</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-6">
            {/* Project Links */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-orange-400" />
                Project Links & URLs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Live Website</div>
                      <div className="font-medium text-white">
                        {project.websiteUrl ? (
                          <a 
                            href={project.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 flex items-center"
                          >
                            {project.websiteUrl}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Not deployed yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Staging Environment</div>
                      <div className="font-medium text-white">
                        {project.stagingUrl ? (
                          <a 
                            href={project.stagingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 flex items-center"
                          >
                            {project.stagingUrl}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Documentation</div>
                      <div className="font-medium text-white">
                        {project.documentationUrl ? (
                          <a 
                            href={project.documentationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 flex items-center"
                          >
                            {project.documentationUrl}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Repository</div>
                      <div className="font-medium text-white">
                        {project.repositoryUrl ? (
                          <a 
                            href={project.repositoryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 flex items-center"
                          >
                            {project.repositoryUrl}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-red-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Admin Panel</div>
                      <div className="font-medium text-white">
                        {project.adminUrl ? (
                          <a 
                            href={project.adminUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 flex items-center"
                          >
                            {project.adminUrl}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* test */}
            






















            {/* Domain Details */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-400" />
                Domain Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Primary Domain</div>
                      <div className="font-medium text-white">
                        {project.primaryDomain || 'Not configured'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Secondary Domains</div>
                      <div className="font-medium text-white">
                        {project.secondaryDomains?.length > 0 ? (
                          <div className="space-y-1">
                            {project.secondaryDomains.map((domain, index) => (
                              <div key={index} className="text-sm text-gray-300">{domain}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">SSL Certificate</div>
                      <div className="font-medium text-white">
                        {project.sslStatus ? (
                          <span className="text-green-400">Active</span>
                        ) : (
                          <span className="text-red-400">Not configured</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Domain Expiry</div>
                      <div className="font-medium text-white">
                        {project.domainExpiry ? formatDate(project.domainExpiry) : 'Not available'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-orange-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Domain Provider</div>
                      <div className="font-medium text-white">
                        {project.domainProvider || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Wifi className="w-5 h-5 text-cyan-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">DNS Status</div>
                      <div className="font-medium text-white">
                        {project.dnsStatus ? (
                          <span className="text-green-400">Configured</span>
                        ) : (
                          <span className="text-yellow-400">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Details */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-green-400" />
                Server Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Server Type</div>
                      <div className="font-medium text-white">
                        {project.serverType || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Operating System</div>
                      <div className="font-medium text-white">
                        {project.serverOS || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Database</div>
                      <div className="font-medium text-white">
                        {project.databaseType || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-5 h-5 text-orange-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Storage</div>
                      <div className="font-medium text-white">
                        {project.storageSize || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-red-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Server Provider</div>
                      <div className="font-medium text-white">
                        {project.serverProvider || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Wifi className="w-5 h-5 text-cyan-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">IP Address</div>
                      <div className="font-medium text-white">
                        {project.serverIP || 'Not available'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Server Expiry</div>
                      <div className="font-medium text-white">
                        {project.serverExpiry ? formatDate(project.serverExpiry) : 'Not available'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Server Status</div>
                      <div className="font-medium text-white">
                        {project.serverStatus ? (
                          <span className="text-green-400">Online</span>
                        ) : (
                          <span className="text-red-400">Offline</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Details */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-400" />
                Environment Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Production</span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>URL: {project.prodUrl || 'Not deployed'}</div>
                    <div>DB: {project.prodDatabase || 'Not configured'}</div>
                    <div>Status: <span className="text-green-400">Active</span></div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-white font-medium">Staging</span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>URL: {project.stagingUrl || 'Not deployed'}</div>
                    <div>DB: {project.stagingDatabase || 'Not configured'}</div>
                    <div>Status: <span className="text-yellow-400">Testing</span></div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white font-medium">Development</span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>URL: {project.devUrl || 'Local only'}</div>
                    <div>DB: {project.devDatabase || 'Not configured'}</div>
                    <div>Status: <span className="text-blue-400">Development</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Project Timeline</h2>
            <div className="space-y-4">
              <div className="text-center text-gray-400 py-8">
                <History className="w-12 h-12 mx-auto mb-4" />
                <p>Click on any task in the Phases & Tasks tab to view its timeline</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Modal */}
      {showTimelineModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Task Timeline</h3>
                <button
                  onClick={() => setShowTimelineModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-2">
                <h4 className="text-lg text-orange-400">{selectedTask.title}</h4>
                <p className="text-gray-300">{selectedTask.description}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Mock timeline data - replace with actual API data */}
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Task Created</div>
                    <div className="text-gray-400 text-sm">21-Sep-2024 10:30 AM</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Status Changed: Pending → In Progress</div>
                    <div className="text-gray-400 text-sm">22-Sep-2024 09:15 AM</div>
                    <div className="text-gray-300 text-sm mt-1">Task started by John Doe</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Comment Added</div>
                    <div className="text-gray-400 text-sm">23-Sep-2024 02:45 PM</div>
                    <div className="text-gray-300 text-sm mt-1">"Working on the implementation, will finish by tomorrow."</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{project.comment}</div>
                    <div className="text-gray-400 text-sm">24-Sep-2024 11:20 AM</div>
                    <div className="text-gray-300 text-sm mt-1">Task completed by John Doe</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Add Comment</h4>
                <div className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                    rows="3"
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                  
                     
                
                    <label
                      htmlFor="file-upload"
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Attach File</span>
                    </label>
                    {attachedFile && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{attachedFile.name}</span>
                        <button
                          onClick={() => setAttachedFile(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddComment}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Task Comments</h3>
                <button
                  onClick={() => setShowCommentsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-2">
                <h4 className="text-lg text-orange-400">{selectedTask.title}</h4>
              </div>
            </div>
            
            
            <div className="p-6">
              <div className="space-y-4">
  {/* Display actual comments from selectedTask */}
  {selectedTask.comments && selectedTask.comments.length > 0 ? (
    selectedTask.comments.map((comment, index) => (
      <div key={comment._id || index} className="flex items-start space-x-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
        <div className="flex-1">
          <div className="text-white font-medium">
            Comment by {comment.author?.name || comment.createdBy?.name || 'Unknown'}
          </div>
          <div className="text-gray-400 text-sm">{formatDate(comment.createdAt)}</div>
          <div className="text-gray-300 text-sm mt-1">"{comment.text || comment.content}"</div>
        </div>
      </div>
    ))
  ) : (
    <div className="text-gray-400 text-center py-4">No comments yet</div>
  )}
  
  {/* Static timeline events */}
  <div className="flex items-start space-x-4">
    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
    <div className="flex-1">
      <div className="text-white font-medium">Task Created</div>
      <div className="text-gray-400 text-sm">{formatDate(selectedTask.createdAt)}</div>
    </div>
  </div>
  
  {selectedTask.status === 'completed' && (
    <div className="flex items-start space-x-4">
      <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
      <div className="flex-1">
        <div className="text-white font-medium">Task Completed</div>
        <div className="text-gray-400 text-sm">{formatDate(selectedTask.updatedAt)}</div>
      </div>
    </div>
  )}
</div>

// 2. Fix Comments Modal - Replace the hardcoded comments section with actual comments
// Replace lines around 900-930 in your Comments Modal with this:

<div className="space-y-4 mb-6">
  {selectedTask.comments && selectedTask.comments.length > 0 ? (
    selectedTask.comments.map((comment, index) => (
      <div key={comment._id || index} className="border-b border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <UserAvatar 
              name={comment.author?.name || comment.createdBy?.name || 'Unknown'} 
              avatar={comment.author?.avatar || comment.createdBy?.avatar} 
            />
            <span className="text-white font-medium">
              {comment.author?.name || comment.createdBy?.name || 'Unknown'}
            </span>
          </div>
          <span className="text-gray-400 text-sm">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-gray-300">{comment.text || comment.content}</p>
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {comment.attachments.map((attachment, attachIndex) => (
              <a 
                key={attachIndex}
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-orange-400 hover:text-orange-300"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">{attachment.name || attachment.filename}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    ))
  ) : (
    <div className="text-gray-400 text-center py-4">
      No comments yet. Be the first to add a comment!
    </div>
  )}
</div>
              
              <div className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  rows="3"
                />
                <div className="flex items-center justify-between">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload-comment"
                  />
                  <label
                    htmlFor="file-upload-comment"
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Attach File</span>
                  </label>
                  {attachedFile && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{attachedFile.name}</span>
                      <button
                        onClick={() => setAttachedFile(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddComment}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;