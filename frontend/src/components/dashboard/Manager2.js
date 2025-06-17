import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  FileText,
  Palette,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useNavigate, Link } from "react-router-dom";

import axios from "axios";
import jwtDecode from "jwt-decode";
import { managerService } from "../../services/api";
import { useParams } from "react-router-dom";
const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState("employees");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees,setEmployees]=useState()
  const [projects,setProjects]=useState()
  const [designs,setDesigns]=useState()
  const [user,setUser]=useState()
  const [updates,setUpdates]=useState()
  const [manager,setManager]=useState()
  const [email,setEmail]=useState()

const { employeeId } = useParams();

const hour = new Date().getHours();

const greeting =
  hour < 12 ? "Good Morning" :
  hour < 18 ? "Good Afternoon" :
  "Good Evening";



useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token);
    setUser(decoded);
  }
}, []);

  //attendence Histaory of employees
 // employee attendance details
 useEffect(() => {
  const fetchDailyUpdates = async () => {
    try {
      const response = await managerService.getEmployeeDailyUpdates();
      setUpdates(response.data.updates); // Make sure to access the actual array
      console.log('Fetched updates:', response.data.updates);
    } catch (error) {
      console.error(
        "Error fetching daily updates:",
        error?.response?.data?.message || error.message || error
      );
    }
  };

  fetchDailyUpdates();
}, []);




// this function is to get the details of manager profile
  useEffect(() => {
    const manager = async () => {
      try {
        const response = await managerService.getProfile();
        setManager(response.data.name);
        setEmail(response.data.email);
       
       
      } catch {}
    };
    manager();
  }, []);

  //getting all employee details to manager
  useEffect(() => {
    const emp = async () => {
      try {
        const response = await managerService.getEmployees();
        setEmployees(response.data);
        console.log(response.data.status)
      } catch (error) {
        console.log("Error fetching employees:", error);
      }
    };

    emp();
  }, []);


  // getting projects
  useEffect(() => {
    const project = async () => {
      try {
        const response = await managerService.getProjects();
        setProjects(response.data);
        console.log(response.data)
      } catch (error) {
        console.log("Error fetching projects:", error);
      }
    };

    project();
  }, []);

  //employee attendence details
  
  //  const handleEmployeeChange = async (e) => {
  //   const employeeId = e.target.value;
  //   setSelectedEmployeeId(employeeId);
  //   try {
  //     const res = managerService.getAttendanceHistory();
  //     setAttendanceHistory(res.data);
  //   } catch (err) {
  //     console.log("failed to fetch the employee attendence history");
  //   }
  // };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!selectedEmployeeId) return;

  //   try {
  //     const res = await managerService.getAttendanceHistory(selectedEmployeeId);
  //     setAttendanceHistory(res.data); // assuming array
      
  //   } catch (err) {
  //     console.log("Error fetching attendance:", err);
  //   } finally {
  //   }
  // };


  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const sidebarItems = [
    { id: "employees", label: "Employee List", icon: Users },
    { id: "projects", label: "Projects", icon: FileText },
    { id: "hours", label: "Working Hours", icon: Clock },
    { id: "updates", label: "Daily Updates", icon: FileText },
    { id: "designs", label: "Designs", icon: Palette },
  ];





