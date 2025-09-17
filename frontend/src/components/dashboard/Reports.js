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
  XCircle,
  MessageSquare,
  Star,
  Zap,
  Play,
  Pause,
  RotateCcw,
  MoreVertical,
  Edit,
  Archive,
  Settings,
  Bell,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  User as UserIcon,
  CheckCircle2,
  XCircle as XCircleIcon,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';
import UserAvatar from '../common/userAvathar';

// Enhanced Status Badge Component
const StatusBadge = ({ status, type = "status" }) => {
  const getStatusConfig = (status, type) => {
    if (type === "approval") {
      switch (status?.toLowerCase()) {
        case 'approved':
          return { 
            color: 'bg-emerald-500 text-white', 
            icon: CheckCircle2,
            text: 'Approved'
          };
        case 'rejected':
          return { 
            color: 'bg-red-500 text-white', 
            icon: XCircleIcon,
            text: 'Rejected'
          };
        case 'pending':
        default:
          return { 
            color: 'bg-yellow-500 text-white', 
            icon: Clock,
            text: 'Pending'
          };
      }
    } else {
      switch (status?.toLowerCase()) {
        case 'completed':
          return { 
            color: 'bg-green-500 text-white', 
            icon: CheckCircle2,
            text: 'Completed'
          };
        case 'in progress':
        case 'in-progress':
          return { 
            color: 'bg-blue-500 text-white', 
            icon: Play,
            text: 'In Progress'
          };
        case 'not started':
          return { 
            color: 'bg-gray-500 text-white', 
            icon: Pause,
            text: 'Not Started'
          };
        case 'on hold':
          return { 
            color: 'bg-orange-500 text-white', 
            icon: AlertTriangle,
            text: 'On Hold'
          };
        default: 
          return { 
            color: 'bg-gray-500 text-white', 
            icon: Info,
            text: status || 'Unknown'
          };
      }
    }
  };

  const config = getStatusConfig(status, type);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return { 
          color: 'bg-red-500 text-white', 
          icon: AlertTriangle,
          text: 'Urgent'
        };
      case 'high':
        return { 
          color: 'bg-orange-500 text-white', 
          icon: TrendingUp,
          text: 'High'
        };
      case 'medium':
        return { 
          color: 'bg-yellow-500 text-white', 
          icon: Clock,
          text: 'Medium'
        };
      case 'low':
        return { 
          color: 'bg-green-500 text-white', 
          icon: CheckCircle,
          text: 'Low'
        };
      default: 
        return { 
          color: 'bg-gray-500 text-white', 
          icon: Info,
          text: priority || 'Medium'
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

// Report Card Component
const ReportCard = ({ update, onView, onApprove, onReject }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <UserAvatar
              avatar={update.employee?.avatar}
              name={update.employee?.name}
              size="md"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{update.employee?.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(update.date).toLocaleDateString()}</span>
                <ClockIcon className="w-4 h-4 ml-2" />
                <span>{new Date(update.date).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={update.status} type="status" />
            <StatusBadge status={update.approvalStatus} type="approval" />
            {update.priority && <PriorityBadge priority={update.priority} />}
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Project:</span>
            <span className="text-sm text-blue-400 font-semibold">{update.project_title || 'No Project'}</span>
          </div>
        </div>

        {/* Update Content */}
        <div className="mb-4">
          <p className="text-gray-300 leading-relaxed">
            {update.update || update.taskDescription || 'No description provided'}
          </p>
        </div>

        {/* Additional Details */}
        {(update.plannedTime || update.actualTime || update.notes) && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="text-sm font-medium">View Details</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
              <div className="mt-3 space-y-3 p-4 bg-gray-700 rounded-lg">
                {(update.plannedTime || update.actualTime) && (
                  <div className="grid grid-cols-2 gap-4">
                    {update.plannedTime && (
                      <div>
                        <span className="text-sm text-gray-400">Planned Time:</span>
                        <span className="text-sm text-white ml-2 font-medium">{update.plannedTime}h</span>
                      </div>
                    )}
                    {update.actualTime && (
                      <div>
                        <span className="text-sm text-gray-400">Actual Time:</span>
                        <span className="text-sm text-white ml-2 font-medium">{update.actualTime}h</span>
                      </div>
                    )}
                  </div>
                )}
                
                {update.notes && (
                  <div>
                    <span className="text-sm text-gray-400">Notes:</span>
                    <p className="text-sm text-gray-300 mt-1">{update.notes}</p>
                  </div>
                )}

                {update.plansForNextDay && (
                  <div>
                    <span className="text-sm text-gray-400">Next Day Plans:</span>
                    <p className="text-sm text-gray-300 mt-1">{update.plansForNextDay}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Image Attachment */}
        {update.imageUrl && (
          <div className="mb-4">
            <img 
              src={update.imageUrl}
              alt="Update attachment"
              className="w-32 h-32 object-cover rounded-lg border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
              onClick={() => window.open(update.imageUrl, '_blank')}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(update)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
            
            {update.approvalStatus === 'Pending' && (
              <>
                <button
                  onClick={() => onApprove(update._id, 'approve')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => onReject(update._id, 'reject')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  <XCircleIcon className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // list or grid

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

  // Filter and sort updates
  const filteredUpdates = dailyUpdates
    .filter(update => {
      const matchesProject = selectedProject === 'all' || update.project_title === selectedProject;
      const matchesStatus = selectedStatus === 'all' || update.status === selectedStatus;
      const matchesEmployee = selectedEmployee === 'all' || update.employee?.name?.toLowerCase().includes(selectedEmployee.toLowerCase());
      const matchesSearch = !searchTerm || 
        update.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.update?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesProject && matchesStatus && matchesEmployee && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'employee':
          aValue = a.employee?.name || '';
          bValue = b.employee?.name || '';
          break;
        case 'project':
          aValue = a.project_title || '';
          bValue = b.project_title || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Group updates by project for grid view
  const updatesByProject = filteredUpdates.reduce((acc, update) => {
    const projectTitle = update.project_title || 'No Project';
    if (!acc[projectTitle]) {
      acc[projectTitle] = [];
    }
    acc[projectTitle].push(update);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Error/Success Messages */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-500/30 text-red-300 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-900/20 border border-green-500/30 text-green-300 rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-700"></div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Daily Reports</h1>
              <p className="text-gray-400">View and manage employee daily updates</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="employee">Employee</option>
                <option value="project">Project</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">View:</span>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {filteredUpdates.length} update{filteredUpdates.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading reports...</p>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Updates Found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-6">
            {filteredUpdates.map((update) => (
              <ReportCard
                key={update._id}
                update={update}
                onView={handleViewUpdate}
                onApprove={handleApproveUpdate}
                onReject={handleApproveUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(updatesByProject).map(([projectTitle, updates]) => (
              <div key={projectTitle} className="bg-gray-900 rounded-2xl border border-gray-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{projectTitle}</h2>
                      <p className="text-sm text-gray-400">{updates.length} update{updates.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                      {updates.length}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {updates.map((update) => (
                      <ReportCard
                        key={update._id}
                        update={update}
                        onView={handleViewUpdate}
                        onApprove={handleApproveUpdate}
                        onReject={handleApproveUpdate}
                      />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Update Details</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <UserAvatar
                  avatar={selectedUpdate.employee?.avatar}
                  name={selectedUpdate.employee?.name}
                  size="lg"
                />
                <div>
                  <h4 className="text-lg font-semibold text-white">{selectedUpdate.employee?.name}</h4>
                  <p className="text-sm text-gray-400">{formatDate(selectedUpdate.date)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-300 mb-2">Project:</h5>
                  <p className="text-sm text-white bg-gray-800 p-3 rounded-lg">{selectedUpdate.project_title || 'No Project'}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-300 mb-2">Status:</h5>
                  <div className="flex space-x-2">
                    <StatusBadge status={selectedUpdate.status} type="status" />
                    <StatusBadge status={selectedUpdate.approvalStatus} type="approval" />
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-300 mb-2">Update:</h5>
                <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">{selectedUpdate.update || selectedUpdate.taskDescription || 'No description provided'}</p>
              </div>

              {selectedUpdate.imageUrl && (
                <div>
                  <h5 className="font-medium text-gray-300 mb-2">Attachment:</h5>
                  <img 
                    src={selectedUpdate.imageUrl}
                    alt="Update attachment"
                    className="w-full max-w-md object-cover rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={() => window.open(selectedUpdate.imageUrl, '_blank')}
                  />
                </div>
              )}

              {selectedUpdate.approvalStatus === 'Pending' && (
                <div className="flex space-x-3 pt-6 border-t border-gray-800">
                  <button
                    onClick={() => {
                      handleApproveUpdate(selectedUpdate._id, 'approve');
                      setShowUpdateModal(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleApproveUpdate(selectedUpdate._id, 'reject');
                      setShowUpdateModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
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