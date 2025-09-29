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
  Eye,
  MessageSquare,
  X,
  Download,
  ExternalLink
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
  const [showCommentsModal, setShowCommentsModal] = useState(false);

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
  // Collect all attachments from a task's comments
  const getTaskAttachments = (task) => {
    if (!Array.isArray(task?.comments)) return [];
    const files = [];
    task.comments.forEach(c => {
      if (Array.isArray(c.attachments)) {
        c.attachments.forEach(a => files.push(a));
      }
    });
    return files;
  };
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

  // Comments modal handler
  const handleViewComments = (task) => {
    setSelectedTask(task);
    setShowCommentsModal(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      <section className="bg-white w-full min-h-screen rounded-none shadow-none border border-gray-200 mx-0 my-0 animate-fade-in">
                    <div className="flex items-center justify-between px-10 py-8 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                          <Briefcase className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
                          <p className="text-sm text-gray-500">Tasks assigned by your manager</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {getAllTasks().length} task{getAllTasks().length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-10">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                          <p className="text-gray-600 mt-4">Loading your tasks...</p>
                        </div>
                      ) : getAllTasks().length === 0 ? (
                        <div className="text-center py-8">
                          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-700">No tasks assigned yet.</p>
                          <p className="text-sm text-gray-500 mt-2">Your manager will assign tasks here.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                                <th className="py-3 pr-4 font-semibold">Task#</th>
                                <th className="py-3 pr-4 font-semibold">Task</th>
                                <th className="py-3 pr-4 font-semibold">Status</th>
                                <th className="py-3 pr-4 font-semibold">Files</th>
                                <th className="py-3 pr-4 font-semibold">Due Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getAllTasks().map((task, idx) => {
                                const files = getTaskAttachments(task);
                                return (
                                  <tr key={task._id || `${task.projectId}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewTask(task)}>
                                    <td className="py-3 pr-4 text-blue-600">
                                      <span className="hover:underline">#{(task.code || task._id || '').toString().slice(-5)}</span>
                                    </td>
                                    <td className="py-3 pr-4 text-gray-900">{task.title}</td>
                                    <td className="py-3 pr-4">
                                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status?.replace('_','-')}</span>
                                    </td>
                                    <td className="py-3 pr-4">
                                      {files.length === 0 ? (
                                        <span className="text-gray-400 text-sm">—</span>
                                      ) : (
                                        <div className="flex flex-wrap gap-2">
                                          {files.map((f, i) => (
                                            <a key={i} href={`http://localhost:5000${f.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 text-sm underline">
                                              {f.originalName || f.name || `File ${i+1}`}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3 pr-4 text-red-500">{(task.dueDate || task.deadline) ? new Date(task.dueDate || task.deadline).toLocaleDateString('en-GB') : '-'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </section>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Task Details</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-orange-400 mb-2">{selectedTask.title}</h4>
                  <p className="text-gray-300">{selectedTask.description || 'No description available'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400">Project:</span>
                    <span className="text-white">{selectedTask.projectTitle}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400">Phase:</span>
                    <span className="text-white">{selectedTask.stepName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400">Due:</span>
                    <span className="text-white">
                      {selectedTask.dueDate || selectedTask.deadline 
                        ? new Date(selectedTask.dueDate || selectedTask.deadline).toLocaleDateString()
                        : 'No deadline'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                </div>
                
                {selectedTask.comments && selectedTask.comments.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-semibold text-white">Comments ({selectedTask.comments.length})</h5>
                      <button
                        onClick={() => {
                          setShowTaskModal(false);
                          handleViewComments(selectedTask);
                        }}
                        className="text-orange-400 hover:text-orange-300 text-sm"
                      >
                        View All Comments
                      </button>
                    </div>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedTask.comments.slice(-3).map((comment, index) => (
                        <div key={comment._id || index} className="bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium text-sm">
                              {comment.author?.name || 'Unknown User'}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.text}</p>
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {comment.attachments.map((attachment, idx) => (
                                <a 
                                  key={idx}
                                  href={`http://localhost:5000${attachment.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 px-2 py-1 rounded underline"
                                >
                                  📎 {attachment.originalName || attachment.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((comment, index) => (
                    <div key={comment._id || index} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {comment.author?.name || 'Unknown User'}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{comment.text}</p>
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
                                <span>{attachment.originalName || attachment.name}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No comments yet.</p>
                    <p className="text-gray-500 text-sm">Comments from your manager will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default MyTasks; 