import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { managerService } from '../../services/api';
import Navbar from '../common/Navbar';
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
  Search
} from 'lucide-react';
import UserAvatar from '../common/userAvathar';

const Reports = () => {
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [updatesRes, projectsRes] = await Promise.all([
        managerService.getEmployeeUpdates(),
        managerService.getProjects()
      ]);
      
      setDailyUpdates(updatesRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUpdate = async (updateId, action) => {
    try {
      await managerService.approveRejectUpdate(updateId, action);
      // Refresh data after approval/rejection
      fetchData();
    } catch (error) {
      console.error('Failed to update approval status:', error);
      setError('Failed to update approval status');
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
      {/* Navigation Bar */}
      <Navbar userRole="manager" />

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
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
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">{update.update}</p>
                        </div>

                        {update.imageUrl && (
                          <div className="mb-3">
                            <img 
                              src={update.imageUrl} 
                              alt="Update attachment"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
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
                                <AlertCircle className="w-3 h-3" />
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
    </div>
  );
};

export default Reports; 