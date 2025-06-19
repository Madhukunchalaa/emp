import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { employeeService } from '../../services/api';

const UpdateForm = ({ onUpdateSubmitted }) => {
  const [formData, setFormData] = useState({
    project_title: '',
    status: '',
    update: '',
    finishBy: ''
  });
  const [projects, setProjects] = useState([]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await employeeService.getProjects();
        setProjects(res.data);
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
    
    // Find the selected project to get its ID
    const selectedProject = projects.find(p => p.title === formData.project_title);
    
    const data = new FormData();
    data.append('project', selectedProject?._id || ''); // Add project ID
    data.append('project_title', formData.project_title);
    data.append('status', formData.status);
    data.append('update', formData.update);
    data.append('finishBy', formData.finishBy);
    if (image) data.append('image', image);

    try {
      // Use the employeeService method which handles the headers correctly
      const res = await employeeService.addDailyUpdate(data);
      setMessage('✅ Update submitted successfully!');
      setFormData({ project_title: '', status: '', update: '', finishBy: '' });
      setImage(null);
      
      // Call the callback to refresh the updates list
      if (onUpdateSubmitted) {
        onUpdateSubmitted();
      }
    } catch (error) {
      console.error('Form error:', error.response?.data || error.message);
      setMessage('❌ Failed to submit update: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', minHeight: '100vh', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}> Daily Update</h2>

      {message && (
        <div style={{
          padding: '1rem',
          backgroundColor: message.startsWith('❌') ? '#fee2e2' : '#dcfce7',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          color: '#1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '800px',
          marginInline: 'auto'
        }}>
          <span>{message}</span>
          <button onClick={() => setMessage('')} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <label style={{ fontWeight: 'bold', marginTop: '1rem', display: 'block' }}> Project</label>
        <select
          name="project_title"
          value={formData.project_title}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '1rem'
          }}
        >
          <option value="">Select a project</option>
          {projects.map(p => (
            <option key={p._id} value={p.title}>{p.title}</option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}> Status</label>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {['Not Started', 'In Progress', 'Completed'].map(status => (
            <label key={status} style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: formData.status === status ? '#3b82f6' : '#f3f4f6',
              color: formData.status === status ? '#fff' : '#1f2937',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="status"
                value={status}
                checked={formData.status === status}
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              {status}
            </label>
          ))}
        </div>

        <label style={{ fontWeight: 'bold', display: 'block' }}>Update</label>
        <textarea
          name="update"
          value={formData.update}
          onChange={handleChange}
          rows="4"
          required
          placeholder="Describe your progress..."
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            resize: 'vertical',
            marginBottom: '1rem'
          }}
        />

        <label style={{ fontWeight: 'bold', display: 'block' }}>Finish By</label>
        <input
          type="date"
          name="finishBy"
          value={formData.finishBy}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '1rem'
          }}
        />

        <label style={{ fontWeight: 'bold', display: 'block' }}>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px dashed #ccc',
            marginBottom: '1.5rem'
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '1rem',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
           Submit Update
        </button>
      </form>
    </div>
  );
};

export default UpdateForm;
