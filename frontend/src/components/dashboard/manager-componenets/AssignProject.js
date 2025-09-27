import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { managerService } from '../../../services/api';
import { Plus, Calendar, FileText, AlertCircle, CheckCircle, Eye, Edit, Search, RefreshCw } from 'lucide-react';

const AssignProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    category: '',
    estimatedHours: '',
    steps: [],
    projectLink: ''
  });
  const [newStep, setNewStep] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProjectList, setShowProjectList] = useState(!id);

  // When editing: prefill form with existing project
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await managerService.getProject(id);
          setFormData(res.data);
          setShowProjectList(false);
        } catch (err) {
          console.error('Error fetching project', err);
        }
      })();
    }
  }, [id]);

  // Fetch all projects for the project list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await managerService.getProjects();
        const projectData = Array.isArray(res.data) ? res.data : 
                           Array.isArray(res.data?.data) ? res.data.data :
                           Array.isArray(res) ? res : [];
        setProjects(projectData);
      } catch (err) {
        console.error('Error fetching projects', err);
      }
    };
    fetchProjects();
  }, []);

  // Refresh projects list
  const refreshProjects = async () => {
    try {
      const res = await managerService.getProjects();
      const projectData = Array.isArray(res.data) ? res.data : 
                         Array.isArray(res.data?.data) ? res.data.data :
                         Array.isArray(res) ? res : [];
      setProjects(projectData);
    } catch (err) {
      console.error('Error refreshing projects', err);
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status color for project status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    try {
      if (id) {
        await managerService.updateProject(id, formData);
        setMessage('Project updated successfully!');
      } else {
        await managerService.createProject(formData);
        setMessage('Project created successfully!');
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (id) {
          setShowProjectList(true);
        } else {
          setShowProjectList(true);
          refreshProjects();
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage('Error saving project');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {id ? 'Update Project' : showProjectList ? 'Project Management' : 'Create New Project'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Edit and update project details' : 
             showProjectList ? 'Manage your projects and create new ones' : 
             'Set up a new project for your team'}
          </p>
        </div>

        {/* Toggle buttons */}
        {!id && (
          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => setShowProjectList(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showProjectList
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              View Projects
            </button>
            <button
              onClick={() => setShowProjectList(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showProjectList
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Create New Project
            </button>
          </div>
        )}

        {/* Project List Section */}
        {showProjectList && !id && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">All Projects</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={refreshProjects}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Refresh Projects"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowProjectList(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>
            </div>
            
            <div className="p-5">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No projects found matching your search.' : 'No projects found. Create your first project!'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowProjectList(false)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                      <tr>
                        <th className="px-6 py-3">Project Name</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3">Deadline</th>
                        <th className="px-6 py-3">Steps</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr key={project._id} className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-800">{project.title}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {project.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                              {project.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {project.deadline 
                              ? new Date(project.deadline).toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: '2-digit' 
                                })
                              : 'No deadline'
                            }
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {project.steps?.length || 0} steps
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/project/${project._id}`}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Project"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/assign-project/${project._id}`}
                                className="text-gray-400 hover:text-orange-600 transition-colors"
                                title="Edit Project"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Form Section */}
        {(!showProjectList || id) && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {message && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                    isSuccess
                      ? 'bg-green-100 border border-green-300 text-green-700'
                      : 'bg-red-100 border border-red-300 text-red-700'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* title */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* description */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>

                {/* deadline */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline?.substring(0,10) || ''}
                      onChange={handleChange}
                      required
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* priority */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* category */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Web Development, Mobile App, etc."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* estimated hours */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    placeholder="e.g. 40"
                    min="1"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* project link */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Project URL
                  </label>
                  <input
                    type="url"
                    name="projectLink"
                    value={formData.projectLink}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* steps */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Project Steps/Phases *
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newStep}
                      onChange={(e) => setNewStep(e.target.value)}
                      placeholder="Enter step/phase name"
                      className="flex-1 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newStep.trim()) {
                            setFormData((prev) => ({
                              ...prev,
                              steps: [...prev.steps, { name: newStep.trim(), tasks: [] }]
                            }));
                            setNewStep('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newStep.trim()) {
                          setFormData((prev) => ({
                            ...prev,
                            steps: [...prev.steps, { name: newStep.trim(), tasks: [] }]
                          }));
                          setNewStep('');
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {formData.steps?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Project Steps:</h4>
                      <ul className="space-y-2">
                        {formData.steps.map((step, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="text-sm text-gray-700">{step.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  steps: prev.steps.filter((_, i) => i !== idx)
                                }))
                              }
                              className="text-red-500 hover:text-red-700 font-bold text-lg"
                              title="Remove step"
                            >
                              &times;
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(!formData.steps || formData.steps.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No steps added yet. Add at least one step to proceed.</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (id) {
                        navigate('/projects');
                      } else {
                        setShowProjectList(true);
                      }
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors duration-200"
                  >
                    {id ? 'Back to Projects' : 'View Projects'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.title || !formData.description || !formData.deadline || !formData.steps?.length}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading
                      ? id
                        ? 'Updating...'
                        : 'Creating...'
                      : id
                      ? 'Update Project'
                      : 'Create Project'}
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

export default AssignProject;