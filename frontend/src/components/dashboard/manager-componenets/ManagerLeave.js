import React, { useEffect, useState } from 'react';
import { getAllLeaveRequests, reviewLeaveRequest } from '../../../services/api';

const ManagerLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await getAllLeaveRequests();
      setLeaves(data);
    } catch (err) {
      setError('Failed to fetch leave requests');
    }
    setLoading(false);
  };

  const handleReview = async (leaveId, status) => {
    setActionLoading(leaveId + status);
    setError('');
    setSuccess('');
    try {
      await reviewLeaveRequest(leaveId, status);
      setSuccess(`Leave ${status}`);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
    setActionLoading(null);
  };

  const filteredLeaves = statusFilter === 'All' ? leaves : leaves.filter(l => l.status === statusFilter.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>
      <div className="mb-4 flex items-center gap-4">
        <label className="font-medium">Filter by status:</label>
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : filteredLeaves.length === 0 ? (
        <div>No leave requests found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted On</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td className="px-4 py-2 whitespace-nowrap">{leave.employee?.name} <br /><span className="text-xs text-gray-400">{leave.employee?.email}</span></td>
                  <td className="px-4 py-2 whitespace-nowrap">{leave.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{leave.toDate ? new Date(leave.toDate).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{leave.reason}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${leave.status === 'approved' ? 'bg-green-100 text-green-700' : leave.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{leave.status}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {leave.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold disabled:opacity-50"
                          disabled={actionLoading === leave._id + 'approved'}
                          onClick={() => handleReview(leave._id, 'approved')}
                        >
                          {actionLoading === leave._id + 'approved' ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold disabled:opacity-50"
                          disabled={actionLoading === leave._id + 'rejected'}
                          onClick={() => handleReview(leave._id, 'rejected')}
                        >
                          {actionLoading === leave._id + 'rejected' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerLeave; 