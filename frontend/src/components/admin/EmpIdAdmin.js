import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const roles = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'developer', label: 'Developer' },
  { value: 'team-leader', label: 'Team Leader' },
  { value: 'Business', label: 'Business' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
];

const EmpIdAdmin = () => {
  const [form, setForm] = useState({
    empid: '',
    role: 'employee',
  });
  const [batchForm, setBatchForm] = useState({
    count: 1,
    role: 'employee',
    prefix: 'EMP',
    random: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [empIds, setEmpIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchEmpIds();
    fetchUsers();
    fetchProjects();
    fetchReports();
  }, []);

  const fetchEmpIds = async () => {
    try {
      const res = await adminService.getEmpIds();
      setEmpIds(res.data);
    } catch (err) {}
  };
  const fetchUsers = async () => {
    try {
      const res = await adminService.getAdminUsers();
      setUsers(res.data);
    } catch (err) {}
  };
  const fetchProjects = async () => {
    try {
      const res = await adminService.getAdminProjects();
      setProjects(res.data);
    } catch (err) {}
  };
  const fetchReports = async () => {
    try {
      const res = await adminService.getAdminReports();
      setReports(res.data);
    } catch (err) {}
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleBatchChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBatchForm({ ...batchForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await adminService.createEmpId({ employeeId: form.empid, role: form.role });
      setSuccess(res.data.message || 'Employee ID and role added successfully.');
      setForm({ empid: '', role: 'employee' });
      fetchEmpIds();
    } catch (err) {
      setError(
        err.message || 'Failed to add Employee ID. Please check the details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await adminService.createBatchEmpIds(batchForm);
      setSuccess(res.data.msg || 'Batch EmpIDs created.');
      fetchEmpIds();
    } catch (err) {
      setError(err.message || 'Failed to create batch EmpIDs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Emp ID Admin Panel</h2>
      <p>Add a new Employee ID and assign a role, or create a batch of EmpIDs.</p>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Employee ID</label>
            <input
              type="text"
              name="empid"
              value={form.empid}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ height: 40, alignSelf: 'end', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '0 16px' }}>
            {loading ? 'Adding...' : 'Add EmpID'}
          </button>
        </div>
      </form>
      <form onSubmit={handleBatchSubmit} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Count</label>
            <input type="number" name="count" min={1} max={100} value={batchForm.count} onChange={handleBatchChange} style={{ width: '100%', padding: 8, marginTop: 4 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Role</label>
            <select name="role" value={batchForm.role} onChange={handleBatchChange} style={{ width: '100%', padding: 8, marginTop: 4 }}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Prefix</label>
            <input type="text" name="prefix" value={batchForm.prefix} onChange={handleBatchChange} style={{ width: '100%', padding: 8, marginTop: 4 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>Random</label>
            <input type="checkbox" name="random" checked={batchForm.random} onChange={handleBatchChange} />
          </div>
          <button type="submit" disabled={loading} style={{ height: 40, alignSelf: 'end', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '0 16px' }}>
            {loading ? 'Creating...' : 'Batch Create'}
          </button>
        </div>
      </form>
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {/* EmpID Table */}
      <h3>All EmpIDs</h3>
      <table style={{ width: '100%', marginBottom: 24, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>EmpID</th>
            <th>Role</th>
            <th>Status</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {empIds.map((id) => (
            <tr key={id._id}>
              <td>{id.employeeId}</td>
              <td>{id.role}</td>
              <td>{id.isUsed ? 'Used' : 'Unused'}</td>
              <td>{id.assignedTo ? id.assignedTo : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Users Table */}
      <h3>All Users</h3>
      <table style={{ width: '100%', marginBottom: 24, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>Name</th>
            <th>Email</th>
            <th>EmpID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.empid || '-'}</td>
              <td>{u.role}</td>
              <td>
                {u.role !== 'admin' && (
                  <button
                    style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
                    onClick={async () => {
                      try {
                        await adminService.promoteUser(u._id);
                        fetchUsers();
                      } catch (err) {
                        console.error('Failed to promote user:', err);
                      }
                    }}
                  >
                    Promote to Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Projects Table */}
      <h3>All Projects</h3>
      <table style={{ width: '100%', marginBottom: 24, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>Name</th>
            <th>Description</th>
            <th>Assigned To</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p._id}>
              <td>{p.name || p.title}</td>
              <td>{p.description}</td>
              <td>{p.assignedTo ? p.assignedTo : '-'}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Reports Table */}
      <h3>All Reports</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>Project</th>
            <th>Team Leader</th>
            <th>Summary</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r._id}>
              <td>{r.projectId || '-'}</td>
              <td>{r.TL || '-'}</td>
              <td>{r.summary}</td>
              <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpIdAdmin; 