//getting  status of employee














   

  //random colors for employee profile cards
  const renderContent = () => {
    switch (activeSection) {
      case "employees":
        const getRandomColorClass = () => {
          const colors = [
            "primary",
            "secondary",
            "success",
            "danger",
            "warning",
            "info",
            "dark",
          ];
          const random = Math.floor(Math.random() * colors.length);
          return `bg-${colors[random]}`;
        };
        const getRandomShadow = () => {
          const shadows = ["shadow-sm", "shadow", "shadow-lg"];
          return shadows[Math.floor(Math.random() * shadows.length)];
        };

        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Employee List</h3>
            <div className="row g-4">
              {Array.isArray(employees) &&
                employees.map((emp) => {
                  const randomBadgeClass = getRandomColorClass();
                  const randomShadowClass = getRandomShadow();
                  return (
                    <div key={emp._id} className="col-md-6 col-lg-4">
                      <div
                        className={`card border-0 rounded-4 ${randomShadowClass}`}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="avatar text-white rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  fontSize: "20px",
                                  backgroundColor: `#${Math.floor(
                                    Math.random() * 16777215
                                  ).toString(16)}`,
                                }}
                              >
                                {emp.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="card-title mb-1 text-dark fw-bold">
                                  {emp.name}
                                </h5>
                                <p className="text-muted mb-0 small">
                                  {emp.role}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`badge rounded-pill px-3 py-2 text-white ${randomBadgeClass}`}
                            >
                              {emp.status}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="mb-1">
                              <strong>Email:</strong> {emp.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );

      case "projects":
        const getStatusButton = (status) => {
          switch (status.toLowerCase()) {
            case "active":
              return (
                <button className="btn btn-success btn-sm rounded-pill px-3">
                  Active
                </button>
              );
            case "in progress":
              return (
                <button className="btn btn-warning btn-sm rounded-pill px-3 text-dark">
                  In Progress
                </button>
              );
            case "completed":
              return (
                <button className="btn btn-primary btn-sm rounded-pill px-3">
                  Completed
                </button>
              );
            default:
              return (
                <button className="btn btn-secondary btn-sm rounded-pill px-3">
                  Unknown
                </button>
              );
          }
        };

        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Projects</h3>
            <div className="row g-4">
              {Array.isArray(projects) &&
                projects.map((project) => (
                  <div key={project.id} className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-lg rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex flex-column justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="card-title fw-bold text-dark">
                              {project.title}
                            </h5>
                          </div>
                          <small className="text-muted">
                            Due: {project.deadline}
                          </small>
                          <p className="text-muted small mb-2">
                            {project.description}
                          </p>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-dark">Progress</small>
                            <small className="text-dark">
                              {project.status}%
                            </small>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className={`progress-bar ${
                                project.status >= 100 ? "bg-success" : "bg-info"
                              }`}
                              role="progressbar"
                              style={{ width: `${project.status}%` }}
                              aria-valuenow={project.status}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                        </div>

                        <div className="text-end">
                          {getStatusButton(project.phase || "in progress")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      case "hours":
        return (
          <div className="container mt-4">
            <h3>Manager Attendance Dashboard</h3>

            <form>
              <div className="mb-3">
                <label htmlFor="employeeSelect" className="form-label">
                  Select Employee:
                </label>
                <select
                  id="employeeSelect"
                  className="form-select"
                  // value={selectedEmployeeId}
                  // onChange={handleEmployeeChange}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>

            {/* {loading && <p className="mt-3">Loading attendance...</p>} */}

            {Array.isArray() &&
              attendanceHistory.length > 0 && (
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Punch In</th>
                      <th>Punch Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((entry, idx) => (
                      <tr key={idx}>
                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                        <td>
                          {entry.punchIn
                            ? new Date(entry.punchIn).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>

                        <td>
                          {entry.punchOut
                            ? new Date(entry.punchOut).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            {Array.isArray(attendanceHistory) &&
              attendanceHistory.length === 0 &&
              selectedEmployeeId && (
                <p className="mt-3">No attendance records found.</p>
              )}
          </div>
        );

     case "updates":
  return (
    <div>
      <h3 className="mb-4 fw-bold text-primary">Daily Updates</h3>
      <div className="row g-4">
        {Array.isArray(updates) &&
          updates.map((dailyUpdates, index) => {
            const bgColorClasses = [
              "bg-light",
              "bg-primary bg-opacity-10",
              "bg-warning bg-opacity-10",
              "bg-success bg-opacity-10",
              "bg-danger bg-opacity-10",
              "bg-info bg-opacity-10",
            ];
            const cardClass = bgColorClasses[index % bgColorClasses.length];

            const imageUrl = dailyUpdates.imageUrl
              ? dailyUpdates.imageUrl.replace(/\\/g, "/").replace("C:/Users/Madhk/OneDrive/Desktop/emp/backend", "")
              : null;

            return (
              <div key={dailyUpdates._id} className="col-md-6 col-lg-4">
                <div className={`card ${cardClass} shadow-sm rounded-4 border-0 p-3 h-100`}>
                  <div className="card-body d-flex flex-column justify-content-between p-0">

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-semibold text-dark mb-0">
                          <i className="bi bi-person-circle me-2 text-primary"></i>
                          {dailyUpdates.employee?.name || "Unknown"}
                        </h5>
                        <span className="badge bg-light text-muted">
                          <i className="bi bi-calendar-date me-1"></i>
                          {new Date(dailyUpdates.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mb-1 text-secondary small">
                        <i className="bi bi-envelope me-2"></i>
                        <strong>Email:</strong> {dailyUpdates.employee?.email || "Unknown"}
                      </div>

                      <div className="mb-1 text-secondary small">
                        <i className="bi bi-briefcase me-2"></i>
                        <strong>Project:</strong> {dailyUpdates.project_title || "Untitled"}
                      </div>

                      <div className="mb-1 text-secondary small">
                        <i className="bi bi-clipboard-check me-2"></i>
                        <strong>Status:</strong> {dailyUpdates.status}
                      </div>

                      <div className="mb-1 text-secondary small">
                        <i className="bi bi-journal-text me-2"></i>
                        <strong>Update:</strong> {dailyUpdates.update}
                      </div>

                      <div className="mb-2 text-secondary small">
                        <i className="bi bi-clock me-2"></i>
                        <strong>Finish By:</strong>{" "}
                        {dailyUpdates.finishBy?.slice(0, 10)}
                      </div>
                    </div>

                    {imageUrl && (
                      <div className="mb-3">
                        <img
                          src={`http://localhost:5000${dailyUpdates.imageUrl}`}
                          alt="Update"
                          className="img-fluid rounded shadow-sm"
                          style={{ maxHeight: "160px", objectFit: "cover", width: "100%" }}
                        />
                      </div>
                    )}

                    <div className="text-muted small fst-italic">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      No tasks recorded.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

      case "designs":
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Design Assets</h3>
            <div className="row g-3">
              {Array.isArray(designs) &&
                designs.map((design) => (
                  <div key={design.id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="card-title">{design.title}</h6>
                            <p className="text-muted mb-1">
                              by {design.description}
                            </p>
                            <img src={design.fileURL} alt="Design Preview" />
                            <div>
                              <small className="text-muted">
                                {design.submittedDate}
                              </small>
                            </div>
                          </div>
                          <span
                            className={`badge rounded-pill ${
                              design.status === "Approved"
                                ? "bg-success"
                                : design.status === "In Review"
                                ? "bg-warning"
                                : "bg-info"
                            }`}
                          >
                            {design.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted">
            Select a section from the sidebar
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return navigate("/login");
  }

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <style>{`
        .sidebar {
          transition: all 0.3s ease;
          min-height: 100vh;
        }
        .sidebar.collapsed {
          width: 80px !important;
        }
        .sidebar-item {
          transition: all 0.2s ease;
          border: none;
          background: none;
        }
        .sidebar-item:hover {
          background-color: #f8f9fa !important;
        }
        .sidebar-item.active {
          background-color: #e3f2fd !important;
          color: #1976d2 !important;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .header-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .main-content {
          min-height: calc(100vh - 200px);
        }
      `}</style>

      <div className="d-flex min-vh-100 bg-light">
        {/* Sidebar */}
        <div
          className={`bg-white shadow sidebar ${
            sidebarOpen ? "" : "collapsed"
          }`}
          style={{ width: sidebarOpen ? "260px" : "80px" }}
        >
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              {sidebarOpen && <h4 className="mb-0 fw-bold">Dashboard</h4>}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-outline-secondary btn-sm"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <nav className="p-3">
            <div className="d-grid gap-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`sidebar-item btn d-flex align-items-center text-start p-2 rounded ${
                      activeSection === item.id ? "active" : ""
                    }`}
                  >
                    <Icon size={20} className="me-3" />
                    {sidebarOpen && (
                      <span className="fw-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-fill d-flex flex-column">
          {/* Header Banner */}
          <header
            className="header-banner text-white p-4 shadow"
            style={{
              background: "linear-gradient(135deg, #3a0ca3, #4361ee)", // purple to blue gradient
              borderBottom: "4px solid rgb(255, 193, 7)", // light teal
            }}
          >
            <div className="container">
              <div className="row align-items-center">
                {/* Left Side: Greeting and Intro */}
                <div className="col-md-7 text-center text-md-start mb-4 mb-md-0">
                  <h4 className="fw-semibold">
                    👋{greeting},{" "}
                    <span style={{ color: "rgb(255, 193, 7)" }}>Manager</span>!
                  </h4>
                  <h1 className="display-5 fw-bold mt-2">
                    Welcome back to the Manager Dashboard
                  </h1>
                  <p className="lead text-white-50 mt-3">
                    Track your team's progress, assign tasks, and ensure
                    productivity.
                  </p>
                </div>

                {/* Right Side: Illustration */}
                <div className="col-md-5 text-center">
                  <img
                    src="https://cdn.dribbble.com/userupload/23691475/file/original-9d72eaaf0be2992f8c5d86cbcdac4a96.gif"
                    alt="Dashboard Illustration"
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: "250px" }}
                  />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="row mt-4 text-center">
                {[
                  { label: "Active Projects", value: 5 },
                  { label: "Team Members", value: 12 },
                  { label: "Pending Tasks", value: 3 },
                  { label: "Reports Reviewed", value: 7 },
                ].map((item, index) => (
                  <div
                    className={`col-6 col-md-3 ${
                      index >= 2 ? "mt-3 mt-md-0" : ""
                    }`}
                    key={index}
                  >
                    <div
                      className="p-3 rounded"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <h5
                        className="mb-0"
                        style={{ color: "rgb(255, 193, 7)" }}
                      >
                        {item.value}
                      </h5>
                      <small>{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-fill p-4 main-content">{renderContent()}</main>
        </div>

        {/* Right Sidebar - Profile */}
        <div className="bg-white shadow" style={{ width: "320px" }}>
          <div className="p-4">
            <div className="text-center">
              <div className="profile-avatar rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <User size={32} className="text-white" />
              </div>

              <div className="mb-4">
                <h5 className="fw-semibold mb-1">{manager}</h5>
                <p className="text-muted mb-1">{email}</p>
              </div>

              <div className="mb-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-secondary">Quick Stats</h6>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="fw-bold">3</div>
                        <small className="text-muted">Active Employees</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold">3</div>
                        <small className="text-muted">Active Projects</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold">1</div>
                        <small className="text-muted">Pending Reviews</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-secondary">
                      Recent Activity
                    </h6>
                    <div className="text-start">
                      <p className="small text-muted mb-1">
                        • Project update received
                      </p>
                      <p className="small text-muted mb-1">
                        • New design approved
                      </p>
                      <p className="small text-muted mb-0">
                        • Team meeting scheduled
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
              >
                <LogOut size={16} className="me-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;
