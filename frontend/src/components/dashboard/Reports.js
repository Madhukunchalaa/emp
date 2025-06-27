import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { managerService } from '../../services/api';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileText,
  PieChart,
  Activity,
  Target,
  Award,
  Eye,
  Search,
  XCircle
} from 'lucide-react';
import UserAvatar from '../common/userAvathar';

const Reports = () => {
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    if (Array.isArray(response)) return response;
    if (response.data && typeof response.data === 'object') {
      const keys = Object.keys(response.data);
      for (const key of keys) {
        if (Array.isArray(response.data[key])) return response.data[key];
      }
    }
    console.warn('Could not extract array data from response:', response);
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [updatesRes, projectsRes] = await Promise.all([
        managerService.getAllEmployeeUpdates(),
        managerService.getProjects()
      ]);
      
      setDailyUpdates(extractData(updatesRes));
      setProjects(extractData(projectsRes));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load reports data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUpdate = (update) => {
    setSelectedUpdate(update);
    setShowUpdateModal(true);
  };

  const handleApproveUpdate = async (updateId, action) => {
    try {
      setSuccess(null);
      setError(null);
      await managerService.approveRejectUpdate(updateId, action, 'Status updated by manager.');
      setSuccess(`Update has been ${action}.`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to update approval status:', error);
      setError('Failed to update approval status. Please try again.');
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

  // Filter updates based on selected criteria
  const filteredUpdates = dailyUpdates.filter(update => {
    const matchesProject = selectedProject === 'all' || update.project_title === selectedProject;
    const matchesStatus = selectedStatus === 'all' || update.status === selectedStatus;
    const matchesEmployee = selectedEmployee === 'all' || update.employee?.name?.toLowerCase().includes(selectedEmployee.toLowerCase());
    const matchesSearch = !searchTerm || 
      update.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.update?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesProject && matchesStatus && matchesEmployee && matchesSearch;
  });

  // Group updates by project
  const updatesByProject = filteredUpdates.reduce((acc, update) => {
    const projectTitle = update.project_title || 'No Project';
    if (!acc[projectTitle]) {
      acc[projectTitle] = [];
    }
    acc[projectTitle].push(update);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Error/Success Messages */}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Daily Updates Reports
            </h1>
            <p className="text-gray-600">View and manage employee daily updates by project</p>
          </div>
          <button
            onClick={fetchData}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project.title}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <input
                type="text"
                placeholder="Filter by employee..."
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Updates by Project */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading reports...</p>
          </div>
        ) : Object.keys(updatesByProject).length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No updates found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(updatesByProject).map(([projectTitle, updates]) => (
              <div key={projectTitle} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{projectTitle}</h2>
                      <p className="text-sm text-gray-600">{updates.length} updates</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div key={update._id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <UserAvatar
                              avatar={update.employee?.avatar}
                              name={update.employee?.name}
                              size="sm"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-800">{update.employee?.name}</h4>
                              <p className="text-xs text-gray-500">{formatDate(update.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              update.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              update.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              update.status === 'Not Started' ? 'bg-yellow-100 text-yellow-800' :
                              update.status === 'On Hold' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {update.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              update.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                              update.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {update.approvalStatus}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{update.update}</p>

                        <div className="flex items-center justify-end mt-4 space-x-2">
                          <button
                            onClick={() => handleViewUpdate(update)}
                            className="flex items-center space-x-1 bg-gray-200/70 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300/70 transition-all duration-200"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          {update.approvalStatus === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveUpdate(update._id, 'approve')}
                                className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-600 transition-all duration-200"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleApproveUpdate(update._id, 'reject')}
                                className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 transition-all duration-200"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Detail Modal */}
      {showUpdateModal && selectedUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Update Details</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserAvatar
                  avatar={selectedUpdate.employee?.avatar}
                  name={selectedUpdate.employee?.name}
                  size="sm"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedUpdate.employee?.name}</h4>
                  <p className="text-xs text-gray-500">{formatDate(selectedUpdate.date)}</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Project:</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{selectedUpdate.project_title}</p>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">Update:</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{selectedUpdate.update}</p>
              </div>

              {selectedUpdate.imageUrl && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Attachment:</h5>
                  <img 
                    src={`http://localhost:5000/${selectedUpdate.imageUrl}`}
                    alt="Update attachment"
                    className="w-full max-w-xs object-cover rounded-lg border border-gray-200 cursor-pointer"
                    onClick={() => window.open(`http://localhost:5000/${selectedUpdate.imageUrl}`, '_blank')}
                  />
                </div>
              )}

              {selectedUpdate.approvalStatus === 'Pending' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleApproveUpdate(selectedUpdate._id, 'approve');
                      setShowUpdateModal(false);
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition-all duration-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleApproveUpdate(selectedUpdate._id, 'reject');
                      setShowUpdateModal(false);
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition-all duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 