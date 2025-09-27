import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  MessageSquare, 
  Paperclip, 
  Eye, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  FileText,
  Download,
  Upload,
  Send,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { managerService } from '../../services/api';
import { formatToIST, formatDateToIST } from '../../utils/timezone';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [newComment, setNewComment] = useState('');
  const [commentFiles, setCommentFiles] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingComment, setAddingComment] = useState(false);

  // Fetch all tasks from projects and design tasks
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project tasks
      const projectsRes = await managerService.getProjects();
      const projects = projectsRes.data || [];
      
      // Fetch design tasks
      let designTasks = [];
      try {
        const designTasksRes = await managerService.getDesignTasks();
        designTasks = designTasksRes.data || [];
      } catch (designError) {
        console.warn('Design tasks not available:', designError);
        // Continue without design tasks if they're not available
      }
      
      // Combine and format all tasks
      const allTasks = [];
      
      // Process project tasks
      if (projects && Array.isArray(projects)) {
        projects.forEach(project => {
          if (project.steps && Array.isArray(project.steps)) {
            project.steps.forEach(step => {
              if (step.tasks && Array.isArray(step.tasks)) {
                step.tasks.forEach(task => {
                  allTasks.push({
                    _id: task._id,
                    title: task.title,
                    description: task.description || '',
                    project: project.title,
                    projectId: project._id,
                    step: step.name,
                    assignedTo: task.assignedTo,
                    status: task.status,
                    priority: task.priority,
                    deadline: task.deadline,
                    createdAt: task.createdAt || project.createdAt,
                    updatedAt: task.updatedAt || project.updatedAt,
                    comments: task.comments || [],
                    type: 'project'
                  });
                });
              }
            });
          }
        });
      }
      
      // Process design tasks
      if (designTasks && Array.isArray(designTasks)) {
        designTasks.forEach(task => {
          allTasks.push({
            _id: task._id,
            title: task.content,
            description: task.content,
            project: 'Design Task',
            projectId: null,
            step: 'Direct Assignment',
            assignedTo: task.assignedTo,
            status: task.status,
            priority: task.priority,
            deadline: task.dueDate,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            comments: task.comments || [],
            type: 'design'
          });
        });
      }
      
      // Sort by latest update
      allTasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setTasks(allTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Debug function to test API endpoints
  const testAPIEndpoints = async () => {
    try {
      console.log('Testing API endpoints...');
      
      // Test projects endpoint
      const projectsRes = await managerService.getProjects();
      console.log('Projects response:', projectsRes);
      
      // Test design tasks endpoint
      try {
        const designTasksRes = await managerService.getDesignTasks();
        console.log('Design tasks response:', designTasksRes);
      } catch (designError) {
        console.log('Design tasks error (expected if no design tasks exist):', designError);
      }
      
    } catch (error) {
      console.error('API test error:', error);
    }
  };

  // Uncomment the line below to test API endpoints
  // useEffect(() => { testAPIEndpoints(); }, []);

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.assignedTo?.name && task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle task status update
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      setUpdatingStatus(true);
      
      // Find the task to determine its type
      const task = tasks.find(t => t._id === taskId);
      if (!task) {
        setError('Task not found');
        return;
      }
      
      let response;
      if (task.type === 'project') {
        response = await managerService.updateTaskStatus(taskId, { status: newStatus });
      } else {
        response = await managerService.updateDesignTaskStatus(taskId, { status: newStatus });
      }
      
      // Update local state
      setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t
      ));
      
      // Update selected task if it's the same
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus, updatedAt: new Date() }));
      }
      
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle adding comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    
    try {
      setAddingComment(true);
      setError(null); // Clear any previous errors
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('text', newComment);
      formData.append('taskId', selectedTask._id);
      
      // Add files to FormData if any
      if (commentFiles.length > 0) {
        commentFiles.forEach((file, index) => {
          formData.append('files', file);
        });
      }
      
      console.log('Sending comment data:', {
        text: newComment,
        taskId: selectedTask._id,
        filesCount: commentFiles.length
      });
      
      const response = await managerService.addTaskComment(formData);
      
      console.log('Comment response:', response);
      
      // Update local state
      const updatedTask = {
        ...selectedTask,
        comments: [...(selectedTask.comments || []), response.data],
        updatedAt: new Date()
      };
      
      setSelectedTask(updatedTask);
      setTasks(prev => prev.map(t => t._id === selectedTask._id ? updatedTask : t));
      
      setNewComment('');
      setCommentFiles([]);
      
      // Show success message briefly
      setSuccess('Comment added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error adding comment:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      let errorMessage = 'Failed to add comment. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setAddingComment(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setCommentFiles(prev => [...prev, ...files]);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-600">Manage and track all tasks across projects</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks, projects, or employees..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priority</option>
              <option value="title">Task Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchAllTasks}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{task.project}</span>
                      </div>
                      {task.deadline && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateToIST(task.deadline)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Updated {formatToIST(task.updatedAt)}</span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-700 text-sm line-clamp-2">{task.description}</p>
                    )}
                    
                    {task.comments && task.comments.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h3>
                <p className="text-gray-600">{selectedTask.project} • {selectedTask.step}</p>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Task Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Assigned To:</span>
                        <p className="font-medium">{selectedTask.assignedTo?.name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTask.status)}`}>
                            {selectedTask.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Priority:</span>
                        <p className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                            {selectedTask.priority}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Deadline:</span>
                        <p className="font-medium">
                          {selectedTask.deadline ? formatDateToIST(selectedTask.deadline) : 'No deadline'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                      <p className="text-gray-700">{selectedTask.description}</p>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Comments & Updates</h4>
                    
                    {/* Add Comment Form */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        <textarea
                          placeholder="Add a comment or update..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        
                        {/* File Upload */}
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">Attach Files</span>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </label>
                          {commentFiles.length > 0 && (
                            <span className="text-sm text-gray-600">
                              {commentFiles.length} file{commentFiles.length !== 1 ? 's' : ''} selected
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || addingComment}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            <span>{addingComment ? 'Adding...' : 'Add Comment'}</span>
                          </button>
                          
                          {/* Debug button - remove in production */}
                          <button
                            onClick={() => {
                              console.log('Current task:', selectedTask);
                              console.log('Comment text:', newComment);
                              console.log('Files:', commentFiles);
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded"
                          >
                            Debug
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {selectedTask.comments && selectedTask.comments.length > 0 ? (
                        selectedTask.comments.map((comment, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {comment.author?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium text-gray-900">
                                    {comment.author?.name || 'Unknown User'}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {formatToIST(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 mb-3">{comment.text}</p>
                                
                                {/* Attachments */}
                                {comment.attachments && comment.attachments.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600">Attachments:</p>
                                    <div className="space-y-1">
                                      {comment.attachments.map((attachment, attIndex) => (
                                        <div key={attIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                          <Paperclip className="w-4 h-4 text-gray-400" />
                                          <span className="text-sm text-gray-700">{attachment.originalName}</span>
                                          <span className="text-xs text-gray-500">
                                            ({formatFileSize(attachment.size)})
                                          </span>
                                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                                            <Download className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No comments yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Status Update */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                    <div className="space-y-2">
                      {['pending', 'in-progress', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(selectedTask._id, status)}
                          disabled={updatingStatus || selectedTask.status === status}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            selectedTask.status === status
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center space-x-2">
                            {status === 'pending' && <AlertCircle className="w-4 h-4" />}
                            {status === 'in-progress' && <Clock className="w-4 h-4" />}
                            {status === 'completed' && <CheckCircle className="w-4 h-4" />}
                            <span className="capitalize">{status.replace('-', ' ')}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Task Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Task Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span>{formatToIST(selectedTask.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span>{formatToIST(selectedTask.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comments:</span>
                        <span>{selectedTask.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
