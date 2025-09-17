import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// UserAvatar component
const UserAvatar = ({ name, avatar, className = "" }) => {
  if (avatar) {
    return (
      <img 
        src={avatar} 
        alt={name}
        className={`w-8 h-8 rounded-full object-cover ${className}`}
      />
    );
  }
  
  return (
    <div className={`w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm ${className}`}>
      {name?.charAt(0) || 'U'}
    </div>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
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

  const handleProjectClick = (project) => {
    navigate(`/project/${project._id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'on-hold': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getProjectTeam = (project) => {
    // Mock team data - replace with actual team data from project
    return project.assignedEmployees?.map(emp => ({
      _id: emp._id || emp,
      name: emp.name || emp,
      avatar: emp.avatar
    })) || [];
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

          {/* Page Header */}
          <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Project Management</h1>
          <p className="text-gray-300">Track and manage all your projects</p>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-600/50 p-6">
              <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white text-black rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalProjects}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Total Projects</h3>
            <p className="text-sm text-gray-300">All projects</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-600/50 p-6">
              <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white text-black rounded-xl">
                <Play className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.activeProjects}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Active</h3>
            <p className="text-sm text-gray-300">In progress</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-600/50 p-6">
              <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white text-black rounded-xl">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.completedProjects}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Completed</h3>
            <p className="text-sm text-gray-300">Finished projects</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-600/50 p-6">
              <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white text-black rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.overdueProjects}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Overdue</h3>
            <p className="text-sm text-gray-300">Past deadline</p>
          </div>
        </div>

        {/* Projects Table Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-600/50 mb-6">
          <div className="flex items-center justify-between p-5 border-b border-gray-600/50">
            <h2 className="text-xl font-bold text-white">Projects</h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchProjects}
                disabled={loading}
                className="flex items-center space-x-1 text-white hover:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <span className="text-gray-400">|</span>
              <Link to="/assign-project" className="text-white hover:text-gray-300 font-medium no-underline">
                Create Project
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/assign-project-to-team-leader" className="text-gray-300 hover:text-white font-medium no-underline">
                Assign to Team Leader
              </Link>
            </div>
          </div>
          
          <div className="p-5">
            {/* Table Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Show</span>
                <select className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-300">entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Search:</span>
                  <input
                    type="text"
                    placeholder="Search projects..."
                  className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-4 mb-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
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
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading projects...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No projects found.</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          PROJECT NAME
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          START DATE
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          END DATE
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          STATUS
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          PROGRESS
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          PRIORITY
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          TEAM
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => {
                      // Calculate project progress
                      const totalTasks = project.steps 
                        ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.length : 0), 0) 
                        : 0;
                      const completedTasks = project.steps 
                        ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.filter(t => t.status === 'completed').length : 0), 0) 
                        : 0;
                      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.progress || 0);
                      
                      // Get project team
                      const projectTeam = getProjectTeam(project);
                      
                      return (
                        <tr 
                          key={project._id} 
                          className="bg-gray-800/30 border-b border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => handleProjectClick(project)}
                        >
                          <td className="px-6 py-4">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="text-sm font-medium text-white">{project.title}</div>
                                <div className="text-xs text-gray-400 line-clamp-1">{project.description}</div>
                        </div>
                      </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: '2-digit' 
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: '2-digit' 
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-300">{progressPercentage}%</span>
                    </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center -space-x-2">
                              {projectTeam.slice(0, 3).map((member, index) => (
                                <UserAvatar 
                                  key={member._id} 
                                  name={member.name}
                                  className="w-6 h-6 border-2 border-gray-800"
                                />
                              ))}
                              {projectTeam.length > 3 && (
                                <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                                  <span className="text-xs text-white">+{projectTeam.length - 3}</span>
                </div>
              )}
                              {projectTeam.length === 0 && (
                                <span className="text-xs text-gray-400">No team</span>
                              )}
            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProjectClick(project);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="View Project"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Edit Project"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                  <button
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="More Actions"
                  >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                  </button>
                </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-300">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProjects.length}</span> of <span className="font-medium">{filteredProjects.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm text-gray-300 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded">
                      1
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-300 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Projects; 