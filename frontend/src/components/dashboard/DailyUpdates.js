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
  Image as ImageIcon
} from 'lucide-react';
import { createDailyUpdate, fetchDailyUpdates } from '../../store/slices/employeeSlice';
import { employeeService } from '../../services/api';

const DailyUpdates = () => {
  const dispatch = useDispatch();
  const { dailyUpdates = [], loading = false, error = null } = useSelector((state) => state.employee || {});
  const { user = { name: 'Employee' } } = useSelector((state) => state.auth || {});

  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_title: '',
    status: 'In Progress',
    update: '',
    finishBy: '',
    project: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    dispatch(fetchDailyUpdates());
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
    const file = e.target.files[0]; // Only take the first file
    setSelectedFiles(file ? [file] : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'images') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Add single image file if selected
    if (selectedFiles.length > 0) {
      formDataToSend.append('image', selectedFiles[0]);
    }

    // Debug: log all form data values
    for (let pair of formDataToSend.entries()) {
      console.log('FormData:', pair[0], pair[1]);
    }

    try {
      await dispatch(createDailyUpdate(formDataToSend));
      setFormData({
        project_title: '',
        status: 'In Progress',
        update: '',
        finishBy: '',
        project: ''
      });
      setSelectedFiles([]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to submit update:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Stats for sidebar
  const totalUpdates = dailyUpdates.length;
  const todaysUpdates = dailyUpdates.filter(update => new Date(update.date).toDateString() === new Date().toDateString()).length;
  const lastUpdate = dailyUpdates.length > 0 ? formatDate(dailyUpdates[0].date) : 'No updates';

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/30 p-6 fixed left-0 top-0 z-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-orange-400 to-pink-400 rounded-full" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">Employee</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Daily Updates</h1>
          <div className="text-xs text-gray-500">Your update overview</div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-semibold mb-2">Stats</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600"><FileText className="w-4 h-4" /> {totalUpdates} Total</div>
            <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> {todaysUpdates} Today</div>
            <div className="flex items-center gap-2 text-blue-600"><Clock className="w-4 h-4" /> {lastUpdate}</div>
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
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent mb-2">
                Daily Updates
              </h1>
              <p className="text-gray-600">Share your progress with your manager</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Update</span>
            </button>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-8 mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-orange-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{totalUpdates}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Total Updates</h3>
              <p className="text-sm text-gray-500">Submitted so far</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-green-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{todaysUpdates}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Today's Updates</h3>
              <p className="text-sm text-gray-500">Submitted today</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-blue-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{lastUpdate}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Last Update</h3>
              <p className="text-sm text-gray-500">Most recent submission</p>
            </div>
          </div>
          {/* Updates List */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Update History</h2>
                  <p className="text-sm text-gray-600">Your submitted updates</p>
                </div>
              </div>
            </div>
            <div className="p-10">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading your updates...</p>
                </div>
              ) : dailyUpdates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No updates submitted yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Start by submitting your first daily update.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyUpdates.map((update) => (
                    <div 
                      key={update._id} 
                      className="relative bg-white/90 backdrop-blur rounded-2xl shadow-xl border-l-8 border-orange-400 p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer group animate-fade-in"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{update.project_title}</h3>
                          <p className="text-sm text-gray-500">{formatDate(update.date)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            update.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            update.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            update.status === 'Not Started' ? 'bg-yellow-100 text-yellow-800' :
                            update.status === 'On Hold' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {update.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Update Details</h4>
                          <p className="text-gray-600">{update.update}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Finish By</h4>
                          <p className="text-gray-600">
                            {update.finishBy ? new Date(update.finishBy).toLocaleDateString() : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      {update.imageUrl && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700 mb-2">Attachments</h4>
                          <div className="flex space-x-2">
                            <img 
                              src={update.imageUrl} 
                              alt="Update attachment"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        </div>
                      )}
                      {/* Add a subtle animated bar at the bottom on hover */}
                      <div className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* New Update Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Submit Daily Update</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title (or custom)</label>
                  <input
                    type="text"
                    name="project_title"
                    value={formData.project_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter project title or select from dropdown above"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Details</label>
                  <textarea
                    name="update"
                    value={formData.update}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe what you worked on today, challenges faced, and next steps..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Finish By</label>
                  <input
                    type="date"
                    name="finishBy"
                    value={formData.finishBy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <div className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{selectedFiles[0].name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyUpdates; 