import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { managerService } from "../../services/api";
import { use } from "react";

const ProjectDetails = () => {
  const { projectId } = useParams();

  // state
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects,setProjects] = useState([])



  useEffect(()=>{
    const projectList = async ()=>{
      try{
        const allProjects = await managerService.getProjects();
        const allData = allProjects.data;
        setProjects(allData)
      }
      catch{
        console.error('failed to fetch all projects')
      }
    }
    projectList()
  },[])

  // fetch project + updates
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);

        // 1. Get project by ID
        const projectRes = await managerService.getProjectById(projectId);
        const projectData = projectRes.data;
        setProject(projectData);

        // 2. Extract tasks from steps
        if (projectData?.steps) {
          const allTasks = projectData.steps.reduce((acc, step) => {
            return acc.concat(
              step.tasks.map((task) => ({
                ...task,
                stepName: step.name,
              }))
            );
          }, []);
          setTasks(allTasks);

          // 3. Extract unique team members
          const uniqueTeamMembers = [];
          const memberIds = new Set();

          allTasks.forEach((task) => {
            if (task.assignedTo && !memberIds.has(task.assignedTo._id)) {
              memberIds.add(task.assignedTo._id);
              uniqueTeamMembers.push(task.assignedTo);
            }
          },[]);

          // Add project creator if missing
          if (projectData.createdBy && !memberIds.has(projectData.createdBy._id)) {
            uniqueTeamMembers.push(projectData.createdBy);
          }

          setTeamMembers(uniqueTeamMembers);
        }

        // 4. Fetch updates for last 3 months
        await fetchProjectUpdates(projectId);
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  // helper: fetch updates
  const fetchProjectUpdates = async (projectId) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const response = await managerService.getProjectUpdates(
        projectId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      setProjectUpdates(response.data.updates || []);
    } catch (error) {
      console.error("Failed to fetch project updates:", error);
      setProjectUpdates([]);
    }
  };

  // helper: calculate project progress %
  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // helper: task stats
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter(
      (t) => t.status === "in-progress" || t.status === "in progress"
    ).length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const overdue = tasks.filter((t) => t.status === "overdue").length;
    return { total, completed, inProgress, pending, overdue };
  };

  // helper: budget stats
  const getBudgetStats = () => {
    const budget = project?.budget || 20000;
    const used = Math.round(budget * (calculateProgress() / 100));
    const remaining = budget - used;
    return { budget, used, remaining };
  };

  // ⚡ No UI: Just return JSON dump (for debugging)
  if (loading) return <pre>Loading...</pre>;
  if (error) return <pre>Error: {error}</pre>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Error/Success Messages */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center space-x-2 shadow-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center space-x-2 shadow-sm">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Projects</span>
          </Link>

          {/* Enhanced Project Header Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
              </div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-4xl font-bold">{project.title}</h1>
                      <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                        ID: #{project._id?.slice(-6)}
                      </div>
                    </div>
                    <p className="text-indigo-100 text-lg mb-4 max-w-3xl leading-relaxed">{project.description}</p>
                    <div className="flex items-center gap-6">
                      <StatusBadge status={getProjectStatus()} size="lg" />
                      <div className="flex items-center gap-2 text-indigo-100">
                        <Calendar className="w-4 h-4" />
                        <span>Created {new Date(project.createdAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-100">
                        <Users className="w-4 h-4" />
                        <span>{teamMembers.length} Team Members</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105">
                    <Bell className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Project
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Progress Section */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Project Progress</h2>
                  <p className="text-gray-600">Track completion and milestones</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm">
                  <Activity className="w-4 h-4" />
                  <span>Last updated {new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress Ring */}
                <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-6 shadow-lg">
                  <ProgressRing progress={calculateProgress()} size={140} color="text-indigo-500" />
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                    <p className="text-gray-600 text-sm">Project completion rate</p>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Task Breakdown</h3>
                      <span className="text-2xl font-bold text-indigo-600">{taskStats.completed}/{taskStats.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-xl font-bold text-green-600">{taskStats.completed}</div>
                        <div className="text-xs text-green-700">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-xl font-bold text-blue-600">{taskStats.inProgress}</div>
                        <div className="text-xs text-blue-700">In Progress</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-xl">
                        <div className="text-xl font-bold text-yellow-600">{taskStats.pending}</div>
                        <div className="text-xs text-yellow-700">Pending</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-xl">
                        <div className="text-xl font-bold text-red-600">{taskStats.overdue}</div>
                        <div className="text-xs text-red-700">Overdue</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-indigo-500">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
                          <div className="text-sm text-gray-600">Team Members</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">${budgetStats.used.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Budget Used</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-purple-500">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{projectUpdates.length}</div>
                          <div className="text-sm text-gray-600">Recent Updates</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3, color: 'indigo' },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle, color: 'green' },
              { id: 'team', label: 'Team', icon: Users, color: 'purple' },
              { id: 'updates', label: 'Updates', icon: Activity, color: 'blue' },
              { id: 'budget', label: 'Budget', icon: DollarSign, color: 'emerald' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/25`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enhanced Metrics Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{taskStats.total}</div>
                      <div className="text-sm text-blue-600 font-medium">+{taskStats.completed} completed</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Total Tasks</h3>
                  <p className="text-sm text-gray-600">Project task breakdown</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
                      <div className="text-sm text-purple-600 font-medium">Active contributors</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Team Members</h3>
                  <p className="text-sm text-gray-600">Project contributors</p>
                  <div className="mt-3 flex -space-x-2">
                    {teamMembers.slice(0, 4).map((member, index) => (
                      <UserAvatar 
                        key={member._id}
                        name={member.name} 
                        avatar={member.avatar}
                        size="sm"
                        className="ring-2 ring-white"
                      />
                    ))}
                    {teamMembers.length > 4 && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                        +{teamMembers.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">${budgetStats.used.toLocaleString()}</div>
                      <div className="text-sm text-green-600 font-medium">of ${budgetStats.budget.toLocaleString()}</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Budget Used</h3>
                  <p className="text-sm text-gray-600">Financial progress</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(budgetStats.used / budgetStats.budget) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{projectUpdates.length}</div>
                      <div className="text-sm text-orange-600 font-medium">Recent activity</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Project Updates</h3>
                  <p className="text-sm text-gray-600">This month's progress</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-3/4"></div>
                    </div>
                    <span className="text-xs text-gray-500">75%</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Team Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Team Overview</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{teamMembers.filter((_, i) => i % 2 === 0).length} online</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {teamMembers.slice(0, 5).map((member, index) => (
                    <div key={member._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <UserAvatar 
                        name={member.name} 
                        avatar={member.avatar}
                        size="md"
                        status={index % 2 === 0 ? "online" : "offline"}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{member.role || 'Team Member'}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-indigo-50 rounded-lg px-3 py-1">
                          <p className="text-lg font-bold text-indigo-600">
                            {tasks.filter(t => t.assignedTo?._id === member._id).length}
                          </p>
                          <p className="text-xs text-indigo-500">tasks</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length > 5 && (
                    <div className="text-center pt-4 border-t border-gray-100">
                      <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        View all {teamMembers.length} team members →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Project Tasks</h3>
                    <p className="text-gray-600 mt-1">Manage and track all project tasks</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100">
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                </div>
                
                {/* Task Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                    <div className="text-sm text-green-700">Completed</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                    <div className="text-sm text-blue-700">In Progress</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
                    <div className="text-sm text-yellow-700">Pending</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                    <div className="text-sm text-red-700">Overdue</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Task</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Assignee</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Step</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-3">
                              <UserAvatar name={task.assignedTo.name} avatar={task.assignedTo.avatar} size="sm" />
                              <span className="text-gray-900">{task.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{task.stepName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={task.status} size="sm" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-6">
              <div className="bg-black/5 rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Project Updates</h3>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      Add Update
                    </button>
                  </div>
                </div>

                {projectUpdates.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h4>
                    <p className="text-gray-600 mb-6">Project updates will appear here as team members submit their work.</p>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Request Update
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectUpdates.map((update) => (
                      <div key={update._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-4">
                          <UserAvatar 
                            name={update.employee?.name} 
                            avatar={update.employee?.avatar}
                            size="md"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{update.employee?.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString()}
                                </p>
                              </div>
                              <StatusBadge status={update.approvalStatus || 'pending'} size="sm" />
                            </div>
                            
                            {update.project_title && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-700">Project: </span>
                                <span className="text-sm text-gray-600">{update.project_title}</span>
                              </div>
                            )}

                            {update.taskDescription && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-700">Task: </span>
                                <span className="text-sm text-gray-600">{update.taskDescription}</span>
                              </div>
                            )}

                            <p className="text-gray-700 mb-4">
                              {update.update || update.description || 'No description provided'}
                            </p>

                            {(update.plannedTime || update.actualTime) && (
                              <div className="flex items-center gap-6 mb-4 text-sm">
                                {update.plannedTime && (
                                  <div>
                                    <span className="text-gray-600">Planned: </span>
                                    <span className="font-medium text-gray-900">{update.plannedTime}h</span>
                                  </div>
                                )}
                                {update.actualTime && (
                                  <div>
                                    <span className="text-gray-600">Actual: </span>
                                    <span className="font-medium text-gray-900">{update.actualTime}h</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {update.imageUrl && (
                              <div className="mb-4">
                                <img 
                                  src={update.imageUrl} 
                                  alt="Update attachment"
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                                <AlertCircle className="w-4 h-4" />
                                Reject
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                                <MessageSquare className="w-4 h-4" />
                                Comment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black/5 rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Overview</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total Budget</span>
                      <span className="text-2xl font-bold text-gray-900">${budgetStats.budget.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">${budgetStats.used.toLocaleString()}</div>
                      <div className="text-sm text-green-700">Used</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">${budgetStats.remaining.toLocaleString()}</div>
                      <div className="text-sm text-blue-700">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/5 rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Development</span>
                    <span className="font-semibold text-gray-900">${Math.round(budgetStats.used * 0.6).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Design</span>
                    <span className="font-semibold text-gray-900">${Math.round(budgetStats.used * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Testing</span>
                    <span className="font-semibold text-gray-900">${Math.round(budgetStats.used * 0.1).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
