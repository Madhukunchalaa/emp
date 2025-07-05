import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../../../services/api';
import { 
  Users, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  UserCheck,
  TrendingUp,
  Clock
} from 'lucide-react';

const AssignProjectToTeamLeader = () => {
  const navigate = useNavigate();
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTeamLeader, setSelectedTeamLeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamLeadersRes, projectsRes] = await Promise.all([
        managerService.getTeamLeaders(),
        managerService.getProjects()
      ]);

      // Filter projects that are not yet assigned to team leaders
      const unassignedProjects = projectsRes.data.filter(project => 
        !project.assignedTo || project.status === 'pending'
      );

      setTeamLeaders(teamLeadersRes.data);
      setProjects(unassignedProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProject || !selectedTeamLeader) {
      setError('Please select both a project and a team leader');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await managerService.assignProjectToTeamLeader({
        projectId: selectedProject,
        teamLeaderId: selectedTeamLeader
      });

      setSuccess('Project assigned to team leader successfully!');
      
      // Reset form
      setSelectedProject('');
      setSelectedTeamLeader('');
      
      // Refresh data
      setTimeout(() => {
        fetchData();
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Error assigning project:', error);
      setError(error.response?.data?.message || 'Failed to assign project');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/manager-dashboard')}
              className="p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 hover:shadow-md transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Assign Projects to Team Leaders
              </h1>
              <p className="text-gray-600">Delegate projects to team leaders for better management</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignment Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Assign Project</h2>
                <p className="text-gray-600">Select project and team leader</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Select Project *</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a project...</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.title} - {project.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Select Team Leader *</label>
                <select
                  value={selectedTeamLeader}
                  onChange={(e) => setSelectedTeamLeader(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a team leader...</option>
                  {teamLeaders.map(leader => (
                    <option key={leader._id} value={leader._id}>
                      {leader.name} - {leader.teamMemberCount} members, {leader.activeProjectCount} active projects
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedProject || !selectedTeamLeader}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>Assign Project to Team Leader</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Team Leaders Overview */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Team Leaders</h2>
                <p className="text-gray-600">Available team leaders</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : teamLeaders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No team leaders available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamLeaders.map(leader => (
                  <div key={leader._id} className="bg-white/50 rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{leader.name}</h3>
                      <span className="text-sm text-gray-500">{leader.email}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{leader.teamMemberCount} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{leader.activeProjectCount} active projects</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Projects */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Available Projects</h2>
              <p className="text-gray-600">Projects ready for assignment</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No projects available for assignment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div key={project._id} className="bg-white/50 rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 truncate">{project.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignProjectToTeamLeader; 