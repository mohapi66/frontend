"use client"

// Updated StudentDashboard.js with timetable, search and export functionality
import { useState, useEffect } from "react"
import API from "../../api"

const StudentDashboard = () => {
  const [reports, setReports] = useState([])
  const [modules, setModules] = useState([])
  const [challenges, setChallenges] = useState([])
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("modules")
  const [error, setError] = useState("")
  const [studentInfo, setStudentInfo] = useState({})
  const [hasProgram, setHasProgram] = useState(true)
  const [signingReport, setSigningReport] = useState(null)
  const [attendanceSignature, setAttendanceSignature] = useState({
    student_name: "",
    student_number: "",
  })
  const [newChallenge, setNewChallenge] = useState({
    module_id: "",
    title: "",
    description: "",
    priority: "medium",
  })
  
  // New state for search and export
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState({
    modules: [],
    reports: [],
    challenges: [],
    timetable: []
  })

  // Timetable view state
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState("week") // 'week' or 'day'

  useEffect(() => {
    fetchStudentData()
    fetchDebugInfo()
  }, [])

  // Update filtered data when data or search term changes
  useEffect(() => {
    filterData()
  }, [searchTerm, modules, reports, challenges, timetable])

  const filterData = () => {
    const lowercasedSearch = searchTerm.toLowerCase()
    
    const filteredModules = modules.filter(module => 
      module.module_name.toLowerCase().includes(lowercasedSearch) ||
      module.program_code.toLowerCase().includes(lowercasedSearch) ||
      module.program_name.toLowerCase().includes(lowercasedSearch)
    )
    
    const filteredReports = reports.filter(report =>
      (report.course_name || report.module_name || "").toLowerCase().includes(lowercasedSearch) ||
      (report.course_code || report.program_code || "").toLowerCase().includes(lowercasedSearch) ||
      report.lecturer_name.toLowerCase().includes(lowercasedSearch) ||
      report.topic_taught.toLowerCase().includes(lowercasedSearch)
    )
    
    const filteredChallenges = challenges.filter(challenge =>
      challenge.title.toLowerCase().includes(lowercasedSearch) ||
      challenge.description.toLowerCase().includes(lowercasedSearch) ||
      challenge.module_name.toLowerCase().includes(lowercasedSearch)
    )

    const filteredTimetable = timetable.filter(session =>
      session.module_name.toLowerCase().includes(lowercasedSearch) ||
      session.lecturer_name.toLowerCase().includes(lowercasedSearch) ||
      session.venue.toLowerCase().includes(lowercasedSearch)
    )
    
    setFilteredData({
      modules: filteredModules,
      reports: filteredReports,
      challenges: filteredChallenges,
      timetable: filteredTimetable
    })
  }

  const exportToExcel = (data, filename) => {
    // Convert data to CSV format
    const headers = Object.keys(data[0] || {}).join(',')
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    )
    const csvContent = [headers, ...rows].join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchDebugInfo = async () => {
    try {
      const res = await API.get("/debug/student-info")
      console.log("🔍 Debug info:", res.data)
      setStudentInfo(res.data)
    } catch (error) {
      console.error("Debug info error:", error)
    }
  }

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError("")
      await Promise.all([
        fetchReports(), 
        fetchStudentModules(), 
        fetchChallenges(),
        fetchTimetable()
      ])
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchTimetable = async () => {
    try {
      const res = await API.get("/student/timetable")
      setTimetable(res.data)
    } catch (error) {
      console.error("Error fetching timetable:", error)
      // If endpoint doesn't exist, create mock data for demonstration
      setTimetable(generateMockTimetable())
    }
  }

  // Generate mock timetable data for demonstration
  const generateMockTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const times = [
      '08:00 - 10:00',
      '10:30 - 12:30', 
      '13:30 - 15:30',
      '16:00 - 18:00'
    ]
    
    const mockSessions = []
    const moduleNames = [
      'Software Engineering',
      'Database Systems', 
      'Web Development',
      'Data Structures',
      'Computer Networks'
    ]

    days.forEach(day => {
      times.forEach(time => {
        if (Math.random() > 0.6) { // 40% chance of having a class
          mockSessions.push({
            id: `${day}-${time}`,
            day,
            time,
            module_name: moduleNames[Math.floor(Math.random() * moduleNames.length)],
            lecturer_name: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`,
            venue: `Room ${Math.floor(Math.random() * 500) + 100}`,
            type: ['Lecture', 'Tutorial', 'Lab'][Math.floor(Math.random() * 3)]
          })
        }
      })
    })

    return mockSessions
  }

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports")
      setReports(res.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const fetchStudentModules = async () => {
    try {
      console.log("Fetching student modules...")
      const res = await API.get("/student/modules")
      console.log("Student modules response:", res.data)

      if (res.data.modules) {
        setModules(res.data.modules)
        setHasProgram(res.data.hasProgram)

        if (!res.data.hasProgram) {
          setError(res.data.message)
        }
      } else {
        // Handle old response format
        setModules(res.data)
        setHasProgram(res.data.length > 0)
      }
    } catch (error) {
      console.error("Error fetching student modules:", error)
      if (error.response?.status === 400) {
        setError("You are not enrolled in any program. Please contact your program leader.")
        setHasProgram(false)
      } else {
        setError("Failed to load modules. Please try again later.")
      }
    }
  }

  const fetchChallenges = async () => {
    try {
      const res = await API.get("/student/challenges")
      setChallenges(res.data)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const submitModuleRating = async (moduleId, rating, comments = "") => {
    try {
      await API.post("/module-ratings", {
        module_id: moduleId,
        rating,
        comments,
      })
      alert("Module rating submitted successfully!")
      fetchStudentModules()
    } catch (error) {
      console.error("Error submitting module rating:", error)
      alert("Failed to submit module rating")
    }
  }

  const submitChallenge = async (e) => {
    e.preventDefault()
    try {
      await API.post("/student/challenges", newChallenge)
      alert("Challenge submitted successfully!")
      setNewChallenge({
        module_id: "",
        title: "",
        description: "",
        priority: "medium",
      })
      fetchChallenges()
    } catch (error) {
      console.error("Error submitting challenge:", error)
      alert("Failed to submit challenge")
    }
  }

  const updateChallengeStatus = async (challengeId, status) => {
    try {
      await API.put(`/student/challenges/${challengeId}`, { status })
      fetchChallenges()
    } catch (error) {
      console.error("Error updating challenge:", error)
      alert("Failed to update challenge status")
    }
  }

  const signAttendance = async (reportId) => {
    try {
      if (!attendanceSignature.student_name || !attendanceSignature.student_number) {
        alert("Please enter both your name and student number")
        return
      }

      await API.put(`/reports/${reportId}/sign-attendance`, {
        student_name: attendanceSignature.student_name,
        student_number: attendanceSignature.student_number,
      })

      alert("Attendance signed successfully!")
      setSigningReport(null)
      setAttendanceSignature({ student_name: "", student_number: "" })
      fetchReports()
    } catch (error) {
      console.error("Error signing attendance:", error)
      alert("Failed to sign attendance")
    }
  }

  // Timetable navigation functions
  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  // Get days for the current week
  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1) // Start from Monday
    
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  // Filter timetable sessions for a specific day
  const getSessionsForDay = (dayName) => {
    return (searchTerm ? filteredData.timetable : timetable).filter(session => 
      session.day.toLowerCase() === dayName.toLowerCase()
    ).sort((a, b) => {
      // Sort by time
      const timeA = a.time.split(' - ')[0]
      const timeB = b.time.split(' - ')[0]
      return timeA.localeCompare(timeB)
    })
  }

  if (loading) return <div style={styles.dashboardLoading}>Loading your dashboard...</div>

  const currentData = {
    modules: searchTerm ? filteredData.modules : modules,
    reports: searchTerm ? filteredData.reports : reports,
    challenges: searchTerm ? filteredData.challenges : challenges,
    timetable: searchTerm ? filteredData.timetable : timetable
  }

  const weekDays = getWeekDays()
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.dashboardHeader}>
        <h1 style={styles.headerTitle}>Student Dashboard</h1>
        <p style={styles.headerSubtitle}>View your modules, timetable, monitor lecture reports, submit challenges and provide ratings</p>
      </div>

      {/* Debug info - remove this section after testing */}
      {process.env.NODE_ENV === "development" && studentInfo.user && (
        <div style={styles.debugInfo}>
          <strong>Debug Info:</strong> User ID: {studentInfo.user.id}, Role: {studentInfo.user.role}, Program ID:{" "}
          {studentInfo.database_user?.program_id || "None"}, Program:{" "}
          {studentInfo.database_user?.program_name || "Not assigned"}
        </div>
      )}

      {error && (
        <div style={styles.errorBanner}>
          <div style={styles.errorContent}>
            <span>⚠️</span>
            <div style={styles.errorText}>
              <strong>Notice:</strong> {error}
              <button onClick={fetchStudentData} style={styles.retryBtn}>
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Export Bar */}
      <div style={styles.searchExportBar}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")} 
              style={styles.clearSearchBtn}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        <div style={styles.exportContainer}>
          {activeTab === "timetable" && (
            <div style={styles.timetableControls}>
              <button onClick={() => navigateWeek(-1)} style={styles.navBtn}>← Previous</button>
              <button onClick={goToToday} style={styles.todayBtn}>Today</button>
              <button onClick={() => navigateWeek(1)} style={styles.navBtn}>Next →</button>
            </div>
          )}
          <button 
            onClick={() => exportToExcel(currentData[activeTab], `student_${activeTab}`)}
            style={styles.exportBtn}
            disabled={currentData[activeTab].length === 0}
          >
            📊 Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} as Excel
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div style={styles.dashboardTabs}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "modules" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("modules")}
        >
          📚 My Modules
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "timetable" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("timetable")}
        >
          🗓️ Timetable
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "reports" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("reports")}
        >
          📊 Lecture Reports
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "challenges" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("challenges")}
        >
          🎯 My Challenges
        </button>
      </div>

      <div style={styles.dashboardContent}>
        {/* My Modules Tab */}
        {activeTab === "modules" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2>My Enrolled Modules</h2>
              <p style={styles.sectionSubtitle}>
                {hasProgram
                  ? `These are the modules under your program ${searchTerm ? `(Filtered: ${currentData.modules.length} found)` : `(${currentData.modules.length} total)`}`
                  : "You need to be enrolled in a program to see modules"}
              </p>
            </div>

            {!hasProgram ? (
              <div style={styles.emptyState}>
                <div style={styles.noProgramMessage}>
                  <h3>📝 Program Enrollment Required</h3>
                  <p>You are not currently enrolled in any academic program.</p>
                  <p>Please contact your program leader or administrator to:</p>
                  <ul>
                    <li>Assign you to a program</li>
                    <li>Enroll you in the appropriate modules</li>
                  </ul>
                </div>
              </div>
            ) : currentData.modules.length === 0 ? (
              <div style={styles.emptyState}>
                <p>{searchTerm ? "No modules match your search criteria." : "No modules found for your program. Please contact your program leader."}</p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    style={styles.clearFilterBtn}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.modulesGrid}>
                {currentData.modules.map((module) => (
                  <div key={module.id} style={styles.moduleCard}>
                    <div style={styles.moduleHeader}>
                      <h3>{module.module_name}</h3>
                      <span style={styles.moduleCode}>{module.program_code}</span>
                    </div>

                    <div style={styles.moduleDetails}>
                      <p>
                        <strong>Program:</strong> {module.program_name}
                      </p>
                      <p>
                        <strong>Faculty:</strong> {module.faculty_name}
                      </p>
                      <p>
                        <strong>Total Students:</strong> {module.total_registered_students}
                      </p>
                      {module.created_at && (
                        <p>
                          <strong>Created:</strong> {new Date(module.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div style={styles.moduleRatingSection}>
                      <h4>Rate this Module:</h4>
                      <div style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            style={styles.starBtn}
                            onClick={() => submitModuleRating(module.id, star)}
                            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      <small>Click a star to rate this module</small>
                    </div>

                    <div style={styles.moduleActions}>
                      <button style={styles.btnOutline} onClick={() => setActiveTab("reports")}>
                        View Reports
                      </button>
                      <button style={styles.btnPrimary} onClick={() => setActiveTab("challenges")}>
                        Report Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timetable Tab */}
        {activeTab === "timetable" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2>My Weekly Timetable</h2>
              <p style={styles.sectionSubtitle}>
                Week of {weekDays[0].toLocaleDateString()} - {weekDays[4].toLocaleDateString()}
                {searchTerm && ` (Filtered: ${currentData.timetable.length} sessions found)`}
              </p>
            </div>

            {currentData.timetable.length === 0 ? (
              <div style={styles.emptyState}>
                <p>
                  {searchTerm 
                    ? "No timetable sessions match your search criteria." 
                    : "No timetable sessions found for this week."
                  }
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    style={styles.clearFilterBtn}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.timetableContainer}>
                <div style={styles.timetableGrid}>
                  {/* Time slots header */}
                  <div style={styles.timetableHeader}>
                    <div style={styles.timeSlotHeader}>Time</div>
                    {dayNames.map((day, index) => (
                      <div key={day} style={styles.dayHeader}>
                        <div style={styles.dayName}>{day}</div>
                        <div style={styles.date}>{weekDays[index].getDate()}/{weekDays[index].getMonth() + 1}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {['08:00 - 10:00', '10:30 - 12:30', '13:30 - 15:30', '16:00 - 18:00'].map(timeSlot => (
                    <div key={timeSlot} style={styles.timeRow}>
                      <div style={styles.timeSlot}>{timeSlot}</div>
                      {dayNames.map(day => {
                        const session = getSessionsForDay(day).find(s => s.time === timeSlot)
                        return (
                          <div key={`${day}-${timeSlot}`} style={styles.timetableCell}>
                            {session && (
                              <div style={{
                                ...styles.sessionCard,
                                ...styles[`type${session.type}`]
                              }}>
                                <div style={styles.sessionTitle}>{session.module_name}</div>
                                <div style={styles.sessionDetails}>
                                  <div>{session.type}</div>
                                  <div>{session.lecturer_name}</div>
                                  <div>{session.venue}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lecture Reports Tab */}
        {activeTab === "reports" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2>Lecture Reports</h2>
              <p style={styles.sectionSubtitle}>
                Monitor lecture reports and provide ratings {searchTerm && `(Filtered: ${currentData.reports.length} found)`}
              </p>
            </div>

            {currentData.reports.length === 0 ? (
              <div style={styles.emptyState}>
                <p>
                  {searchTerm 
                    ? "No lecture reports match your search criteria." 
                    : "No lecture reports found. Reports will appear here once submitted by lecturers."
                  }
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    style={styles.clearFilterBtn}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.reportsGrid}>
                {currentData.reports.map((report) => (
                  <div key={report.id} style={styles.reportCard}>
                    <div style={styles.reportHeader}>
                      <h3>
                        {report.course_name || report.module_name} ({report.course_code || report.program_code})
                      </h3>
                      <span style={{
                        ...styles.statusBadge,
                        ...styles[`status${report.status.charAt(0).toUpperCase() + report.status.slice(1)}`]
                      }}>
                        {report.status}
                      </span>
                    </div>

                    <div style={styles.reportDetails}>
                      <p>
                        <strong>Lecturer:</strong> {report.lecturer_name}
                      </p>
                      <p>
                        <strong>Module:</strong> {report.module_name}
                      </p>
                      <p>
                        <strong>Program:</strong> {report.program_name}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}
                      </p>
                      <p>
                        <strong>Topic:</strong> {report.topic_taught}
                      </p>
                      <p>
                        <strong>Venue:</strong> {report.venue}
                      </p>
                      <p>
                        <strong>Week:</strong> {report.week_of_reporting}
                      </p>
                    </div>

                    {report.learning_outcomes && (
                      <div style={styles.learningOutcomes}>
                        <strong>Learning Outcomes:</strong>
                        <p>{report.learning_outcomes}</p>
                      </div>
                    )}

                    {report.recommendations && (
                      <div style={styles.recommendations}>
                        <strong>Recommendations:</strong>
                        <p>{report.recommendations}</p>
                      </div>
                    )}

                    <div style={styles.reportActions}>
                      {report.student_name && report.student_number ? (
                        <div style={styles.attendanceSigned}>
                          <span style={styles.signedBadge}>✓ Attendance Signed</span>
                          <p>
                            <small>
                              Signed by: {report.student_name} ({report.student_number})
                            </small>
                          </p>
                        </div>
                      ) : (
                        <button style={styles.btnPrimary} onClick={() => setSigningReport(report)}>
                          Sign Attendance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div style={styles.tabContent}>
            <div style={styles.challengesSection}>
              <div style={styles.sectionHeader}>
                <h2>My Learning Challenges</h2>
                <p style={styles.sectionSubtitle}>
                  Report challenges you're facing in your modules and track their status {searchTerm && `(Filtered: ${currentData.challenges.length} found)`}
                </p>
              </div>

              {/* Submit Challenge Form */}
              <div style={styles.challengeFormSection}>
                <h3>Report New Challenge</h3>
                <form onSubmit={submitChallenge} style={styles.challengeForm}>
                  <div style={styles.formGroup}>
                    <label htmlFor="module">Module:</label>
                    <select
                      id="module"
                      value={newChallenge.module_id}
                      onChange={(e) => setNewChallenge({ ...newChallenge, module_id: e.target.value })}
                      required
                      style={styles.formControl}
                    >
                      <option value="">Select a module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.module_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="title">Challenge Title:</label>
                    <input
                      type="text"
                      id="title"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      placeholder="Brief title of your challenge"
                      required
                      style={styles.formControl}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      placeholder="Describe the challenge you're facing in detail..."
                      rows="4"
                      required
                      style={styles.formControl}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="priority">Priority:</label>
                    <select
                      id="priority"
                      value={newChallenge.priority}
                      onChange={(e) => setNewChallenge({ ...newChallenge, priority: e.target.value })}
                      style={styles.formControl}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <button type="submit" style={styles.btnPrimary}>
                    Submit Challenge
                  </button>
                </form>
              </div>

              {/* Challenges List */}
              <div style={styles.challengesList}>
                <h3>My Submitted Challenges</h3>
                {currentData.challenges.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p>
                      {searchTerm 
                        ? "No challenges match your search criteria." 
                        : "No challenges submitted yet. Use the form above to report your first challenge."
                      }
                    </p>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm("")}
                        style={styles.clearFilterBtn}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={styles.challengesGrid}>
                    {currentData.challenges.map((challenge) => (
                      <div key={challenge.id} style={{
                        ...styles.challengeCard,
                        ...styles[`priority${challenge.priority.charAt(0).toUpperCase() + challenge.priority.slice(1)}`]
                      }}>
                        <div style={styles.challengeHeader}>
                          <h4>{challenge.title}</h4>
                          <span style={{
                            ...styles.priorityBadge,
                            ...styles[`priority${challenge.priority.charAt(0).toUpperCase() + challenge.priority.slice(1)}`]
                          }}>
                            {challenge.priority}
                          </span>
                        </div>

                        <div style={styles.challengeDetails}>
                          <p>
                            <strong>Module:</strong> {challenge.module_name}
                          </p>
                          <p>
                            <strong>Description:</strong> {challenge.description}
                          </p>
                          <p>
                            <strong>Submitted:</strong> {new Date(challenge.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div style={styles.challengeStatus}>
                          <span style={{
                            ...styles.statusBadge,
                            ...styles[`status${challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}`]
                          }}>
                            {challenge.status}
                          </span>
                          {challenge.status === "pending" && (
                            <button
                              style={styles.btnOutlineSmall}
                              onClick={() => updateChallengeStatus(challenge.id, "resolved")}
                            >
                              Mark as Resolved
                            </button>
                          )}
                        </div>

                        {challenge.feedback && (
                          <div style={styles.challengeFeedback}>
                            <strong>Instructor Feedback:</strong>
                            <p>{challenge.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {signingReport && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Sign Attendance</h2>
            <p>
              Confirm your attendance for: <strong>{signingReport.module_name}</strong>
            </p>
            <p>Date: {new Date(signingReport.date_of_lecture).toLocaleDateString()}</p>

            <div style={styles.formGroup}>
              <label>Your Full Name *</label>
              <input
                type="text"
                value={attendanceSignature.student_name}
                onChange={(e) =>
                  setAttendanceSignature({
                    ...attendanceSignature,
                    student_name: e.target.value,
                  })
                }
                placeholder="Enter your full name"
                required
                style={styles.formControl}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Student Number *</label>
              <input
                type="text"
                value={attendanceSignature.student_number}
                onChange={(e) =>
                  setAttendanceSignature({
                    ...attendanceSignature,
                    student_number: e.target.value,
                  })
                }
                placeholder="Enter your student number"
                required
                style={styles.formControl}
              />
            </div>

            <div style={styles.formActions}>
              <button
                style={styles.btnCancel}
                onClick={() => {
                  setSigningReport(null)
                  setAttendanceSignature({ student_name: "", student_number: "" })
                }}
              >
                Cancel
              </button>
              <button style={styles.btnPrimary} onClick={() => signAttendance(signingReport.id)}>
                Confirm Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Updated styles with timetable additions
const styles = {
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  dashboardHeader: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  headerTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px'
  },
  headerSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto'
  },
  debugInfo: {
    background: '#f3f4f6',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '4px solid #6366f1'
  },
  errorBanner: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    color: '#dc2626'
  },
  errorContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  errorText: {
    flex: 1
  },
  retryBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    marginLeft: '12px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  searchExportBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap'
  },
  searchContainer: {
    position: 'relative',
    flex: '1',
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    paddingRight: '40px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: 'white'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b'
  },
  exportContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0
  },
  timetableControls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  navBtn: {
    background: 'white',
    border: '2px solid #e2e8f0',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  todayBtn: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  exportBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dashboardTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    background: 'white',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  tabButton: {
    flex: 1,
    padding: '16px 24px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#64748b'
  },
  tabActive: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  },
  dashboardContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  tabContent: {
    animation: 'fadeIn 0.5s ease'
  },
  sectionHeader: {
    marginBottom: '32px'
  },
  sectionSubtitle: {
    color: '#64748b',
    fontSize: '1.1rem',
    marginTop: '8px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  noProgramMessage: {
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'left'
  },
  modulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  moduleCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #f1f5f9'
  },
  moduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  moduleCode: {
    background: '#f1f5f9',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569'
  },
  moduleDetails: {
    marginBottom: '20px'
  },
  moduleRatingSection: {
    marginBottom: '20px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  ratingStars: {
    display: 'flex',
    gap: '8px',
    margin: '8px 0'
  },
  starBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    padding: '4px'
  },
  moduleActions: {
    display: 'flex',
    gap: '12px'
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1
  },
  btnOutline: {
    background: 'transparent',
    color: '#6366f1',
    border: '2px solid #6366f1',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1
  },
  btnOutlineSmall: {
    background: 'transparent',
    color: '#6366f1',
    border: '2px solid #6366f1',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  // Timetable Styles
  timetableContainer: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'auto'
  },
  timetableGrid: {
    display: 'grid',
    gridTemplateColumns: '120px repeat(5, 1fr)',
    gap: '1px',
    background: '#e2e8f0',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  timetableHeader: {
    display: 'contents',
    background: 'white'
  },
  timeSlotHeader: {
    padding: '16px',
    background: '#6366f1',
    color: 'white',
    fontWeight: '600',
    textAlign: 'center'
  },
  dayHeader: {
    padding: '16px',
    background: '#6366f1',
    color: 'white',
    fontWeight: '600',
    textAlign: 'center'
  },
  dayName: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  date: {
    fontSize: '14px',
    opacity: 0.9
  },
  timeRow: {
    display: 'contents'
  },
  timeSlot: {
    padding: '16px',
    background: '#f8fafc',
    fontWeight: '600',
    textAlign: 'center',
    borderRight: '1px solid #e2e8f0'
  },
  timetableCell: {
    padding: '2px',
    background: 'white',
    minHeight: '100px',
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0'
  },
  sessionCard: {
    padding: '12px',
    borderRadius: '6px',
    height: '100%',
    fontSize: '14px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  typeLecture: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  },
  typeTutorial: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  typeLab: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  sessionTitle: {
    fontWeight: '600',
    fontSize: '14px'
  },
  sessionDetails: {
    fontSize: '12px',
    opacity: 0.9
  },

  // Existing report and challenge styles remain the same...
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px'
  },
  reportCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f1f5f9'
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  statusSubmitted: {
    background: '#d1fae5',
    color: '#065f46'
  },
  statusPending: {
    background: '#fef3c7',
    color: '#92400e'
  },
  statusDraft: {
    background: '#e0e7ff',
    color: '#3730a3'
  },
  reportDetails: {
    marginBottom: '16px'
  },
  learningOutcomes: {
    marginBottom: '16px',
    padding: '12px',
    background: '#f0f9ff',
    borderRadius: '8px'
  },
  recommendations: {
    marginBottom: '16px',
    padding: '12px',
    background: '#f0fdf4',
    borderRadius: '8px'
  },
  reportActions: {
    marginTop: '16px'
  },
  attendanceSigned: {
    textAlign: 'center'
  },
  signedBadge: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  challengesSection: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  challengeFormSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '32px'
  },
  challengeForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formControl: {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    outline: 'none'
  },
  challengesList: {
    marginTop: '32px'
  },
  challengesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  challengeCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderLeft: '6px solid #e2e8f0'
  },
  priorityHigh: {
    borderLeftColor: '#ef4444'
  },
  priorityMedium: {
    borderLeftColor: '#f59e0b'
  },
  priorityLow: {
    borderLeftColor: '#10b981'
  },
  challengeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  priorityBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  challengeDetails: {
    marginBottom: '16px'
  },
  challengeStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  challengeFeedback: {
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    borderLeft: '4px solid #6366f1'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  },
  btnCancel: {
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  dashboardLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    fontSize: '18px',
    color: '#64748b'
  },
  clearFilterBtn: {
    background: 'transparent',
    color: '#6366f1',
    border: '2px solid #6366f1',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px'
  }
}

export default StudentDashboard