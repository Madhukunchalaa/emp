import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { managerService } from '../../services/api';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock as ClockIcon,
  FileText,
  Users,
  BarChart3,
  Eye,
  MessageSquare,
  Edit,
  Archive,
  MoreVertical,
  DollarSign,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Star,
  Award,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Filter,
  Search,
  Plus,
  Settings,
  Bell,
  RefreshCw
} from 'lucide-react';

// Enhanced UserAvatar component
const UserAvatar = ({ name, avatar, className = "", size = "md", status = "offline" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm", 
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl"
  };
  
  const statusColors = {
    online: "bg-green-400",
    offline: "bg-gray-400",
    busy: "bg-red-400",
    away: "bg-yellow-400"
  };

  if (avatar) {
    return (
      <div className={`relative ${className}`}>
        <img 
          src={avatar} 
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-lg`}
        />
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusColors[status]} rounded-full border-2 border-white`}></div>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-white`}>
        {name?.charAt(0) || 'U'}
      </div>
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusColors[status]} rounded-full border-2 border-white`}></div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, size = "md" }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return { 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
          icon: CheckCircle,
          text: 'Completed'
        };
      case 'in-progress':
      case 'in progress':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: Play,
          text: 'In Progress'
        };
      case 'pending':
        return { 
          color: 'bg-amber-100 text-amber-800 border-amber-200', 
          icon: Clock,
          text: 'Pending'
        };
      case 'pending approval':
        return { 
          color: 'bg-orange-100 text-orange-800 border-orange-200', 
          icon: AlertCircle,
          text: 'Pending Approval'
        };
      case 'overdue':
      case 'delayed':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: AlertCircle,
          text: 'Overdue'
        };
      case 'rejected':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: XCircle,
          text: 'Rejected'
        };
      case 'on-track':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: TrendingUp,
          text: 'On Track'
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: Clock,
          text: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : size === "lg" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = "text-blue-500" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${color} transition-all duration-500 ease-in-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{progress}%</span>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend = null }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200", 
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200"
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectUpdates, setProjectUpdates] = useState([]);
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

        // Fetch project-specific updates
        await fetchProjectUpdates(projectId);
        
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

  const fetchProjectUpdates = async (projectId) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
      const endDate = new Date();
      
      const response = await managerService.getProjectUpdates(
        projectId, 
        startDate.toISOString(), 
        endDate.toISOString()
      );
      
      setProjectUpdates(response.data.updates || []);
    } catch (error) {
      console.error('Failed to fetch project updates:', error);
      setProjectUpdates([]);
    }
  };

  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getProjectStatus = () => {
    const progress = calculateProgress();
    if (progress >= 80) return 'On Track';
    if (progress >= 50) return 'In Progress';
    return 'Delayed';
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress' || t.status === 'in progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    
    return { total, completed, inProgress, pending, overdue };
  };

  const getBudgetStats = () => {
    const budget = project?.budget || 20000;
    const used = Math.round(budget * (calculateProgress() / 100));
    const remaining = budget - used;
    
    return { budget, used, remaining };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Project Details</h2>
          <p className="text-gray-600">Please wait while we fetch the latest information...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The requested project could not be found.'}</p>
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const taskStats = getTaskStats();
  const budgetStats = getBudgetStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Error/Success Messages */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Projects</span>
          </Link>

          {/* Project Header Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <p className="text-blue-100 text-lg mb-4 max-w-2xl">{project.description}</p>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={getProjectStatus()} size="lg" />
                      <div className="flex items-center gap-2 text-blue-100">
                        <Calendar className="w-4 h-4" />
                        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium">
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Project
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="p-8 bg-black/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Project Progress</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span>Last updated {new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <ProgressRing progress={calculateProgress()} size={120} color="text-blue-500" />
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Completed Tasks:</span>
                      <span className="font-semibold text-gray-900 ml-2">{taskStats.completed}/{taskStats.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">In Progress:</span>
                      <span className="font-semibold text-gray-900 ml-2">{taskStats.inProgress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-black/5 rounded-xl p-2 shadow-sm border border-gray-200 inline-flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'updates', label: 'Updates', icon: Activity },
              { id: 'budget', label: 'Budget', icon: DollarSign }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Metrics Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/5 rounded-2xl p-6">
                <MetricCard
                  title="Total Tasks"
                  value={taskStats.total}
                  subtitle={`${taskStats.completed} completed`}
                  icon={CheckCircle}
                  color="blue"
                />
                <MetricCard
                  title="Team Members"
                  value={teamMembers.length}
                  subtitle="Active contributors"
                  icon={Users}
                  color="purple"
                />
                <MetricCard
                  title="Budget Used"
                  value={`$${budgetStats.used.toLocaleString()}`}
                  subtitle={`of $${budgetStats.budget.toLocaleString()}`}
                  icon={DollarSign}
                  color="green"
                />
                <MetricCard
                  title="Project Updates"
                  value={projectUpdates.length}
                  subtitle="This month"
                  icon={Activity}
                  color="orange"
                />
              </div>

              {/* Team Overview */}
              <div className="bg-black/10 rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
                <div className="space-y-4">
                  {teamMembers.slice(0, 4).map((member, index) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <UserAvatar 
                        name={member.name} 
                        avatar={member.avatar}
                        size="md"
                        status={index % 2 === 0 ? "online" : "offline"}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {tasks.filter(t => t.assignedTo?._id === member._id).length}
                        </p>
                        <p className="text-xs text-gray-600">tasks</p>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length > 4 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-600">
                        +{teamMembers.length - 4} more members
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-black/5 rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Task</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Assignee</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Step</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-3">
                              <UserAvatar name={task.assignedTo.name} avatar={task.assignedTo.avatar} size="sm" />
                              <span className="text-gray-900">{task.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{task.stepName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={task.status} size="sm" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-6">
              <div className="bg-black/5 rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Project Updates</h3>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      Add Update
                    </button>
                  </div>
                </div>

                {projectUpdates.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h4>
                    <p className="text-gray-600 mb-6">Project updates will appear here as team members submit their work.</p>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Request Update
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectUpdates.map((update) => (
                      <div key={update._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-4">
                          <UserAvatar 
                            name={update.employee?.name} 
                            avatar={update.employee?.avatar}
                            size="md"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{update.employee?.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString()}
                                </p>
                              </div>
                              <StatusBadge status={update.approvalStatus || 'pending'} size="sm" />
                            </div>
                            
                            {update.project_title && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-700">Project: </span>
                                <span className="text-sm text-gray-600">{update.project_title}</span>
                              </div>
                            )}

                            {update.taskDescription && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-700">Task: </span>
                                <span className="text-sm text-gray-600">{update.taskDescription}</span>
                              </div>
                            )}

                            <p className="text-gray-700 mb-4">
                              {update.update || update.description || 'No description provided'}
                            </p>

                            {(update.plannedTime || update.actualTime) && (
                              <div className="flex items-center gap-6 mb-4 text-sm">
                                {update.plannedTime && (
                                  <div>
                                    <span className="text-gray-600">Planned: </span>
                                    <span className="font-medium text-gray-900">{update.plannedTime}h</span>
                                  </div>
                                )}
                                {update.actualTime && (
                                  <div>
                                    <span className="text-gray-600">Actual: </span>
                                    <span className="font-medium text-gray-900">{update.actualTime}h</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {update.imageUrl && (
                              <div className="mb-4">
                                <img 
                                  src={update.imageUrl} 
                                  alt="Update attachment"
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                                <AlertCircle className="w-4 h-4" />
                                Reject
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                                <MessageSquare className="w-4 h-4" />
                                Comment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black/5 rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Overview</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total Budget</span>
                      <span className="text-2xl font-bold text-gray-900">${budgetStats.budget.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">${budgetStats.used.toLocaleString()}</div>
                      <div className="text-sm text-green-700">Used</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">${budgetStats.remaining.toLocaleString()}</div>
                      <div className="text-sm text-blue-700">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/5 rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Development</span>
                    <span className="font-semibold text-gray-900">${Math.round(budgetStats.used * 0.6).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Design</span>
                    <span className="font-semibold text-gray-900">${Math.round(budgetStats.used * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Testing</span>
                    <span className="font-semibold text-gray-900">${Math.round(budgetStats.used * 0.1).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;