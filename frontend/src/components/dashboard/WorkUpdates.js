import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Clock, 
  FileText, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Send,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Target,
  Link as LinkIcon,
  StickyNote
} from 'lucide-react';
import { createWorkUpdate, fetchWorkUpdates } from '../../store/slices/employeeSlice';
import { employeeService } from '../../services/api';

const WorkUpdates = () => {
  const dispatch = useDispatch();
  const { workUpdates = [], loading = false, error = null } = useSelector((state) => state.employee || {});
  const { user = { name: 'Employee' } } = useSelector((state) => state.auth || {});

  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_title: '',
    status: 'In Progress',
    update: '',
    finishBy: '',
    project: '',
    taskDescription: '',
    priority: 'Medium',
    plannedTime: '',
    actualTime: '',
    linkReference: '',
    notes: '',
    plansForNextDay: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    dispatch(fetchWorkUpdates());
    fetchProjects();
  }, [dispatch]);

  const fetchProjects = async () => {
    try {
      const response = await employeeService.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'project') {
      const selectedProject = projects.find(p => p._id === value);
      setFormData(prev => ({
        ...prev,
        project: value,
        project_title: selectedProject ? selectedProject.title : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFiles(file ? [file] : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.taskDescription.trim()) {
      alert('Please enter task description');
      return;
    }
    if (!formData.plannedTime) {
      alert('Please enter planned time');
      return;
    }
    if (!formData.actualTime) {
      alert('Please enter actual time');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add required fields that backend expects
      formDataToSend.append('update', formData.taskDescription); // Use taskDescription as update
      formDataToSend.append('finishBy', new Date().toISOString()); // Set finishBy to current date
      
      // Ensure project_title is set (use project title or a default)
      if (!formData.project_title) {
        formDataToSend.set('project_title', formData.project || 'General Work');
      }
      
      // Add file if selected
      if (selectedFiles.length > 0) {
        formDataToSend.append('image', selectedFiles[0]);
      }

      console.log('Submitting work update with data:', Object.fromEntries(formDataToSend));
      const result = await dispatch(createWorkUpdate(formDataToSend));
      
      if (result.type.endsWith('/fulfilled')) {
        // Success - reset form and close
        setFormData({
          project_title: '',
          status: 'In Progress',
          update: '',
          finishBy: '',
          project: '',
          taskDescription: '',
          priority: 'Medium',
          plannedTime: '',
          actualTime: '',
          linkReference: '',
          notes: '',
          plansForNextDay: ''
        });
        setSelectedFiles([]);
        setShowForm(false);
        alert('Work update submitted successfully!');
      } else {
        // Error - show error message
        alert('Failed to submit work update. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting work update:', error);
      alert('Error submitting work update. Please check the console for details.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500 text-white';
      case 'In Progress': return 'bg-blue-500 text-white';
      case 'Not Started': return 'bg-gray-500 text-white';
      case 'On Hold': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Work Updates</h1>
          <p className="text-gray-300">Track your daily work progress and time</p>
        </div>

        {/* Add Work Update Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{showForm ? 'Cancel' : 'Add Work Update'}</span>
          </button>
        </div>

        {/* Work Update Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Submit Work Update</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project/Client */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project/Client *</label>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>{project.title}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Task Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Task Description *</label>
                  <textarea
                    name="taskDescription"
                    value={formData.taskDescription}
                    onChange={handleInputChange}
                    placeholder="Describe the task you worked on..."
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-400"
                    rows={3}
                    required
                  />
                </div>

                {/* Planned Time */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Planned Time (hrs) *</label>
                  <input
                    type="number"
                    step="0.5"
                    name="plannedTime"
                    value={formData.plannedTime}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-400"
                    required
                  />
                </div>

                {/* Actual Time */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Actual Time (hrs) *</label>
                  <input
                    type="number"
                    step="0.5"
                    name="actualTime"
                    value={formData.actualTime}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-400"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                {/* Link/Reference */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Link/Reference</label>
                  <input
                    type="url"
                    name="linkReference"
                    value={formData.linkReference}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes or comments..."
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-400"
                    rows={2}
                  />
                </div>

                {/* Plans for Next Day */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Plans for Next Day</label>
                  <textarea
                    name="plansForNextDay"
                    value={formData.plansForNextDay}
                    onChange={handleInputChange}
                    placeholder="What do you plan to work on tomorrow?"
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-400"
                    rows={2}
                  />
                </div>

                {/* File Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Attach File (Optional)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-black py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Work Update</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Work Updates List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading work updates...</p>
            </div>
          ) : workUpdates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No work updates submitted yet</p>
              <p className="text-sm text-gray-400 mt-2">Submit your first work update to get started</p>
            </div>
          ) : (
            workUpdates.map((update) => (
              <div key={update._id} className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{update.project_title || 'No Project'}</h3>
                    <p className="text-gray-300 mb-2">{update.taskDescription}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(update.date).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{update.plannedTime}h planned / {update.actualTime}h actual</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                      {update.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                      {update.priority}
                    </span>
                  </div>
                </div>

                {update.linkReference && (
                  <div className="mb-3">
                    <a
                      href={update.linkReference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>View Reference</span>
                    </a>
                  </div>
                )}

                {update.notes && (
                  <div className="mb-3">
                    <div className="flex items-start space-x-2">
                      <StickyNote className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Notes:</p>
                        <p className="text-gray-300 text-sm">{update.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {update.plansForNextDay && (
                  <div className="mb-3">
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Plans for Next Day:</p>
                        <p className="text-gray-300 text-sm">{update.plansForNextDay}</p>
                      </div>
                    </div>
                  </div>
                )}

                {update.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={update.imageUrl}
                      alt="Work update attachment"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkUpdates;
