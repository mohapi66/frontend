"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import API from "../../api"

const LecturerDashboard = () => {
  const [reports, setReports] = useState([])
  const [assignments, setAssignments] = useState([])
  const [challenges, setChallenges] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("modules")
  const [formData, setFormData] = useState({
    faculty_id: "",
    module_id: "",
    program_id: "",
    week_of_reporting: "",
    date_of_lecture: "",
    student_name: "",
    student_number: "",
    actual_students_present: "",
    total_registered_students: "",
    venue: "",
    scheduled_time: "",
    topic_taught: "",
    learning_outcomes: "",
    recommendations: "",
  })
  const [challengeFormData, setChallengeFormData] = useState({
    module_id: "",
    program_id: "",
    faculty_id: "",
    challenge_type: "",
    description: "",
    impact: "",
    proposed_solution: "",
    status: "pending",
  })
  const [faculties, setFaculties] = useState([])
  const [programs, setPrograms] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetchAssignments()
    fetchReports()
    fetchFaculties()
    fetchChallenges()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await API.get("/lecture-assignments")
      const myAssignments = res.data.filter((assignment) => assignment.lecturer_id === user.id)
      setAssignments(myAssignments)

      if (myAssignments.length > 0) {
        const firstAssignment = myAssignments[0]
        setFormData((prev) => ({
          ...prev,
          faculty_id: firstAssignment.faculty_id || "",
          module_id: firstAssignment.module_id,
          program_id: firstAssignment.program_id,
        }))

        setChallengeFormData((prev) => ({
          ...prev,
          faculty_id: firstAssignment.faculty_id || "",
          module_id: firstAssignment.module_id,
          program_id: firstAssignment.program_id,
        }))

        if (firstAssignment.faculty_id) {
          fetchProgramsByFaculty(firstAssignment.faculty_id)
        }
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    }
  }

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports")
      const myReports = res.data.filter((report) => report.lecturer_id === user.id)
      setReports(myReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const fetchChallenges = async () => {
    try {
      const res = await API.get("/challenges")
      const myChallenges = res.data.filter((challenge) => challenge.lecturer_id === user.id)
      setChallenges(myChallenges)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const fetchFaculties = async () => {
    try {
      const res = await API.get("/faculties")
      setFaculties(res.data)
    } catch (error) {
      console.error("Error fetching faculties:", error)
    }
  }

  const fetchProgramsByFaculty = async (facultyId) => {
    try {
      const res = await API.get(`/programs/${facultyId}`)
      setPrograms(res.data)
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  const getMyModules = () => {
    const uniqueModules = []
    const seen = new Set()

    assignments.forEach((assignment) => {
      if (!seen.has(assignment.module_id)) {
        seen.add(assignment.module_id)
        uniqueModules.push({
          id: assignment.module_id,
          name: assignment.module_name,
          program_id: assignment.program_id,
          program_name: assignment.program_name,
          program_code: assignment.program_code,
        })
      }
    })

    return uniqueModules
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post("/reports", {
        ...formData,
        lecturer_id: user.id,
      })
      alert("Report submitted successfully!")
      setShowForm(false)
      setFormData({
        faculty_id: "",
        module_id: "",
        program_id: "",
        week_of_reporting: "",
        date_of_lecture: "",
        student_name: "",
        student_number: "",
        actual_students_present: "",
        total_registered_students: "",
        venue: "",
        scheduled_time: "",
        topic_taught: "",
        learning_outcomes: "",
        recommendations: "",
      })
      fetchReports()
    } catch (error) {
      console.error("Error submitting report:", error)
      alert(error.response?.data?.error || "Failed to submit report")
    }
  }

  const handleChallengeSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post("/challenges", {
        ...challengeFormData,
        lecturer_id: user.id,
        submitted_date: new Date().toISOString().split("T")[0],
      })
      alert("Challenge submitted successfully!")
      setShowChallengeForm(false)
      setChallengeFormData({
        module_id: "",
        program_id: "",
        faculty_id: "",
        challenge_type: "",
        description: "",
        impact: "",
        proposed_solution: "",
        status: "pending",
      })
      fetchChallenges()
    } catch (error) {
      console.error("Error submitting challenge:", error)
      alert(error.response?.data?.error || "Failed to submit challenge")
    }
  }

  const handleModuleChange = (moduleId) => {
    const selectedModule = getMyModules().find((module) => module.id == moduleId)
    if (selectedModule) {
      const assignment = assignments.find((a) => a.module_id == moduleId)
      setFormData((prev) => ({
        ...prev,
        module_id: moduleId,
        program_id: selectedModule.program_id,
        faculty_id: assignment.faculty_id || "",
      }))
    }
  }

  const handleChallengeModuleChange = (moduleId) => {
    const selectedModule = getMyModules().find((module) => module.id == moduleId)
    if (selectedModule) {
      const assignment = assignments.find((a) => a.module_id == moduleId)
      setChallengeFormData((prev) => ({
        ...prev,
        module_id: moduleId,
        program_id: selectedModule.program_id,
        faculty_id: assignment.faculty_id || "",
      }))
    }
  }

  // Search functionality
  const filteredReports = reports.filter(report =>
    report.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topic_taught?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.week_of_reporting?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredChallenges = challenges.filter(challenge =>
    challenge.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.challenge_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Export to Excel functionality
  const exportToExcel = (data, filename) => {
    // Convert data to CSV format
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n')
    
    const csv = `${headers}\n${rows}`
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const myModules = getMyModules()

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <p>Welcome, {user?.name}. Manage your assigned modules and submit lecture reports</p>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search reports, challenges, modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              <span>🔍</span>
            </button>
          </div>
        </div>

        {assignments.length > 0 ? (
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + New Report
            </button>
            <button className="btn-secondary" onClick={() => setShowChallengeForm(true)}>
              + Report Challenge
            </button>
          </div>
        ) : (
          <div className="info-message">
            <p>No modules assigned to you yet. Please contact your program leader.</p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          My Modules
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges ({challenges.length})
        </button>
      </div>

      <div className="dashboard-content">
        {/* My Assigned Modules Section */}
        {activeTab === 'modules' && (
          <div className="assignments-section">
            <div className="section-header">
              <h2>My Assigned Modules</h2>
              <button 
                className="btn-export"
                onClick={() => exportToExcel(assignments, 'my_modules')}
                disabled={assignments.length === 0}
              >
                Export to Excel
              </button>
            </div>
            {assignments.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any modules assigned yet. Please contact your program leader.</p>
              </div>
            ) : (
              <div className="assignments-grid">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-header">
                      <h3>{assignment.module_name}</h3>
                      <span className="program-badge">{assignment.program_code}</span>
                    </div>
                    <div className="assignment-details">
                      <p>
                        <strong>Program:</strong> {assignment.program_name}
                      </p>
                      <p>
                        <strong>Assigned By:</strong> {assignment.assigned_by_name}
                      </p>
                      <p>
                        <strong>Date Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Reports Section */}
        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="section-header">
              <h2>My Lecture Reports</h2>
              <button 
                className="btn-export"
                onClick={() => exportToExcel(reports, 'lecture_reports')}
                disabled={reports.length === 0}
              >
                Export to Excel
              </button>
            </div>
            {reports.length === 0 ? (
              <div className="empty-state">
                <p>No reports submitted yet. Click "New Report" to get started.</p>
              </div>
            ) : (
              <div className="reports-grid">
                {filteredReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>
                        {report.module_name} - {report.program_name}
                      </h3>
                      <span className={`status-badge status-${report.status}`}>{report.status}</span>
                    </div>
                    <div className="report-details">
                      <p>
                        <strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Week:</strong> {report.week_of_reporting}
                      </p>
                      {report.student_name && (
                        <p>
                          <strong>Student Name:</strong> {report.student_name}
                        </p>
                      )}
                      {report.student_number && (
                        <p>
                          <strong>Student Number:</strong> {report.student_number}
                        </p>
                      )}
                      <p>
                        <strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}
                      </p>
                      <p>
                        <strong>Venue:</strong> {report.venue}
                      </p>
                      <p>
                        <strong>Time:</strong> {report.scheduled_time}
                      </p>
                      <p>
                        <strong>Topic:</strong> {report.topic_taught}
                      </p>
                      {report.principal_feedback && (
                        <div className="feedback-section">
                          <h4>Principal Feedback:</h4>
                          <p>{report.principal_feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="report-content">
                      <p>
                        <strong>Learning Outcomes:</strong> {report.learning_outcomes}
                      </p>
                      <p>
                        <strong>Recommendations:</strong> {report.recommendations}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Challenges Section */}
        {activeTab === 'challenges' && (
          <div className="challenges-section">
            <div className="section-header">
              <h2>Teaching Challenges</h2>
              <div className="section-actions">
                {assignments.length > 0 && (
                  <button className="btn-secondary" onClick={() => setShowChallengeForm(true)}>
                    + Report New Challenge
                  </button>
                )}
                <button 
                  className="btn-export"
                  onClick={() => exportToExcel(challenges, 'teaching_challenges')}
                  disabled={challenges.length === 0}
                >
                  Export to Excel
                </button>
              </div>
            </div>
            {challenges.length === 0 ? (
              <div className="empty-state">
                <p>No challenges reported yet. Click "Report Challenge" to document any teaching challenges.</p>
              </div>
            ) : (
              <div className="challenges-grid">
                {filteredChallenges.map((challenge) => (
                  <div key={challenge.id} className="challenge-card">
                    <div className="challenge-header">
                      <h3>
                        {challenge.module_name} - {challenge.challenge_type}
                      </h3>
                      <div className="challenge-meta">
                        <span className={`status-badge status-${challenge.status}`}>{challenge.status}</span>
                        <span className="date-badge">{new Date(challenge.submitted_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="challenge-details">
                      <p>
                        <strong>Program:</strong> {challenge.program_name}
                      </p>
                      <p>
                        <strong>Type:</strong>
                        <span className={`type-badge type-${challenge.challenge_type}`}>{challenge.challenge_type}</span>
                      </p>
                    </div>
                    <div className="challenge-content">
                      <div className="content-section">
                        <h4>Description:</h4>
                        <p>{challenge.description}</p>
                      </div>
                      <div className="content-section">
                        <h4>Impact:</h4>
                        <p>{challenge.impact}</p>
                      </div>
                      {challenge.proposed_solution && (
                        <div className="content-section">
                          <h4>Proposed Solution:</h4>
                          <p>{challenge.proposed_solution}</p>
                        </div>
                      )}
                      {challenge.admin_feedback && (
                        <div className="feedback-section">
                          <h4>Admin Feedback:</h4>
                          <p>{challenge.admin_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Submit Lecture Report</h2>
              <form onSubmit={handleSubmit}>
                {/* Form content remains the same */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Module *</label>
                    <select value={formData.module_id} onChange={(e) => handleModuleChange(e.target.value)} required>
                      <option value="">Select Module</option>
                      {myModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name} ({module.program_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Program</label>
                    <input
                      type="text"
                      value={programs.find((p) => p.id == formData.program_id)?.program_name || ""}
                      disabled
                      placeholder="Auto-filled from module selection"
                    />
                  </div>
                </div>

                {/* Rest of form fields remain the same */}
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Challenge Form Modal */}
        {showChallengeForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Report Teaching Challenge</h2>
              <form onSubmit={handleChallengeSubmit}>
                {/* Challenge form content remains the same */}
                <div className="form-actions">
                  <button type="button" onClick={() => setShowChallengeForm(false)}>
                    Cancel
                  </button>
                  <button type="submit">Submit Challenge</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h1 {
          margin: 0 0 10px 0;
          font-size: 2rem;
        }

        .dashboard-header p {
          margin: 0 0 20px 0;
          opacity: 0.9;
        }

        .search-section {
          margin: 20px 0;
        }

        .search-bar {
          display: flex;
          max-width: 500px;
          background: white;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .search-input {
          flex: 1;
          padding: 12px 20px;
          border: none;
          outline: none;
          font-size: 16px;
        }

        .search-btn {
          padding: 12px 20px;
          background: #667eea;
          border: none;
          color: white;
          cursor: pointer;
          transition: background 0.3s;
        }

        .search-btn:hover {
          background: #5a6fd8;
        }

        .header-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary, .btn-export {
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .btn-primary {
          background: #ff6b6b;
          color: white;
        }

        .btn-primary:hover {
          background: #ff5252;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: #667eea;
        }

        .btn-export {
          background: #28a745;
          color: white;
        }

        .btn-export:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-2px);
        }

        .btn-export:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .dashboard-tabs {
          display: flex;
          background: white;
          border-radius: 10px;
          padding: 5px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 15px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .tab-btn.active {
          background: #667eea;
          color: white;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .tab-btn:hover:not(.active) {
          background: #f8f9fa;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .section-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .section-header h2 {
          color: #333;
          margin: 0;
        }

        .assignments-grid, .reports-grid, .challenges-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }

        .assignment-card, .report-card, .challenge-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #667eea;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .assignment-card:hover, .report-card:hover, .challenge-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .assignment-header, .report-header, .challenge-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .assignment-header h3, .report-header h3, .challenge-header h3 {
          margin: 0;
          color: #333;
          flex: 1;
        }

        .program-badge, .status-badge, .date-badge, .type-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 10px;
        }

        .program-badge {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-badge {
          color: white;
        }

        .status-pending {
          background: #ffa726;
        }

        .status-approved {
          background: #66bb6a;
        }

        .status-rejected {
          background: #ef5350;
        }

        .date-badge {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .type-badge {
          background: #fff3e0;
          color: #f57c00;
          margin-left: 8px;
        }

        .assignment-details p, .report-details p, .challenge-details p {
          margin: 8px 0;
          color: #666;
          line-height: 1.4;
        }

        .feedback-section, .content-section {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }

        .feedback-section h4, .content-section h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .report-content p {
          margin: 10px 0;
          color: #555;
          line-height: 1.5;
        }

        .challenge-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          padding: 30px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-content h2 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }

        .form-group input, .form-group select, .form-group textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .form-actions button {
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .form-actions button[type="button"] {
          background: #6c757d;
          color: white;
        }

        .form-actions button[type="submit"] {
          background: #667eea;
          color: white;
        }

        .form-actions button:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .empty-state, .info-message {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 10px;
          color: #666;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 10px;
          }
          
          .dashboard-header {
            padding: 20px;
          }
          
          .header-actions {
            flex-direction: column;
          }
          
          .dashboard-tabs {
            flex-direction: column;
          }
          
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .section-actions {
            justify-content: stretch;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .assignments-grid, .reports-grid, .challenges-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default LecturerDashboard