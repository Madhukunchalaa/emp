import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../../../services/api';
import Navbar from '../../common/Navbar';
import { 
  Clock, 
  Users, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  CalendarDays,
  Zap
} from 'lucide-react';

const AssignTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'medium',
    estimatedHours: '',
    assignmentType: 'now', // 'now' or 'schedule'
    scheduledDate: '',
    scheduledTime: ''
  });
  
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesRes, projectsRes] = await Promise.all([
          managerService.getEmployees(),
          managerService.getProjects()
        ]);
        
        const employees = Array.isArray(employeesRes.data) ? employeesRes.data : [];
        const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
        
        setEmployees(employees);
        setProjects(projects.filter(project => project.status !== 'completed'));
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setMessage('Failed to load employees and projects.');
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    console.log('Form data:', formData); // Debug log

    // Validation
    if (formData.assignmentType === 'schedule') {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      const now = new Date();
      
      if (scheduledDateTime <= now) {
        setMessage('Scheduled date and time must be in the future');
        setIsSuccess(false);
        setLoading(false);
        return;
      }
    }

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours,
        assignmentType: formData.assignmentType,
        status: formData.assignmentType === 'now' ? 'assigned' : 'scheduled',
        ...(formData.assignmentType === 'schedule' && {
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime
        })
      };

      console.log('Task data being sent:', taskData); // Debug log

      const res = await managerService.assignTask(taskData);
      console.log('Task assignment response:', res); // Debug log
      
      setMessage(res.data.message || 'Task assigned successfully!');
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        projectId: '',
        assignedTo: '',
        priority: 'medium',
        estimatedHours: '',
        assignmentType: 'now',
        scheduledDate: '',
        scheduledTime: ''
      });

      // Auto-clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Task assignment error:', err);
      console.error('Error response:', err.response?.data); // Debug log
      setMessage(err.response?.data?.message || 'Failed to assign task');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <Navbar userRole="manager" />

      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Assign Task
          </h1>
          <p className="text-gray-600">Assign tasks to team members with scheduling options</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Assign Task</h2>
                <p className="text-gray-600">Assign tasks to employees with scheduling options</p>
              </div>
            </div>

            {/* Test Backend Connectivity */}
            <div className="mb-6">
              <button
                onClick={async () => {
                  try {
                    const res = await managerService.testAssign({ test: true });
                    console.log('Backend test response:', res.data);
                    setMessage('Backend is working! ' + res.data.message);
                    setIsSuccess(true);
                  } catch (err) {
                    console.error('Backend test failed:', err);
                    setMessage('Backend test failed: ' + (err.response?.data?.message || err.message));
                    setIsSuccess(false);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Test Backend Connection
              </button>
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
              {/* Assignment Type Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Assignment Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.assignmentType === 'now' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="assignmentType"
                      value="now"
                      checked={formData.assignmentType === 'now'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        formData.assignmentType === 'now' ? 'bg-orange-500' : 'bg-gray-200'
                      }`}>
                        <Zap className={`w-5 h-5 ${
                          formData.assignmentType === 'now' ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Assign Now</h4>
                        <p className="text-sm text-gray-600">Task will be assigned immediately</p>
                      </div>
                    </div>
                  </label>

                  <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.assignmentType === 'schedule' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="assignmentType"
                      value="schedule"
                      checked={formData.assignmentType === 'schedule'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        formData.assignmentType === 'schedule' ? 'bg-orange-500' : 'bg-gray-200'
                      }`}>
                        <CalendarDays className={`w-5 h-5 ${
                          formData.assignmentType === 'schedule' ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Schedule Later</h4>
                        <p className="text-sm text-gray-600">Task will be assigned at a specific time</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Task Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Task Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter task title"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
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
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Task Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the task details, requirements, and expected outcomes..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                ></textarea>
              </div>

              {/* Project and Employee Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Select Project *</label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title} ({project.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Assign To Employee *</label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    placeholder="e.g., 8"
                    min="0.5"
                    step="0.5"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {formData.assignmentType === 'schedule' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Scheduled Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        required={formData.assignmentType === 'schedule'}
                        className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {formData.assignmentType === 'schedule' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Scheduled Time *</label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    required={formData.assignmentType === 'schedule'}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Assigning Task...' : `Assign Task ${formData.assignmentType === 'schedule' ? 'Later' : 'Now'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTask;
