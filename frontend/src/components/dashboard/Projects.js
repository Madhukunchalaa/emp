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
          

          {/* Project Stats */}
        

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
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
            <tr>
              <th scope="col" className="w-1/4 px-4 py-3 text-left">
                <div className="flex items-center">
                  PROJECT NAME
                </div>
              </th>
              <th scope="col" className="w-20 px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  START DATE
                </div>
              </th>
              <th scope="col" className="w-20 px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  DEAD LINE
                </div>
              </th>
              <th scope="col" className="w-20 px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  STATUS
                </div>
              </th>
              <th scope="col" className="w-24 px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  PROGRESS
                </div>
              </th>
              <th scope="col" className="w-20 px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  PRIORITY
                </div>
              </th>
              <th scope="col" className="w-20 px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  CLIENT
                </div>
              </th>
              <th scope="col" className="w-32 px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  LINK
                </div>
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
                  <td className="px-4 py-4 text-left">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-white truncate">{project.title}</div>
                      <div className="text-xs text-gray-400 truncate mt-1">{project.description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-300 text-xs">
                    {project.startDate ? new Date(project.createdAt).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: '2-digit' 
                    }) : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-300 text-xs">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: '2-digit' 
                    }) : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-12 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-300 min-w-max">{progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority || 'Medium'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-xs text-gray-300 truncate block">{project.client}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {project.project_link ? (
                      <a
                        href={project.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-400 hover:underline truncate block max-w-full"
                        title={project.projectLink}
                      >
                        View Link
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">No Link</span>
                    )}
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