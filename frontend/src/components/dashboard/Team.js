import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { managerService } from '../../services/api';
import UserAvatar from '../common/userAvathar';
import Navbar from '../common/Navbar';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare, 
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';

const Team = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    designers: 0,
    developers: 0,
    managers: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await managerService.getEmployees();
      const employeesData = Array.isArray(res.data) ? res.data : [];
      setEmployees(employeesData);
      
      // Calculate stats
      setStats({
        totalEmployees: employeesData.length,
        activeEmployees: employeesData.filter(emp => emp.status === 'active').length,
        designers: employeesData.filter(emp => emp.role === 'designer').length,
        developers: employeesData.filter(emp => emp.role === 'developer').length,
        managers: employeesData.filter(emp => emp.role === 'manager').length
      });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'designer': return 'bg-pink-100 text-pink-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || employee.role === filterRole;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <Navbar userRole="manager" />

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
            Team Management
          </h1>
          <p className="text-gray-600">Manage your team members and their details</p>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Total Team</h3>
            <p className="text-sm text-gray-500">All members</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.activeEmployees}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Active</h3>
            <p className="text-sm text-gray-500">Currently working</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.managers}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Managers</h3>
            <p className="text-sm text-gray-500">Team leaders</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.developers}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Developers</h3>
            <p className="text-sm text-gray-500">Tech team</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.designers}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Designers</h3>
            <p className="text-sm text-gray-500">Creative team</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="manager">Managers</option>
                <option value="developer">Developers</option>
                <option value="designer">Designers</option>
                <option value="employee">Employees</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center justify-between p-5 border-b border-white/20">
            <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
            <div className="flex space-x-2">
              <span className="text-sm text-gray-500">
                Showing {filteredEmployees.length} of {employees.length} members
              </span>
            </div>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading team members...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No team members found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees.map((employee) => (
                  <div key={employee._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30 group">
                    <div className="relative mb-3">
                      <UserAvatar
                        avatar={employee.avatar}
                        name={employee.name}
                        className="mx-auto"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                        employee.status === 'active' ? 'bg-green-400' : 
                        employee.status === 'inactive' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}></div>
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray-800 mb-1">{employee.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{employee.position || employee.role}</p>
                    <p className="text-xs text-gray-500 mb-3 truncate">{employee.email}</p>
                    
                    <div className="mb-3 space-y-2">
                      <div className={`flex items-center justify-center space-x-1 text-sm rounded-lg px-2 py-1 ${getRoleColor(employee.role)}`}>
                        <Briefcase className="w-3 h-3" />
                        <span className="capitalize">{employee.role}</span>
                      </div>
                      <div className={`flex items-center justify-center space-x-1 text-sm rounded-lg px-2 py-1 ${getStatusColor(employee.status)}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span className="capitalize">{employee.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleViewEmployee(employee)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center space-x-1 bg-gray-200/70 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300/70 transition-all duration-200">
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Employee Details</h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center mb-4">
              <UserAvatar
                avatar={selectedEmployee.avatar}
                name={selectedEmployee.name}
                className="mx-auto mb-3"
              />
              <h4 className="font-semibold text-gray-800">{selectedEmployee.name}</h4>
              <p className="text-sm text-gray-600">{selectedEmployee.position || selectedEmployee.role}</p>
              <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{selectedEmployee.email}</span>
              </div>
              {selectedEmployee.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{selectedEmployee.phone}</span>
                </div>
              )}
              {selectedEmployee.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{selectedEmployee.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 capitalize">{selectedEmployee.role}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Joined: {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl hover:shadow-md transition-all duration-200">
                View Profile
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200">
                Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team; 