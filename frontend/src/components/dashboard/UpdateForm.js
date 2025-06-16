import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { employeeService } from '../../services/api';

const UpdateForm = () => {
  const [formData, setFormData] = useState({
    project_title: '',
    status: '',
    update: '',
    finishBy: ''
  });
  const [projects, setProjects] = useState([]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  // ✅ Only one useEffect to fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await employeeService.getProjects();
        setProjects(res.data);
        console.log(res.data)
        
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('project_title', formData.project_title);
    data.append('status', formData.status);
    data.append('update', formData.update);
    data.append('finishBy', formData.finishBy);
    if (image) data.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/employee/updates', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(res.data.msg || 'Update submitted successfully!');
      setFormData({
        project_title: '',
        status: '',
        update: '',
        finishBy: ''
      });
      setImage(null);
    } catch (error) {
      console.error('Form error:', error.response?.data || error.message);
      setMessage('❌ Failed to submit update');
    }
  };

  return (
      <div className="min-vh-100 py-5" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <div className="card border-0 shadow-lg" style={{
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Header */}
              <div className="card-header text-white text-center py-4 border-0" style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                borderRadius: '20px 20px 0 0'
              }}>
                <div className="h1 mb-3">📋</div>
                <h3 className="mb-0 fw-bold">Submit Daily Update</h3>
                <p className="mb-0 opacity-75">Track your project progress</p>
              </div>

              {/* Body */}
              <div className="card-body p-4">
                {message && (
                  <div className={`alert ${message.startsWith('❌') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} role="alert">
                    <span className="me-2">{message.startsWith('❌') ? '⚠️' : '✅'}</span>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}

                <div onSubmit={handleSubmit}>
                  {/* Project Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark d-flex align-items-center">
                      <span className="me-2">🎯</span>
                      Project
                    </label>
                    <select
                      className="form-select form-select-lg"
                      name="project_title"
                      value={formData.project_title}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">-- Select Project --</option>
                      {Array.isArray(projects) &&
                        projects.map((p) => (
                          <option key={p._id} value={p.title}>
                            {p.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Status Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark d-flex align-items-center">
                      <span className="me-2">📊</span>
                      Status
                    </label>
                    <select
                      className="form-select form-select-lg"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Not Started">🔴 Not Started</option>
                      <option value="In Progress">🟡 In Progress</option>
                      <option value="Completed">🟢 Completed</option>
                    </select>
                  </div>

                  {/* Update Description */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark d-flex align-items-center">
                      <span className="me-2">✍️</span>
                      Update Description
                    </label>
                    <textarea
                      className="form-control"
                      name="update"
                      value={formData.update}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="Describe your progress, challenges, and achievements..."
                      style={{ 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        resize: 'vertical',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* Finish By */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark d-flex align-items-center">
                      <span className="me-2">📅</span>
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      name="finishBy"
                      value={formData.finishBy}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark d-flex align-items-center">
                      <span className="me-2">📸</span>
                      Upload Screenshot (Optional)
                    </label>
                    <div className="position-relative">
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ 
                          borderRadius: '12px', 
                          border: '2px solid #e5e7eb',
                          transition: 'all 0.3s ease',
                          paddingRight: '50px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                      <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                        📤
                      </span>
                    </div>
                    <div className="form-text mt-2">
                      <span className="me-1">💡</span>
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="btn btn-lg fw-semibold py-3 position-relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span className="me-2">🚀</span>
                      Submit Daily Update
                    </button>
                  </div>
                </div>

                {/* Additional Info Card */}
                <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2">💡</span>
                    <h6 className="mb-0 fw-semibold text-dark">Quick Tips</h6>
                  </div>
                  <small className="text-muted">
                    • Be specific about your progress and challenges<br/>
                    • Include any blockers or dependencies<br/>
                    • Screenshots help provide visual context
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateForm;
