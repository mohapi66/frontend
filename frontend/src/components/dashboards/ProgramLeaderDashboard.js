import React, { useState, useEffect } from "react";
import API from "../../api";

const ProgramLeaderDashboard = () => {
  const [activeTab, setActiveTab] = useState("programs");
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  const [reports, setReports] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState({
    programs: [],
    modules: [],
    reports: [],
    assignments: []
  });

  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalModules: 0,
    totalReports: 0,
    totalAssignments: 0,
    reviewedReports: 0,
    totalLecturers: 0,
    totalStudents: 0
  });

  // Form states
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  
  const [programForm, setProgramForm] = useState({
    program_code: "",
    program_name: "",
    faculty_id: ""
  });

  const [moduleForm, setModuleForm] = useState({
    module_name: "",
    program_id: "",
    faculty_id: "",
    total_registered_students: ""
  });

  const [assignmentForm, setAssignmentForm] = useState({
    module_id: "",
    program_id: "",
    lecturer_id: ""
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter data when search term or active tab changes
  useEffect(() => {
    filterData();
  }, [searchTerm, activeTab, programs, modules, reports, assignments]);

  const filterData = () => {
    if (!searchTerm.trim()) {
      setFilteredData({
        programs,
        modules,
        reports,
        assignments
      });
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    
    setFilteredData({
      programs: programs.filter(program => 
        program.program_code?.toLowerCase().includes(lowercasedSearch) ||
        program.program_name?.toLowerCase().includes(lowercasedSearch) ||
        program.faculty_name?.toLowerCase().includes(lowercasedSearch)
      ),
      modules: modules.filter(module =>
        module.module_name?.toLowerCase().includes(lowercasedSearch) ||
        module.program_name?.toLowerCase().includes(lowercasedSearch) ||
        module.faculty_name?.toLowerCase().includes(lowercasedSearch)
      ),
      reports: reports.filter(report =>
        report.program_name?.toLowerCase().includes(lowercasedSearch) ||
        report.program_code?.toLowerCase().includes(lowercasedSearch) ||
        report.lecturer_name?.toLowerCase().includes(lowercasedSearch) ||
        report.module_name?.toLowerCase().includes(lowercasedSearch) ||
        report.faculty_name?.toLowerCase().includes(lowercasedSearch)
      ),
      assignments: assignments.filter(assignment =>
        assignment.module_name?.toLowerCase().includes(lowercasedSearch) ||
        assignment.program_name?.toLowerCase().includes(lowercasedSearch) ||
        assignment.program_code?.toLowerCase().includes(lowercasedSearch) ||
        assignment.lecturer_name?.toLowerCase().includes(lowercasedSearch)
      )
    });
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPrograms(),
        fetchModules(),
        fetchReports(),
        fetchAssignments(),
        fetchLecturers(),
        fetchFaculties(),
        fetchStudents()
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await API.get("/programs");
      setPrograms(res.data);
      setStats(prev => ({ ...prev, totalPrograms: res.data.length }));
    } catch (error) {
      console.error("Error fetching programs:", error);
      throw error;
    }
  };

  const fetchModules = async () => {
    try {
      const res = await API.get("/modules");
      setModules(res.data);
      setStats(prev => ({ ...prev, totalModules: res.data.length }));
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw error;
    }
  };

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports");
      setReports(res.data);
      const reviewed = res.data.filter(report => report.status === 'reviewed').length;
      setStats(prev => ({ 
        ...prev, 
        totalReports: res.data.length,
        reviewedReports: reviewed
      }));
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await API.get("/lecture-assignments");
      setAssignments(res.data);
      setStats(prev => ({ ...prev, totalAssignments: res.data.length }));
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await API.get("/lecturers");
      setLecturers(res.data);
      setStats(prev => ({ ...prev, totalLecturers: res.data.length }));
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      throw error;
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await API.get("/faculties");
      setFaculties(res.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      throw error;
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
      setStats(prev => ({ ...prev, totalStudents: res.data.length }));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchProgramsByFaculty = async (facultyId) => {
    if (!facultyId) {
      return [];
    }
    try {
      const res = await API.get(`/programs/${facultyId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching programs by faculty:", error);
      return [];
    }
  };

  // Edit and Delete Functions
  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditForm({ ...item });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = "";
      let data = { ...editForm };
      
      // Remove unnecessary fields before sending
      delete data.created_by_name;
      delete data.faculty_name;
      delete data.program_name;
      delete data.lecturer_name;
      delete data.assigned_by_name;
      delete data.created_at;

      switch (editingItem.type) {
        case 'program':
          endpoint = `/programs/${editingItem.id}`;
          break;
        case 'module':
          endpoint = `/modules/${editingItem.id}`;
          break;
        case 'assignment':
          endpoint = `/lecture-assignments/${editingItem.id}`;
          break;
        default:
          return;
      }

      await API.put(endpoint, data);
      alert(`${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)} updated successfully!`);
      setShowEditModal(false);
      setEditingItem(null);
      
      // Refresh the relevant data
      switch (editingItem.type) {
        case 'program':
          await fetchPrograms();
          break;
        case 'module':
          await fetchModules();
          break;
        case 'assignment':
          await fetchAssignments();
          break;
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert(error.response?.data?.error || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type, name) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      let endpoint = "";
      switch (type) {
        case 'program':
          endpoint = `/programs/${id}`;
          break;
        case 'module':
          endpoint = `/modules/${id}`;
          break;
        case 'assignment':
          endpoint = `/lecture-assignments/${id}`;
          break;
        default:
          return;
      }

      await API.delete(endpoint);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
      
      // Refresh the relevant data
      switch (type) {
        case 'program':
          await fetchPrograms();
          break;
        case 'module':
          await fetchModules();
          break;
        case 'assignment':
          await fetchAssignments();
          break;
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(error.response?.data?.error || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  // Excel Export Function
  const exportToExcel = () => {
    let dataToExport = [];
    let fileName = '';

    switch (activeTab) {
      case 'programs':
        dataToExport = filteredData.programs;
        fileName = 'programs';
        break;
      case 'modules':
        dataToExport = filteredData.modules;
        fileName = 'modules';
        break;
      case 'assignments':
        dataToExport = filteredData.assignments;
        fileName = 'lecture_assignments';
        break;
      case 'reports':
        dataToExport = filteredData.reports;
        fileName = 'reports';
        break;
      default:
        return;
    }

    if (dataToExport.length === 0) {
      alert('No data to export!');
      return;
    }

    // Create CSV content
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form handlers
  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/programs", programForm);
      alert("Program created successfully!");
      setShowProgramForm(false);
      setProgramForm({ program_code: "", program_name: "", faculty_id: "" });
      await fetchPrograms();
    } catch (error) {
      console.error("Error creating program:", error);
      alert(error.response?.data?.error || "Failed to create program");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/modules", moduleForm);
      alert("Module created successfully!");
      setShowModuleForm(false);
      setModuleForm({ module_name: "", program_id: "", faculty_id: "", total_registered_students: "" });
      await fetchModules();
    } catch (error) {
      console.error("Error creating module:", error);
      alert(error.response?.data?.error || "Failed to create module");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/lecture-assignments", assignmentForm);
      alert("Lecture assigned successfully!");
      setShowAssignmentForm(false);
      setAssignmentForm({ module_id: "", program_id: "", lecturer_id: "" });
      await fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert(error.response?.data?.error || "Failed to assign lecture");
    } finally {
      setLoading(false);
    }
  };

  // Reset forms when modals close
  const handleCloseProgramForm = () => {
    setShowProgramForm(false);
    setProgramForm({ program_code: "", program_name: "", faculty_id: "" });
  };

  const handleCloseModuleForm = () => {
    setShowModuleForm(false);
    setModuleForm({ module_name: "", program_id: "", faculty_id: "", total_registered_students: "" });
  };

  const handleCloseAssignmentForm = () => {
    setShowAssignmentForm(false);
    setAssignmentForm({ module_id: "", program_id: "", lecturer_id: "" });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditForm({});
  };

  // Handle faculty change for programs
  const handleFacultyChange = async (facultyId, formType) => {
    if (formType === 'program') {
      setProgramForm(prev => ({ ...prev, faculty_id: facultyId }));
    } else if (formType === 'module') {
      setModuleForm(prev => ({ ...prev, faculty_id: facultyId, program_id: "" }));
    } else if (formType === 'edit' && editingItem.type === 'program') {
      setEditForm(prev => ({ ...prev, faculty_id: facultyId }));
    }
  };

  // Filter modules by program for the assignments dropdown
  const getModulesByProgram = (programId) => {
    if (!programId) return modules;
    return modules.filter(module => module.program_id == programId);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'programs': return filteredData.programs;
      case 'modules': return filteredData.modules;
      case 'assignments': return filteredData.assignments;
      case 'reports': return filteredData.reports;
      default: return [];
    }
  };

  if (loading && programs.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Program Leader Dashboard</h1>
        <p>Manage programs, modules, assign lectures and monitor reports</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalPrograms}</h3>
            <p>Total Programs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-info">
            <h3>{stats.totalModules}</h3>
            <p>Total Modules</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalReports}</h3>
            <p>Total Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>{stats.totalAssignments}</h3>
            <p>Lecture Assignments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>{stats.totalLecturers}</h3>
            <p>Lecturers</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === "programs" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("programs")}
        >
          📚 Programs
        </button>
        <button 
          className={`tab-button ${activeTab === "modules" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          🏫 Modules
        </button>
        <button 
          className={`tab-button ${activeTab === "assignments" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          👨‍🏫 Assign Lectures
        </button>
        <button 
          className={`tab-button ${activeTab === "reports" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📊 Reports
        </button>
        <button 
          className={`tab-button ${activeTab === "monitoring" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("monitoring")}
        >
          📈 Monitoring
        </button>
      </div>

      {/* Search and Export Section */}
      <div className="search-export-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        {activeTab !== 'monitoring' && (
          <button 
            className="btn-export"
            onClick={exportToExcel}
            disabled={getCurrentData().length === 0}
          >
            📊 Export to Excel
          </button>
        )}
      </div>

      <div className="dashboard-content">
        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Program Management</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowProgramForm(true)}
                disabled={loading}
              >
                {loading ? "Loading..." : "+ Add Program"}
              </button>
            </div>

            <div className="table-container">
              {filteredData.programs.length === 0 ? (
                <div className="empty-state">
                  <p>{searchTerm ? 'No programs match your search.' : 'No programs found. Create your first program to get started.'}</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Program Code</th>
                      <th>Program Name</th>
                      <th>Faculty</th>
                      <th>Created By</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.programs.map(program => (
                      <tr key={program.id}>
                        <td><strong>{program.program_code}</strong></td>
                        <td>{program.program_name}</td>
                        <td>{program.faculty_name || "N/A"}</td>
                        <td>{program.created_by_name}</td>
                        <td>{new Date(program.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit"
                              onClick={() => handleEdit(program, 'program')}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDelete(program.id, 'program', program.program_name)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Module Management</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowModuleForm(true)}
                disabled={loading}
              >
                {loading ? "Loading..." : "+ Add Module"}
              </button>
            </div>

            <div className="table-container">
              {filteredData.modules.length === 0 ? (
                <div className="empty-state">
                  <p>{searchTerm ? 'No modules match your search.' : 'No modules found. Create your first module to get started.'}</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Module Name</th>
                      <th>Program</th>
                      <th>Faculty</th>
                      <th>Registered Students</th>
                      <th>Created By</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.modules.map(module => (
                      <tr key={module.id}>
                        <td><strong>{module.module_name}</strong></td>
                        <td>{module.program_name || "N/A"}</td>
                        <td>{module.faculty_name || "N/A"}</td>
                        <td>{module.total_registered_students}</td>
                        <td>{module.created_by_name}</td>
                        <td>{new Date(module.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit"
                              onClick={() => handleEdit(module, 'module')}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDelete(module.id, 'module', module.module_name)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Lecture Assignments</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowAssignmentForm(true)}
                disabled={loading}
              >
                {loading ? "Loading..." : "+ Assign Lecture"}
              </button>
            </div>

            <div className="table-container">
              {filteredData.assignments.length === 0 ? (
                <div className="empty-state">
                  <p>{searchTerm ? 'No assignments match your search.' : 'No lecture assignments found. Assign your first lecture to get started.'}</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Program</th>
                      <th>Lecturer</th>
                      <th>Assigned By</th>
                      <th>Date Assigned</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.assignments.map(assignment => (
                      <tr key={assignment.id}>
                        <td><strong>{assignment.module_name}</strong></td>
                        <td>
                          <div>
                            <strong>{assignment.program_code}</strong>
                            <div>{assignment.program_name}</div>
                          </div>
                        </td>
                        <td>{assignment.lecturer_name}</td>
                        <td>{assignment.assigned_by_name}</td>
                        <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit"
                              onClick={() => handleEdit(assignment, 'assignment')}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDelete(assignment.id, 'assignment', `${assignment.module_name} - ${assignment.lecturer_name}`)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>All Lecture Reports</h2>
              <div className="report-filters">
                <span>Total: {filteredData.reports.length} reports</span>
              </div>
            </div>

            {filteredData.reports.length === 0 ? (
              <div className="empty-state">
                <p>{searchTerm ? 'No reports match your search.' : 'No lecture reports found. Reports will appear here once submitted by lecturers.'}</p>
              </div>
            ) : (
              <div className="reports-grid">
                {filteredData.reports.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>{report.program_name} ({report.program_code})</h3>
                      <span className={`status-badge status-${report.status}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="report-details">
                      <p><strong>Lecturer:</strong> {report.lecturer_name}</p>
                      <p><strong>Module:</strong> {report.module_name}</p>
                      <p><strong>Faculty:</strong> {report.faculty_name}</p>
                      <p><strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}</p>
                      <p><strong>Week:</strong> {report.week_of_reporting}</p>
                      <p><strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}</p>
                      <p><strong>Venue:</strong> {report.venue}</p>
                      <p><strong>Time:</strong> {report.scheduled_time}</p>
                      {report.principal_feedback && (
                        <div className="feedback-section">
                          <strong>Principal Feedback:</strong>
                          <p>{report.principal_feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="report-topics">
                      <p><strong>Topic Taught:</strong> {report.topic_taught}</p>
                      <p><strong>Learning Outcomes:</strong> {report.learning_outcomes}</p>
                      <p><strong>Recommendations:</strong> {report.recommendations}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === "monitoring" && (
          <div className="tab-content">
            <h2>Monitoring Dashboard</h2>
            
            <div className="monitoring-grid">
              <div className="monitoring-card">
                <h3>Quick Overview</h3>
                <div className="overview-stats">
                  <div className="overview-item">
                    <span className="label">Programs Created:</span>
                    <span className="value">{stats.totalPrograms}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Modules Managed:</span>
                    <span className="value">{stats.totalModules}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Active Assignments:</span>
                    <span className="value">{stats.totalAssignments}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Total Students:</span>
                    <span className="value">{stats.totalStudents}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Report Completion:</span>
                    <span className="value">
                      {stats.totalReports > 0 
                        ? Math.round((stats.reviewedReports / stats.totalReports) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="monitoring-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {reports.slice(0, 5).map(report => (
                    <div key={report.id} className="activity-item">
                      <div className="activity-dot"></div>
                      <div className="activity-content">
                        <p><strong>{report.lecturer_name}</strong> submitted report for {report.program_name}</p>
                        <span className="activity-time">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && (
                    <p className="no-activity">No recent activity</p>
                  )}
                </div>
              </div>

              <div className="monitoring-card">
                <h3>Student Distribution</h3>
                <div className="student-distribution">
                  {modules.map(module => (
                    <div key={module.id} className="distribution-item">
                      <span className="module-name">{module.module_name}</span>
                      <span className="student-count">{module.total_registered_students} students</span>
                    </div>
                  ))}
                  {modules.length === 0 && (
                    <p className="no-data">No module data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Program Form Modal */}
      {showProgramForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Program</h2>
              <button className="close-button" onClick={handleCloseProgramForm}>×</button>
            </div>
            <form onSubmit={handleProgramSubmit}>
              <div className="form-group">
                <label>Program Code *</label>
                <input
                  type="text"
                  value={programForm.program_code}
                  onChange={(e) => setProgramForm({...programForm, program_code: e.target.value})}
                  required
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="form-group">
                <label>Program Name *</label>
                <input
                  type="text"
                  value={programForm.program_name}
                  onChange={(e) => setProgramForm({...programForm, program_name: e.target.value})}
                  required
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div className="form-group">
                <label>Faculty</label>
                <select
                  value={programForm.faculty_id}
                  onChange={(e) => handleFacultyChange(e.target.value, 'program')}
                >
                  <option value="">Select Faculty (Optional)</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseProgramForm} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Module</h2>
              <button className="close-button" onClick={handleCloseModuleForm}>×</button>
            </div>
            <form onSubmit={handleModuleSubmit}>
              <div className="form-group">
                <label>Module Name *</label>
                <input
                  type="text"
                  value={moduleForm.module_name}
                  onChange={(e) => setModuleForm({...moduleForm, module_name: e.target.value})}
                  required
                  placeholder="e.g., CS-2024-A"
                />
              </div>
              <div className="form-group">
                <label>Program *</label>
                <select
                  value={moduleForm.program_id}
                  onChange={(e) => setModuleForm({...moduleForm, program_id: e.target.value})}
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.program_code} - {program.program_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Total Registered Students *</label>
                <input
                  type="number"
                  value={moduleForm.total_registered_students}
                  onChange={(e) => setModuleForm({...moduleForm, total_registered_students: e.target.value})}
                  required
                  min="1"
                  placeholder="e.g., 30"
                />
              </div>
              <div className="form-group">
                <label>Faculty</label>
                <select
                  value={moduleForm.faculty_id}
                  onChange={(e) => handleFacultyChange(e.target.value, 'module')}
                >
                  <option value="">Select Faculty (Optional)</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseModuleForm} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Lecture to Module</h2>
              <button className="close-button" onClick={handleCloseAssignmentForm}>×</button>
            </div>
            <form onSubmit={handleAssignmentSubmit}>
              <div className="form-group">
                <label>Program *</label>
                <select
                  value={assignmentForm.program_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, program_id: e.target.value})}
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.program_code} - {program.program_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Module *</label>
                <select
                  value={assignmentForm.module_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, module_id: e.target.value})}
                  required
                  disabled={!assignmentForm.program_id}
                >
                  <option value="">Select Module</option>
                  {getModulesByProgram(assignmentForm.program_id).map(module => (
                    <option key={module.id} value={module.id}>{module.module_name}</option>
                  ))}
                </select>
                {!assignmentForm.program_id && (
                  <small>Select a program first to see available modules</small>
                )}
              </div>
              <div className="form-group">
                <label>Lecturer *</label>
                <select
                  value={assignmentForm.lecturer_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, lecturer_id: e.target.value})}
                  required
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} {lecturer.faculty_name && `(${lecturer.faculty_name})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseAssignmentForm} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Assigning..." : "Assign Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}</h2>
              <button className="close-button" onClick={handleCloseEditModal}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              {editingItem.type === 'program' && (
                <>
                  <div className="form-group">
                    <label>Program Code *</label>
                    <input
                      type="text"
                      value={editForm.program_code || ''}
                      onChange={(e) => setEditForm({...editForm, program_code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Program Name *</label>
                    <input
                      type="text"
                      value={editForm.program_name || ''}
                      onChange={(e) => setEditForm({...editForm, program_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Faculty</label>
                    <select
                      value={editForm.faculty_id || ''}
                      onChange={(e) => handleFacultyChange(e.target.value, 'edit')}
                    >
                      <option value="">Select Faculty (Optional)</option>
                      {faculties.map(faculty => (
                        <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {editingItem.type === 'module' && (
                <>
                  <div className="form-group">
                    <label>Module Name *</label>
                    <input
                      type="text"
                      value={editForm.module_name || ''}
                      onChange={(e) => setEditForm({...editForm, module_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Program *</label>
                    <select
                      value={editForm.program_id || ''}
                      onChange={(e) => setEditForm({...editForm, program_id: e.target.value})}
                      required
                    >
                      <option value="">Select Program</option>
                      {programs.map(program => (
                        <option key={program.id} value={program.id}>
                          {program.program_code} - {program.program_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Total Registered Students *</label>
                    <input
                      type="number"
                      value={editForm.total_registered_students || ''}
                      onChange={(e) => setEditForm({...editForm, total_registered_students: e.target.value})}
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Faculty</label>
                    <select
                      value={editForm.faculty_id || ''}
                      onChange={(e) => setEditForm({...editForm, faculty_id: e.target.value})}
                    >
                      <option value="">Select Faculty (Optional)</option>
                      {faculties.map(faculty => (
                        <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {editingItem.type === 'assignment' && (
                <>
                  <div className="form-group">
                    <label>Program *</label>
                    <select
                      value={editForm.program_id || ''}
                      onChange={(e) => setEditForm({...editForm, program_id: e.target.value})}
                      required
                    >
                      <option value="">Select Program</option>
                      {programs.map(program => (
                        <option key={program.id} value={program.id}>
                          {program.program_code} - {program.program_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Module *</label>
                    <select
                      value={editForm.module_id || ''}
                      onChange={(e) => setEditForm({...editForm, module_id: e.target.value})}
                      required
                      disabled={!editForm.program_id}
                    >
                      <option value="">Select Module</option>
                      {getModulesByProgram(editForm.program_id).map(module => (
                        <option key={module.id} value={module.id}>{module.module_name}</option>
                      ))}
                    </select>
                    {!editForm.program_id && (
                      <small>Select a program first to see available modules</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Lecturer *</label>
                    <select
                      value={editForm.lecturer_id || ''}
                      onChange={(e) => setEditForm({...editForm, lecturer_id: e.target.value})}
                      required
                    >
                      <option value="">Select Lecturer</option>
                      {lecturers.map(lecturer => (
                        <option key={lecturer.id} value={lecturer.id}>
                          {lecturer.name} {lecturer.faculty_name && `(${lecturer.faculty_name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseEditModal} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f5f6fa;
          padding: 20px;
        }

        .dashboard-header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 2rem;
        }

        .dashboard-header p {
          margin: 8px 0 0 0;
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1.8rem;
          color: #2c3e50;
        }

        .stat-info p {
          margin: 4px 0 0 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .dashboard-tabs {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 8px;
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          flex-wrap: wrap;
        }

        .tab-button {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 140px;
          font-size: 0.9rem;
        }

        .tab-button:hover {
          background: #f8f9fa;
        }

        .tab-active {
          background: #3498db;
          color: white;
        }

        .search-export-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-bar {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .btn-export {
          background: #27ae60;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.3s;
          white-space: nowrap;
        }

        .btn-export:hover:not(:disabled) {
          background: #219a52;
        }

        .btn-export:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .dashboard-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .section-header h2 {
          margin: 0;
          color: #2c3e50;
        }

        .btn-primary {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn-primary:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }

        .data-table th,
        .data-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-edit {
          background: #f39c12;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.3s;
        }

        .btn-edit:hover:not(:disabled) {
          background: #e67e22;
        }

        .btn-edit:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .btn-delete {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.3s;
        }

        .btn-delete:hover:not(:disabled) {
          background: #c0392b;
        }

        .btn-delete:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #7f8c8d;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .report-card {
          border: 1px solid #ecf0f1;
          border-radius: 8px;
          padding: 20px;
          background: #f8f9fa;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .report-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-reviewed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-submitted {
          background: #d4edda;
          color: #155724;
        }

        .report-details p {
          margin: 8px 0;
          color: #2c3e50;
        }

        .feedback-section {
          background: white;
          padding: 12px;
          border-radius: 4px;
          margin-top: 12px;
          border-left: 4px solid #3498db;
        }

        .report-topics {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #ddd;
        }

        .report-topics p {
          margin: 8px 0;
          color: #2c3e50;
        }

        .monitoring-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .monitoring-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ecf0f1;
        }

        .monitoring-card h3 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 8px;
        }

        .overview-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .overview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #ecf0f1;
        }

        .overview-item:last-child {
          border-bottom: none;
        }

        .label {
          color: #7f8c8d;
        }

        .value {
          font-weight: 600;
          color: #2c3e50;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          background: #3498db;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .activity-content p {
          margin: 0;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .activity-time {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .student-distribution {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .distribution-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #ecf0f1;
        }

        .distribution-item:last-child {
          border-bottom: none;
        }

        .module-name {
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .student-count {
          color: #7f8c8d;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .no-activity,
        .no-data {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
          margin: 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 0;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #ecf0f1;
        }

        .modal-header h2 {
          margin: 0;
          color: #2c3e50;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #7f8c8d;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #2c3e50;
        }

        form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e50;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .form-actions button {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.3s;
        }

        .form-actions button[type="button"] {
          background: #95a5a6;
          color: white;
        }

        .form-actions button[type="button"]:hover:not(:disabled) {
          background: #7f8c8d;
        }

        .form-actions button[type="submit"] {
          background: #3498db;
          color: white;
        }

        .form-actions button[type="submit"]:hover:not(:disabled) {
          background: #2980b9;
        }

        .form-actions button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .loading-spinner {
          text-align: center;
          padding: 60px 20px;
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 10px;
          }

          .stats-overview {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .search-export-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-bar {
            min-width: auto;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .reports-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .modal-content {
            margin: 10px;
            width: calc(100% - 20px);
          }
        }
      `}</style>
    </div>
  );
};

export default ProgramLeaderDashboard;