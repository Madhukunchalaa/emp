import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../../../services/api';
import { Plus, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const AssignProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    category: '',
    estimatedHours: '',
    steps: [],
    projectLink:''
  });
  const [newStep, setNewStep] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.deadline) {
      setMessage('Please fill in all required fields');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    // Validate steps
    if (formData.steps.length === 0) {
      setMessage('Please add at least one project step/phase');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const selectedDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setMessage('Deadline must be a future date');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    try {
      const projectData = {
        ...formData,
        status: 'pending',
        assignedTo: null,
        steps: formData.steps,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined
      };

      console.log('Sending project data:', projectData);
      const res = await managerService.createProject(projectData);
      console.log('Project creation response:', res);
      
      setMessage('Project created successfully! Redirecting to projects...');
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        category: '',
        estimatedHours: '',
        steps: [],
        projectLink:''
      });

      // Redirect to projects list after 2 seconds
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (err) {
      console.error('Project creation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create project';
      setMessage(errorMessage);
      setIsSuccess(false);
      
      // Log detailed error information for debugging
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
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
            Create New Project
          </h1>
          <p className="text-gray-600">Set up a new project for your team</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
                <p className="text-gray-600">Add a new project to the system</p>
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                isSuccess 
                  ? 'bg-green-100 border border-green-300 text-green-700' 
                  : 'bg-red-100 border border-red-300 text-red-700'
              }`}>
                {isSuccess ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Project Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter project title"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="research">Research</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the project details, objectives, and requirements..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Deadline *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Project URL</label>
                  <input
                    type="string"
                    name="estimatedHours"
                    value={formData.projectLink}
                    onChange={handleChange}
                    placeholder="e.g. abc.com"
                    min="1"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Project Steps/Phases *</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newStep}
                    onChange={e => setNewStep(e.target.value)}
                    placeholder="Enter step/phase name"
                    className="flex-1 p-2 border border-gray-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newStep.trim() && !formData.steps.some(s => s.name === newStep.trim())) {
                        setFormData(prev => ({
                          ...prev,
                          steps: [...prev.steps, { name: newStep.trim(), tasks: [] }]
                        }));
                        setNewStep('');
                      }
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
                <ul className="list-disc pl-5">
                  {formData.steps.map((step, idx) => (
                    <li key={idx} className="mb-1 flex items-center">
                      {step.name}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            steps: prev.steps.filter((_, i) => i !== idx)
                          }))
                        }
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Project Status</h4>
                    <p className="text-sm text-blue-600">
                      This project will be created with "Pending" status. You can assign tasks to employees later using the "Assign Task" feature.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignProject; 