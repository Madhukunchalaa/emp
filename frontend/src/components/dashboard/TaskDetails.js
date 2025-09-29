import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Clock as ClockIcon,
  FileText,
  Target,
  MessageSquare,
  Download,
  Upload,
  X,
  Plus,
  Send,
  ExternalLink,
  Briefcase,
  Flag
} from 'lucide-react';
import { employeeService, managerService } from '../../services/api';
import UserAvatar from '../common/userAvathar';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get task from employee projects
      const projectsRes = await employeeService.getProjects();
      const projects = projectsRes.data || [];
      
      let foundTask = null;
      
      // Search through all projects and tasks
      for (const project of projects) {
        if (project.steps) {
          for (const step of project.steps) {
            for (const projectTask of step.tasks || []) {
              if (projectTask._id === taskId) {
                foundTask = {
                  ...projectTask,
                  projectTitle: project.title,
                  stepName: step.name,
                  projectId: project._id,
                  projectDescription: project.description,
                  assignedTo: projectTask.assignedTo || user,
                  taskDes:projectTask.taskDes
                
                };
                break;
              }
            }
            if (foundTask) break;
          }
          if (foundTask) break;
        }
      }
      
      if (!foundTask) {
        // Try team leader tasks
        try {
          const teamTasksRes = await employeeService.getMyTasks();
          const teamTasks = teamTasksRes.data || [];
          const teamTask = teamTasks.find(t => t._id === taskId);
          
          if (teamTask) {
            foundTask = {
              ...teamTask,
              projectTitle: 'Team Leader Assignment',
              stepName: 'Direct Task',
              taskType: 'team-leader',
              title: teamTask.content || teamTask.title,
              description: teamTask.content || teamTask.description,
              assignedTo: user
            };
          }
        } catch (teamTaskError) {
          console.log('No team leader tasks found');
        }
      }
      
      if (foundTask) {
        setTask(foundTask);
      } else {
        setError('Task not found');
      }
      
    } catch (err) {
      console.error('Failed to fetch task details:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!newReply.trim() || !task) return;
    try {
      const formData = new FormData();
      formData.append('taskId', task._id);
      formData.append('text', newReply.trim());
      attachedFiles.forEach(f => formData.append('files', f));

      // Use the task-comments endpoint designed for FormData
      await managerService.addTaskComment(formData);

      setNewReply('');
      setAttachedFiles([]);
      setReplyingTo(null);
      setSuccess('Reply added successfully');
      await fetchTaskDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to add reply:', err);
      setError(err.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachedFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading task details...</p>
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
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Task not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </button>
          
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            {task.priority && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
        <p className="text-gray-300">{task.description || 'No description available'}</p>
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

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Information */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-400" />
                Task Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-gray-400">Project</div>
                      <div className="font-medium text-white">{task.projectTitle}</div>
                     
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-sm text-gray-400">Phase</div>
                      <div className="font-medium text-white">{task.stepName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-sm text-gray-400">Assigned To</div>
                      <div className="flex items-center space-x-2">
                        <UserAvatar 
                          name={task.assignedTo?.name || user?.name || 'You'} 
                          avatar={task.assignedTo?.avatar || user?.avatar} 
                        />
                         <div className="text-sm text-gray-400">Description</div>
                      <div className="font-medium text-white">{task.description}</div>
                        <span className="font-medium text-white">
                          {task.assignedTo?.name || user?.name || 'You'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm text-gray-400">Deadline</div>
                      <div className="font-medium text-white">
                        {formatDate(task.deadline || task.dueDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-400">Created</div>
                      <div className="font-medium text-white">
                        {formatDate(task.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {task.estimatedHours && (
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-sm text-gray-400">Estimated Hours</div>
                        <div className="font-medium text-white">{task.estimatedHours}h</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">
                  Comments {task.comments?.length > 0 && `(${task.comments.length})`}
                </h2>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment, index) => (
                    <div key={comment._id || index} className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-start space-x-3">
                        <UserAvatar 
                          name={comment.author?.name || 'Unknown'} 
                          avatar={comment.author?.avatar} 
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">
                              {comment.author?.name || 'Unknown User'}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">
                                {formatDate(comment.createdAt)}
                              </span>
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-200 leading-relaxed mb-3">{comment.text}</p>
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs text-gray-400 font-medium">Attachments:</div>
                              <div className="flex flex-wrap gap-2">
                                {comment.attachments.map((attachment, attachIndex) => (
                                  <a 
                                    key={attachIndex}
                                    href={`http://localhost:5000${attachment.url}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-md px-3 py-2 text-orange-300 hover:text-orange-200 transition-colors text-sm border border-orange-500/30"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>{attachment.originalName}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {replyingTo === comment._id && (
                            <div className="mt-4 space-y-3 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
                              <textarea
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                                rows="3"
                              />
                              <div className="flex items-center justify-between">
                                <label
                                  htmlFor={`file-upload-reply-${comment._id}`}
                                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 cursor-pointer transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>Attach Files</span>
                                </label>
                                <input
                                  id={`file-upload-reply-${comment._id}`}
                                  type="file"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  multiple
                                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                                />
                                <button
                                  onClick={handleAddReply}
                                  disabled={!newReply.trim()}
                                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50"
                                >
                                  Send Reply
                                </button>
                              </div>
                              {attachedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {attachedFiles.map((file, idx) => (
                                    <span key={idx} className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded border border-gray-600">
                                      {file.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No comments yet.</p>
                    <p className="text-gray-500 text-sm">Be the first to add a comment!</p>
                  </div>
                )}
              </div>

              {/* Add Reply Section */}
              <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Plus className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Add Reply</h3>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Share your thoughts, updates, or ask questions..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                    rows="4"
                  />
                  
                  <div className="space-y-3">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-reply"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    />
                    
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="file-upload-reply"
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 border border-gray-500 rounded-lg text-gray-200 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Attach Files</span>
                      </label>
                      <span className="text-xs text-gray-400">Max 5 files, 10MB each</span>
                    </div>
                    
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300 font-medium">Attached Files:</div>
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                            <div className="flex items-center space-x-3 text-gray-300">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <div>
                                <span className="text-sm font-medium">{file.name}</span>
                                <span className="text-xs text-gray-400 ml-2">
                                  ({(file.size / 1024 / 1024).toFixed(1)}MB)
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeAttachedFile(index)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleAddReply}
                    disabled={!newReply.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Add Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>

            {/* Task Progress */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white capitalize">{task.status}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: task.status === 'completed' ? '100%' : 
                             task.status === 'in-progress' ? '50%' : '10%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;