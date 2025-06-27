import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { managerService } from '../../services/api';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Users,
  FileText,
  Target,
  BarChart3,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Play,
  Pause,
  CheckSquare
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await managerService.getProjects();
      const projectsData = Array.isArray(res.data) ? res.data : [];
      setProjects(projectsData);
      
      // Calculate stats
      const now = new Date();
      setStats({
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter(project => project.status === 'active').length,
        completedProjects: projectsData.filter(project => project.status === 'completed').length,
        overdueProjects: projectsData.filter(project => 
          project.status === 'active' && new Date(project.deadline) < now
        ).length
      });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Project Management
          </h1>
          <p className="text-gray-600">Track and manage all your projects</p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalProjects}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Total Projects</h3>
            <p className="text-sm text-gray-500">All projects</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.activeProjects}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Active</h3>
            <p className="text-sm text-gray-500">In progress</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.completedProjects}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
            <p className="text-sm text-gray-500">Finished projects</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.overdueProjects}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Overdue</h3>
            <p className="text-sm text-gray-500">Past deadline</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <Link
              to="/assign-project"
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center justify-between p-5 border-b border-white/20">
            <h2 className="text-xl font-bold text-gray-800">All Projects</h2>
            <div className="flex space-x-2">
              <span className="text-sm text-gray-500">
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
            </div>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No projects found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <div key={project._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress || 0)}`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                        {isOverdue(project.deadline) && (
                          <span className="text-red-500 text-xs font-medium">OVERDUE</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{project.assignedEmployees?.length || 0} team members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>Budget: ${project.budget || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/project/${project._id}`}
                        className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </Link>
                      <div className="flex space-x-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Project Details</h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">{selectedProject.title}</h4>
                <p className="text-sm text-gray-600">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className={`inline-block ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <div className={`inline-block ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(selectedProject.priority)}`}>
                    {selectedProject.priority}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Deadline:</span>
                  <span className="ml-2 text-gray-700">{new Date(selectedProject.deadline).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <span className="ml-2 text-gray-700">${selectedProject.budget || 'N/A'}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Progress:</span>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{selectedProject.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(selectedProject.progress || 0)}`}
                      style={{ width: `${selectedProject.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Link
                to={`/project/${selectedProject._id}`}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl hover:shadow-md transition-all duration-200 text-center"
              >
                View Full Details
              </Link>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200">
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects; 