import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { managerService } from '../../../services/api';
import { Plus, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const AssignProject = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // <-- this picks up /projects/edit/:id
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

  // 1. When editing: prefill form with existing project
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await managerService.getProject(id); // you add getProject in api.js
          setFormData(res.data);
        } catch (err) {
          console.error('Error fetching project', err);
        }
      })();
    }
  }, [id]);

  // 2. Handle input change
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // 3. Submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    try {
      if (id) {
        // update
        await managerService.updateProject(id, formData);
        setMessage('Project updated successfully!');
      } else {
        // create
        await managerService.createProject(formData);
        setMessage('Project created successfully!');
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/projects');
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
            {id ? 'Update Project' : 'Create New Project'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Edit and update project details' : 'Set up a new project for your team'}
          </p>
        </div>

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
                  className="w-full p-3 border border-gray-200 rounded-xl"
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
                  className="w-full p-3 border border-gray-200 rounded-xl"
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
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* project link */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Project URL
                </label>
                <input
                  type="text"
                  name="projectLink"
                  value={formData.projectLink}
                  onChange={handleChange}
                  placeholder="e.g. abc.com"
                  className="w-full p-3 border border-gray-200 rounded-xl"
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
                    className="flex-1 p-2 border border-gray-200 rounded"
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
                    className="bg-orange-500 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
                <ul className="list-disc pl-5">
                  {formData.steps?.map((step, idx) => (
                    <li key={idx} className="mb-1 flex items-center">
                      {step.name}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
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

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold"
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
      </div>
    </div>
  );
};

export default AssignProject;
