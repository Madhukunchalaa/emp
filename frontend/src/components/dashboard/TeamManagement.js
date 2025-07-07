import React, { useEffect, useState } from 'react';
import { Users, Plus, Calendar, Target, Clock, CheckCircle, AlertCircle, X, UserPlus, Send } from 'lucide-react';
import { getAvailableEmployees, assignEmployeeToTeam, getTeamMembers, createTaskForTeamMember } from '../../services/api';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [assignTaskData, setAssignTaskData] = useState({ teamMemberId: '', title: '', description: '', deadline: '' });
  const [addingEmployee, setAddingEmployee] = useState(false);

  // Color palette - Modern Tech theme
  const colors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchAvailableEmployees();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await getTeamMembers();
      setTeamMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to fetch team members');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async () => {
    try {
      const res = await getAvailableEmployees();
      setAvailableEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching available employees:', err);
      setError('Failed to fetch available employees');
      setAvailableEmployees([]);
    }
  };

  const handleAssignTask = async () => {
    setError(''); setSuccess('');
    
    if (!assignTaskData.teamMemberId) {
      setError('Please select a team member');
      return;
    }
    if (!assignTaskData.title || assignTaskData.title.trim() === '') {
      setError('Please enter a task title');
      return;
    }
    if (!assignTaskData.deadline) {
      setError('Please select a deadline');
      return;
    }
    
    try {
      console.log('Sending task data:', assignTaskData);
      await createTaskForTeamMember(assignTaskData);
      setSuccess('Task assigned successfully!');
      setAssignTaskOpen(false);
      setAssignTaskData({ teamMemberId: '', title: '', description: '', deadline: '' });
    } catch (err) {
      console.error('Error assigning task:', err);
      setError(err.response?.data?.error || 'Failed to assign task');
    }
  };

  const handleAddEmployee = async (employeeId) => {
    setAddingEmployee(true);
    setError(''); setSuccess('');
    try {
      await assignEmployeeToTeam(employeeId);
      setSuccess('Employee added to team!');
      setAvailableEmployees(availableEmployees.filter(emp => emp._id !== employeeId));
      fetchTeamMembers();
    } catch (err) {
      setError('Failed to add employee');
    } finally {
      setAddingEmployee(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const Avatar = ({ name }) => (
    <div 
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg"
      style={{ background: colors.gradient }}
    >
      {getInitials(name)}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2"
        style={{ borderColor: colors.primary }}
      ></div>
    </div>
  );

  const TeamMemberCard = ({ member }) => (
    <div 
      className="rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      style={{ backgroundColor: colors.surface }}
    >
      <div className="flex items-center space-x-4">
        <Avatar name={member.name} />
        <div className="flex-1">
          <h3 className="font-semibold text-lg" style={{ color: colors.text }}>
            {member.name}
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {member.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.success }}
          ></div>
          <span className="text-xs font-medium" style={{ color: colors.success }}>
            Active
          </span>
        </div>
      </div>
    </div>
  );

  const EmployeeCard = ({ employee }) => (
    <div 
      className="rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
      style={{ backgroundColor: colors.surface }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar name={employee.name} />
          <div>
            <h3 className="font-semibold" style={{ color: colors.text }}>
              {employee.name}
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {employee.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleAddEmployee(employee._id)}
          disabled={addingEmployee}
          className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          style={{ 
            background: colors.gradient,
            opacity: addingEmployee ? 0.5 : 1
          }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Add to Team</span>
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: `linear-gradient(135deg, ${colors.background} 0%, #e0e7ff 100%)` 
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="p-3 rounded-2xl shadow-lg"
              style={{ background: colors.gradient }}
            >
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: colors.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Team Management
              </h1>
              <p style={{ color: colors.textSecondary }}>
                Manage your team members and assign tasks
              </p>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
              Team Members
            </h2>
            <button
              onClick={() => setAssignTaskOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ background: colors.gradient }}
            >
              <Target className="w-5 h-5" />
              <span>Assign Task</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div 
              className="text-center py-8 px-4 rounded-2xl"
              style={{ 
                backgroundColor: colors.surface,
                color: colors.error 
              }}
            >
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div 
              className="text-center py-12 px-4 rounded-2xl"
              style={{ 
                backgroundColor: colors.surface,
                color: colors.textSecondary 
              }}
            >
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No team members found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <TeamMemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>

        {/* Available Employees Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
            Available Employees
          </h2>
          {availableEmployees.length === 0 ? (
            <div 
              className="text-center py-12 px-4 rounded-2xl"
              style={{ 
                backgroundColor: colors.surface,
                color: colors.textSecondary 
              }}
            >
              <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No available employees</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableEmployees.map(employee => (
                <EmployeeCard key={employee._id} employee={employee} />
              ))}
            </div>
          )}
        </div>

        {/* Task Assignment Modal */}
        {assignTaskOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div 
              className="rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                  Assign New Task
                </h3>
                <button
                  onClick={() => setAssignTaskOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" style={{ color: colors.textSecondary }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Team Member
                  </label>
                  <select
                    value={assignTaskData.teamMemberId}
                    onChange={e => setAssignTaskData({ ...assignTaskData, teamMemberId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all duration-200"
                    style={{ 
                      borderColor: colors.textSecondary + '30',
                      ':focus': { borderColor: colors.primary }
                    }}
                  >
                    <option value="">Select a team member</option>
                    {teamMembers.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={assignTaskData.title}
                    onChange={e => setAssignTaskData({ ...assignTaskData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all duration-200"
                    placeholder="Enter task title"
                    style={{ 
                      borderColor: colors.textSecondary + '30'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Description
                  </label>
                  <textarea
                    value={assignTaskData.description}
                    onChange={e => setAssignTaskData({ ...assignTaskData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all duration-200"
                    placeholder="Enter task description"
                    style={{ 
                      borderColor: colors.textSecondary + '30'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={assignTaskData.deadline}
                    onChange={e => setAssignTaskData({ ...assignTaskData, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 transition-all duration-200"
                    style={{ 
                      borderColor: colors.textSecondary + '30'
                    }}
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setAssignTaskOpen(false)}
                  className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50 transition-all duration-200"
                  style={{ 
                    color: colors.textSecondary,
                    borderColor: colors.textSecondary + '40'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTask}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ background: colors.gradient }}
                >
                  <Send className="w-5 h-5" />
                  <span>Assign Task</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div 
            className="fixed top-4 right-4 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-2 z-50 animate-slide-in"
            style={{ backgroundColor: colors.success }}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div 
            className="fixed top-4 right-4 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-2 z-50 animate-slide-in"
            style={{ backgroundColor: colors.error }}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TeamManagement;