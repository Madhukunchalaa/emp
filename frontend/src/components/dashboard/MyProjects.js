import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployeeProjects } from '../../store/slices/employeeSlice';
import { 
  Clock, 
  Briefcase, 
  CheckSquare, 
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Target,
  Users
} from 'lucide-react';

const MyProjects = () => {
  const dispatch = useDispatch();
  const { projects = [], loading = false, error = null } = useSelector((state) => state.employee || {});

  useEffect(() => {
    dispatch(fetchEmployeeProjects());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group tasks by project
  const projectsWithTasks = projects.reduce((acc, task) => {
    if (task.projectId) {
      const projectId = task.projectId._id || task.projectId;
      if (!acc[projectId]) {
        acc[projectId] = {
          _id: projectId,
          title: task.projectId?.title || 'Unknown Project',
          description: task.projectId?.description || '',
          deadline: task.projectId?.deadline || task.deadline,
          status: task.projectId?.status || 'active',
          priority: task.projectId?.priority || 'medium',
          tasks: []
        };
      }
      acc[projectId].tasks.push(task);
    }
    return acc;
  }, {});

  const projectList = Object.values(projectsWithTasks);

  const stats = {
    total: projectList.length,
    active: projectList.filter(project => project.status === 'active').length,
    completed: projectList.filter(project => project.status === 'completed').length,
    pending: projectList.filter(project => project.status === 'pending' || project.status === 'assigned').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            My Projects
          </h1>
          <p className="text-gray-600">View projects you're working on</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Total Projects</h3>
            <p className="text-sm text-gray-500">You're involved in</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.active}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Active</h3>
            <p className="text-sm text-gray-500">Currently working</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.completed}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
            <p className="text-sm text-gray-500">Projects finished</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Pending</h3>
            <p className="text-sm text-gray-500">Awaiting start</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Project List</h2>
                <p className="text-sm text-gray-600">Projects you're working on</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {projectList.length} project{projectList.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading your projects...</p>
              </div>
            ) : projectList.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No projects assigned yet.</p>
                <p className="text-sm text-gray-400 mt-2">Your manager will assign you to projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectList.map((project) => (
                  <div 
                    key={project._id} 
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 line-clamp-2">{project.title}</h4>
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
                    
                    <div className="space-y-2 text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3" />
                        <span>{project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects; 