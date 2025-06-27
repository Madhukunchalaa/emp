import React from "react";

const ProjectSteps = ({ project }) => {
  if (!project) return null;

  return (
    <div className="project-steps-container">
      <h2>{project.title}</h2>
      <div style={{ margin: "16px 0" }}>
        <div style={{ background: "#eee", borderRadius: 8, height: 24, width: "100%" }}>
          <div
            style={{
              width: `${project.progress || 0}%`,
              background: "#4caf50",
              height: "100%",
              borderRadius: 8,
              transition: "width 0.5s"
            }}
          />
        </div>
        <div style={{ textAlign: "right", fontWeight: "bold" }}>
          {project.progress || 0}% Complete
        </div>
      </div>
      {project.steps && project.steps.length > 0 ? (
        project.steps.map((step, idx) => (
          <div key={idx} style={{ marginBottom: 24 }}>
            <h3>{step.name}</h3>
            <ul>
              {step.tasks.map((task, tIdx) => (
                <li key={tIdx} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: "bold" }}>{task.title}</span>
                  {" — "}
                  <span>
                    Assigned to: {task.assignedTo?.name || "Unassigned"}
                  </span>
                  {" — "}
                  <span
                    style={{
                      color: task.status === "completed" ? "green" : "orange",
                      fontWeight: "bold"
                    }}
                  >
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div>No steps defined for this project.</div>
      )}
    </div>
  );
};

export default ProjectSteps; 