import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  CheckSquare, 
  Clock,
  AlertTriangle,
  User,
  Star,
  Eye,
  Edit,
  Trash2,
  X,
  Users
} from 'lucide-react';

// Task Card Component
const TaskCard = ({ task, onTaskClick, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'feature': return 'bg-blue-500 text-white';
      case 'bug': return 'bg-red-500 text-white';
      case 'research': return 'bg-purple-500 text-white';
      case 'testing': return 'bg-green-500 text-white';
      case 'quick task': return 'bg-cyan-500 text-white';
      case 'must have': return 'bg-pink-500 text-white';
      case 'should have': return 'bg-indigo-500 text-white';
      case 'brainstorm': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear().toString().slice(-2);
    return `${day} ${month}, ${year}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isDragging ? 'rotate-2 shadow-lg opacity-50' : ''
      }`}
      onClick={() => onTaskClick(task)}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 mr-2">
          {task.title}
        </h4>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Task Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(label)}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {task.comments && task.comments > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments}</span>
            </div>
          )}
          
          {task.attachments && task.attachments > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments}</span>
            </div>
          )}

          {task.subtasks && (
            <div className="flex items-center space-x-1">
              <CheckSquare className="w-3 h-3" />
              <span>{task.subtasks.completed}/{task.subtasks.total}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignee && (
          <div className="flex -space-x-1">
            {task.assignee.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-6 h-6 rounded-full border-2 border-white"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {task.assignee.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Priority Indicator */}
      {task.priority && task.priority !== 'low' && (
        <div className="absolute top-2 left-2">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
        </div>
      )}
    </div>
  );
};

// Column Component
const KanbanColumn = ({ column, tasks, onTaskClick, onAddTask, isOver }) => {
  const getColumnIcon = (columnId) => {
    switch (columnId) {
      case 'requirements': return <Star className="w-4 h-4" />;
      case 'testing': return <CheckSquare className="w-4 h-4" />;
      case 'development': return <Edit className="w-4 h-4" />;
      case 'deployment': return <Users className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getColumnColor = (columnId) => {
    switch (columnId) {
      case 'requirements': return 'border-blue-500/30 bg-blue-900/20';
      case 'testing': return 'border-orange-500/30 bg-orange-900/20';
      case 'development': return 'border-green-500/30 bg-green-900/20';
      case 'deployment': return 'border-purple-500/30 bg-purple-900/20';
      default: return 'border-gray-600 bg-gray-800/30';
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 min-h-[600px] w-80 flex-shrink-0 border ${getColumnColor(column.id)} ${isOver ? 'bg-blue-800/30 border-blue-500/50' : ''}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-gray-300">
            {getColumnIcon(column.id)}
          </div>
          <h3 className="font-semibold text-white">{column.title}</h3>
          <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks Area */}
      <div className="min-h-[500px]">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
        
        {/* Add Task Button */}
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 hover:bg-gray-700/30 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add task</span>
        </button>
      </div>
    </div>
  );
};

// Task Detail Modal Component
const TaskDetailModal = ({ task, isOpen, onClose, onUpdate }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [taskData, setTaskData] = useState(task || {});

  useEffect(() => {
    setTaskData(task || {});
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    onUpdate(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Task Details</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            {editingTitle ? (
              <input
                type="text"
                value={taskData.title || ''}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyPress={(e) => e.key === 'Enter' && setEditingTitle(false)}
                className="text-xl font-semibold text-white w-full border-none outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <h2
                className="text-xl font-semibold text-white cursor-pointer hover:bg-gray-700/50 p-2 -m-2 rounded"
                onClick={() => setEditingTitle(true)}
              >
                {taskData.title || 'Untitled Task'}
              </h2>
            )}
          </div>

          {/* Task Meta Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
              <div className="text-sm text-gray-300 bg-gray-700 px-3 py-2 rounded-lg">
                {task.column || 'Requirements'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={taskData.priority || 'medium'}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                className="text-sm bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-full text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
            <input
              type="date"
              value={taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              className="text-sm bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-full text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assignee</label>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add assignee</span>
              </button>
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Labels</label>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add label</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            {editingDescription ? (
              <textarea
                value={taskData.description || ''}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                onBlur={() => setEditingDescription(false)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm min-h-[100px] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a description..."
                autoFocus
              />
            ) : (
              <div
                className="min-h-[100px] p-3 border border-gray-600 rounded-lg text-sm text-gray-300 cursor-pointer hover:bg-gray-700/50 bg-gray-700/30"
                onClick={() => setEditingDescription(true)}
              >
                {taskData.description || 'Add a description...'}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">Checklist</label>
              <span className="text-sm text-gray-400">0/0</span>
            </div>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 w-full text-left p-2 border border-dashed border-gray-600 rounded-lg hover:bg-gray-700/30 transition-all">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add item</span>
            </button>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Comments</label>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <textarea
                    placeholder="Write a comment..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-200 transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors">
                        Cancel
                      </button>
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Kanban Board Component
const KanbanBoard = ({ projectId, tasks: initialTasks = [] }) => {
  const [columns] = useState([
    { id: 'requirements', title: 'Requirements' },
    { id: 'testing', title: 'Testing' },
    { id: 'development', title: 'Development' },
    { id: 'deployment', title: 'Deployment' }
  ]);

  const [tasks, setTasks] = useState(() => {
    // Convert initial tasks to kanban format or use sample data
    if (initialTasks && initialTasks.length > 0) {
      return initialTasks.map((task, index) => ({
        id: task._id || `task-${index}`,
        title: task.title || task.name || 'Untitled Task',
        description: task.description,
        column: task.status === 'completed' ? 'deployment' : 
                task.status === 'in-progress' ? 'development' :
                task.status === 'testing' ? 'testing' : 'requirements',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || task.deadline,
        assignee: task.assignedTo ? {
          name: task.assignedTo.name,
          avatar: task.assignedTo.avatar
        } : null,
        labels: task.labels || (task.priority ? [task.priority] : []),
        comments: Math.floor(Math.random() * 5),
        attachments: Math.floor(Math.random() * 3),
        subtasks: {
          completed: Math.floor(Math.random() * 5),
          total: Math.floor(Math.random() * 8) + 2
        }
      }));
    }
    
    // Sample tasks for demo
    return [
      {
        id: 'task-1',
        title: 'ok dothsi',
        description: 'Initial project requirements and scope definition',
        column: 'requirements',
        priority: 'high',
        dueDate: '2025-09-27',
        assignee: { name: 'John Doe', avatar: null },
        labels: ['Feature'],
        comments: 2,
        attachments: 1,
        subtasks: { completed: 0, total: 0 }
      },
      {
        id: 'task-2',
        title: 'test this',
        description: 'Set up testing framework and write initial tests',
        column: 'requirements',
        priority: 'medium',
        dueDate: null,
        assignee: { name: 'Jane Smith', avatar: null },
        labels: ['Testing'],
        comments: 1,
        attachments: 0,
        subtasks: { completed: 0, total: 0 }
      },
      {
        id: 'task-3',
        title: 'test',
        description: 'Research and analysis phase',
        column: 'testing',
        priority: 'medium',
        dueDate: '2025-09-24',
        assignee: { name: 'Mike Johnson', avatar: null },
        labels: ['Research'],
        comments: 0,
        attachments: 0,
        subtasks: { completed: 1, total: 1 }
      },
      {
        id: 'task-4',
        title: 'Monitor Ad Performance',
        description: 'Track advertising campaign metrics',
        column: 'testing',
        priority: 'high',
        dueDate: '2025-09-15',
        assignee: { name: 'Sarah Wilson', avatar: null },
        labels: ['Testing', 'Must have'],
        comments: 3,
        attachments: 2,
        subtasks: { completed: 0, total: 1 }
      },
      {
        id: 'task-5',
        title: 'Unit tests for auth',
        description: 'Write comprehensive unit tests for authentication module',
        column: 'testing',
        priority: 'urgent',
        dueDate: '2025-08-23',
        assignee: { name: 'Alex Brown', avatar: null },
        labels: ['Feature', 'Should have', 'Must have', 'Brainstorm'],
        comments: 1,
        attachments: 0,
        subtasks: { completed: 0, total: 3 }
      },
      {
        id: 'task-6',
        title: 'Schedule Team Meeting',
        description: 'Organize weekly team sync meeting',
        column: 'development',
        priority: 'medium',
        dueDate: '2025-08-27',
        assignee: { name: 'Lisa Davis', avatar: null },
        labels: ['Feature', 'Should have'],
        comments: 3,
        attachments: 0,
        subtasks: { completed: 3, total: 4 }
      },
      {
        id: 'task-7',
        title: 'Develop Support Scripts',
        description: 'Create automation scripts for support team',
        column: 'development',
        priority: 'low',
        dueDate: '2025-09-07',
        assignee: { name: 'Tom Wilson', avatar: null },
        labels: ['Feature', 'Should have'],
        comments: 0,
        attachments: 0,
        subtasks: { completed: 0, total: 4 }
      },
      {
        id: 'task-8',
        title: 'Monitor server logs',
        description: 'Set up monitoring for server performance',
        column: 'development',
        priority: 'high',
        dueDate: null,
        assignee: { name: 'Emma Taylor', avatar: null },
        labels: ['Feature', 'Should have'],
        comments: 0,
        attachments: 0,
        subtasks: { completed: 0, total: 4 }
      },
      {
        id: 'task-9',
        title: 'Conduct Market Research',
        description: 'Research market trends and competitor analysis',
        column: 'deployment',
        priority: 'medium',
        dueDate: '2025-09-08',
        assignee: { name: 'David Lee', avatar: null },
        labels: ['Bug', 'Testing', 'Urgent'],
        comments: 3,
        attachments: 0,
        subtasks: { completed: 0, total: 3 }
      },
      {
        id: 'task-10',
        title: 'UI design review',
        description: 'Review and finalize user interface designs',
        column: 'deployment',
        priority: 'high',
        dueDate: null,
        assignee: { name: 'Amy Johnson', avatar: null },
        labels: ['Bug', 'Testing', 'Quick Task', 'Must have'],
        comments: 3,
        attachments: 0,
        subtasks: { completed: 0, total: 4 }
      },
      {
        id: 'task-11',
        title: 'Mobile layout fixes',
        description: 'Fix responsive design issues on mobile devices',
        column: 'deployment',
        priority: 'medium',
        dueDate: null,
        assignee: { name: 'Chris Anderson', avatar: null },
        labels: ['Bug'],
        comments: 0,
        attachments: 0,
        subtasks: { completed: 0, total: 5 }
      },
      {
        id: 'task-12',
        title: 'Finalize Content Calendar',
        description: 'Complete content planning for next quarter',
        column: 'deployment',
        priority: 'low',
        dueDate: '2025-08-26',
        assignee: { name: 'Rachel Green', avatar: null },
        labels: ['Research', 'Short term', 'Should have'],
        comments: 1,
        attachments: 0,
        subtasks: { completed: 0, total: 0 }
      }
    ];
  });

  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by column
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.column === column.id);
    return acc;
  }, {});

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the task being dragged
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Determine the target column
    let targetColumn = overId;
    
    // If dropped on a task, get the task's column
    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      targetColumn = overTask.column;
    }

    // If dropped on a column that's not in our columns list, it might be a column ID
    if (!columns.find(col => col.id === targetColumn)) {
      // Check if it's a valid column ID
      const validColumn = columns.find(col => col.id === overId);
      if (validColumn) {
        targetColumn = validColumn.id;
      } else {
        return; // Invalid drop target
      }
    }

    // Update the task's column if it changed
    if (activeTask.column !== targetColumn) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === activeId
            ? { ...task, column: targetColumn }
            : task
        )
      );
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );
  };

  const handleAddTask = (columnId) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      description: '',
      column: columnId,
      priority: 'medium',
      dueDate: null,
      assignee: null,
      labels: [],
      comments: 0,
      attachments: 0,
      subtasks: { completed: 0, total: 0 }
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    setSelectedTask(newTask);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Board</h1>
            <p className="text-gray-300">Manage your project tasks in a visual workflow</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-500 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] || []}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <TaskCard
                task={tasks.find(task => task.id === activeId)}
                onTaskClick={() => {}}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default KanbanBoard;