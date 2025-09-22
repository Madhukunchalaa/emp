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
    <div>
      <h1>All projects</h1>

     <table className="table table-dark table-striped table-hover">
  <thead>
    <tr>
      <th>Project Name</th>
      <th>Start Date</th>
      <th>End Date</th>
      <th>Status</th>
      <th>Progress</th>
      <th>Priority</th>
      <th>Team</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {projects.map((a) => (
      <tr key={a._id}>
        <td>{a.title}</td>
        <td>{a.startDate || "N/A"}</td>
        <td>{a.endDate || "N/A"}</td>
        <td>
          <span className={`badge bg-${a.status === 'completed' ? 'success' : 'secondary'}`}>
            {a.status}
          </span>
        </td>
        <td>{a.progress || 0}%</td>
        <td>
          <span className={`badge bg-${a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'secondary'}`}>
            {a.priority}
          </span>
        </td>
        <td>{a.team || "No team"}</td>
        <td>
          <button className="btn btn-sm btn-outline-light me-2">
            <i className="bi bi-eye"></i>
          </button>
          <button className="btn btn-sm btn-outline-light">
            <i className="bi bi-pencil"></i>
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>



     

      <h2>Project (raw)</h2>
      <pre>{JSON.stringify(project, null, 2)}</pre>

      <h2>Tasks</h2>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>

      <h2>Team Members</h2>
      <pre>{JSON.stringify(teamMembers, null, 2)}</pre>

      <h2>Updates (last 3 months)</h2>
      <pre>{JSON.stringify(projectUpdates, null, 2)}</pre>

      <h2>Stats</h2>
      <pre>
        {JSON.stringify(
          {
            progress: calculateProgress(),
            taskStats: getTaskStats(),
            budgetStats: getBudgetStats(),
          },
          null,
          2
        )}
      </pre>
    </div>
  );
};

export default ProjectDetails;
