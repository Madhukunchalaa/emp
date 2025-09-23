import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    // Example fetch; replace with your API endpoint
    fetch(`http://localhost:5000/manager/projects/${id}`)
      .then(res => res.json())
      .then(data => setProject(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project Details - {project.title}</h1>
      <p>Description: {project.description}</p>
      <p>Status: {project.status}</p>
      {/* Add other fields as needed */}
    </div>
  );
};

export default ProjectDetails;
