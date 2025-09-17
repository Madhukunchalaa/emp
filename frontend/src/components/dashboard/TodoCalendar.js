import React, { useState, useEffect } from 'react';
import { managerService } from '../../services/api';
import { 
  Calendar as CalendarIcon,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Target,
  FileText,
  Users,
  Settings,
  Bell,
  Archive,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp
} from 'lucide-react';

// Status Badge Component
const StatusBadge = ({ status, size = "sm" }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { 
          color: 'bg-green-500 text-white', 
          icon: CheckCircle2,
          text: 'Completed'
        };
      case 'in progress':
        return { 
          color: 'bg-blue-500 text-white', 
          icon: Play,
          text: 'In Progress'
        };
      case 'not started':
        return { 
          color: 'bg-gray-500 text-white', 
          icon: Pause,
          text: 'Not Started'
        };
      default: 
        return { 
          color: 'bg-gray-500 text-white', 
          icon: Info,
          text: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority, size = "sm" }) => {
  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return { 
          color: 'bg-red-500 text-white', 
          icon: AlertTriangle,
          text: 'Urgent'
        };
      case 'high':
        return { 
          color: 'bg-orange-500 text-white', 
          icon: TrendingUp,
          text: 'High'
        };
      case 'medium':
        return { 
          color: 'bg-yellow-500 text-white', 
          icon: Clock,
          text: 'Medium'
        };
      case 'low':
        return { 
          color: 'bg-green-500 text-white', 
          icon: CheckCircle,
          text: 'Low'
        };
      default: 
        return { 
          color: 'bg-gray-500 text-white', 
          icon: Info,
          text: priority || 'Medium'
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

// Todo Item Component
const TodoItem = ({ todo, onUpdate, onDelete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleStatusChange = (newStatus) => {
    onUpdate(todo._id, { status: newStatus });
  };

  return (
    <div 
      className={`group bg-gradient-to-r from-gray-800/90 to-gray-700/80 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/70 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
        todo.status === 'Completed' ? 'opacity-75' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className={`text-sm font-medium text-white mb-1 ${
            todo.status === 'Completed' ? 'line-through text-gray-400' : ''
          }`}>
            {todo.title.length > 25 ? todo.title.substring(0, 25) + '...' : todo.title}
          </h4>
          {todo.description && (
            <p className="text-xs text-gray-400 mb-2">{todo.description.length > 40 ? todo.description.substring(0, 40) + '...' : todo.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <StatusBadge status={todo.status} size="sm" />
          <PriorityBadge priority={todo.priority} size="sm" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {todo.dueTime && (
            <span className="text-xs text-gray-400">{todo.dueTime}</span>
          )}
          {todo.category && (
            <span className="text-xs text-blue-400 bg-blue-900/30 px-1 py-0.5 rounded">
              {todo.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {isHovered && (
            <>
              <button
                onClick={() => onEdit(todo)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDelete(todo._id)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Change Buttons */}
      <div className="mt-3 flex space-x-2">
        {todo.status !== 'Not Started' && (
          <button
            onClick={() => handleStatusChange('Not Started')}
            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all duration-200 transform hover:scale-105"
          >
            Not Started
          </button>
        )}
        {todo.status !== 'In Progress' && (
          <button
            onClick={() => handleStatusChange('In Progress')}
            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 hover:shadow-md hover:shadow-blue-500/25"
          >
            In Progress
          </button>
        )}
        {todo.status !== 'Completed' && (
          <button
            onClick={() => handleStatusChange('Completed')}
            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 hover:shadow-md hover:shadow-green-500/25"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

// Add/Edit Todo Modal
const TodoModal = ({ isOpen, onClose, onSave, todo = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    category: 'Work',
    dueTime: '',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        date: todo.date ? new Date(todo.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        priority: todo.priority || 'Medium',
        category: todo.category || 'Work',
        dueTime: todo.dueTime || '',
        tags: todo.tags ? todo.tags.join(', ') : '',
        notes: todo.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        category: 'Work',
        dueTime: '',
        tags: '',
        notes: ''
      });
    }
  }, [todo, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    const todoData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    console.log('Processed todo data:', todoData);
    onSave(todoData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-y-auto p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 rounded-3xl p-8 max-w-lg w-full mx-4 my-8 border border-gray-700/50 relative max-h-[90vh] overflow-y-auto backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {todo ? 'Edit Todo' : 'Add New Todo'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200 transform hover:scale-110"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-blue-300 transition-colors duration-200">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500/70"
              placeholder="Enter todo title"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-purple-300 transition-colors duration-200">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-500/70"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-emerald-300 transition-colors duration-200">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-gray-500/70"
                required
              />
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-cyan-300 transition-colors duration-200">Time</label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 hover:border-gray-500/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-orange-300 transition-colors duration-200">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-500/70"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-pink-300 transition-colors duration-200">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 hover:border-gray-500/70"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Meeting">Meeting</option>
                <option value="Project">Project</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-yellow-300 transition-colors duration-200">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 hover:border-gray-500/70"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-200 mb-3 group-hover:text-indigo-300 transition-colors duration-200">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-500/70"
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="flex space-x-4 pt-6 border-t border-gray-600/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-400 transition-all duration-300 font-medium transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              {todo ? 'Update' : 'Create'} Todo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TodoCalendar = ({ isCompact = false }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      const dayTodos = todos.filter(todo => {
        const todoDate = new Date(todo.date);
        return todoDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        todos: dayTodos
      });
    }
    
    return days;
  };

  // Fetch todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await managerService.getTodos({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined
      });
      
      setTodos(response.data || []);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  // Create/Update todo
  const handleSaveTodo = async (todoData) => {
    console.log('handleSaveTodo called with:', todoData);
    try {
      if (editingTodo) {
        console.log('Updating todo:', editingTodo._id);
        await managerService.updateTodo(editingTodo._id, todoData);
      } else {
        console.log('Creating new todo');
        await managerService.createTodo(todoData);
      }
      
      console.log('Todo saved successfully, closing modal');
      setShowModal(false);
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error('Failed to save todo:', error);
      setError('Failed to save todo');
    }
  };

  // Update todo status
  const handleUpdateTodo = async (todoId, updateData) => {
    try {
      await managerService.updateTodo(todoId, updateData);
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
      setError('Failed to update todo');
    }
  };

  // Delete todo
  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    
    try {
      await managerService.deleteTodo(todoId);
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
      setError('Failed to delete todo');
    }
  };

  // Edit todo
  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setShowModal(true);
  };

  // Filter todos for selected date
  const getSelectedDateTodos = () => {
    return todos.filter(todo => {
      const todoDate = new Date(todo.date);
      return todoDate.toDateString() === selectedDate.toDateString();
    });
  };

  useEffect(() => {
    fetchTodos();
  }, [currentDate, filterStatus, filterCategory]);

  const calendarDays = getCalendarDays();
  const selectedDateTodos = getSelectedDateTodos();

  return (
    <>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      <div className={`${isCompact ? 'bg-transparent' : 'bg-gradient-to-br from-gray-900 via-black to-gray-800'} text-white ${isCompact ? '' : 'min-h-screen'}`}>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/50 text-red-300 rounded-xl flex items-center space-x-2 backdrop-blur-sm animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className={isCompact ? 'p-0' : 'px-6 py-8'}>
        {/* Header */}
        {!isCompact && (
          <div className="flex items-center justify-between mb-8">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Todo Calendar
              </h1>
              <p className="text-gray-300 text-lg">Manage your daily tasks and todos</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Add Todo</span>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className={`${isCompact ? 'bg-gradient-to-r from-gray-800/60 to-gray-700/40' : 'bg-gradient-to-r from-gray-900/80 to-gray-800/60'} rounded-2xl p-6 mb-6 border border-gray-700/50 backdrop-blur-sm shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-2 group-hover:text-blue-300 transition-colors duration-200">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                >
                  <option value="all">All Status</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-2 group-hover:text-purple-300 transition-colors duration-200">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Project">Project</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            {isCompact && (
              <button
                onClick={() => setShowModal(true)}
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Add Todo</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className={`${isCompact ? 'bg-gradient-to-br from-gray-800/60 to-gray-700/40' : 'bg-gradient-to-br from-gray-900/90 to-gray-800/70'} rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-xl`}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="group p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 transform hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="group p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 transform hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-bold text-gray-300 bg-gradient-to-r from-gray-700/50 to-gray-600/30 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`group min-h-[90px] p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      day.isCurrentMonth 
                        ? 'bg-gradient-to-br from-gray-800/80 to-gray-700/60 hover:from-gray-700/90 hover:to-gray-600/70 border-gray-600/50 hover:border-gray-500/70' 
                        : 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 text-gray-500 border-gray-700/30'
                    } ${day.isToday ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/25' : ''} ${
                      day.isSelected ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-400 shadow-lg shadow-blue-500/25' : ''
                    }`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="text-sm font-bold mb-2 text-white">
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {day.todos.slice(0, 3).map((todo, todoIndex) => (
                        <div
                          key={todoIndex}
                          className={`text-xs p-2 rounded-lg truncate font-medium transition-all duration-200 group-hover:scale-105 ${
                            todo.status === 'Completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm' :
                            todo.status === 'In Progress' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm' :
                            'bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-sm'
                          }`}
                        >
                          {todo.title.length > 10 ? todo.title.substring(0, 10) + '...' : todo.title}
                        </div>
                      ))}
                      {day.todos.length > 3 && (
                        <div className="text-xs text-gray-400 font-medium bg-gray-700/50 rounded px-2 py-1">
                          +{day.todos.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Date Todos */}
          <div className={`${isCompact ? 'bg-gradient-to-br from-gray-800/60 to-gray-700/40' : 'bg-gradient-to-br from-gray-900/90 to-gray-800/70'} rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h3>
              <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded-full border border-blue-500/30">
                {selectedDateTodos.length} todo{selectedDateTodos.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-300 font-medium">Loading todos...</p>
              </div>
            ) : selectedDateTodos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-700/50 to-gray-600/30 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-300 mb-6 text-lg font-medium">No todos for this date</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="font-medium">Add Todo</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {selectedDateTodos.map(todo => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                    onEdit={handleEditTodo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Todo Modal */}
      <TodoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveTodo}
        todo={editingTodo}
      />
      </div>
    </>
  );
};

export default TodoCalendar;
