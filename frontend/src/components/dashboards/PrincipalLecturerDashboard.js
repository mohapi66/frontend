"use client"

import { useState, useEffect } from "react"
import API from "../../api"

const PrincipalLecturerDashboard = () => {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [challenges, setChallenges] = useState([])
  const [moduleRatings, setModuleRatings] = useState([])
  const [loading, setLoading] = useState({
    reports: true,
    challenges: true,
    ratings: true,
  })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchReports()
    fetchChallenges()
    fetchModuleRatings()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports")
      setReports(res.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading((prev) => ({ ...prev, reports: false }))
    }
  }

  const fetchChallenges = async () => {
    try {
      const res = await API.get("/challenges")
      setChallenges(res.data)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    } finally {
      setLoading((prev) => ({ ...prev, challenges: false }))
    }
  }

  const fetchModuleRatings = async () => {
    try {
      console.log("Fetching module ratings...")
      const res = await API.get("/ratings")
      console.log("Module ratings response:", res.data)

      // Transform the flat ratings array into grouped module data
      const transformedRatings = transformRatingsData(res.data)
      setModuleRatings(transformedRatings)
    } catch (error) {
      console.error("Error fetching module ratings:", error)
      setModuleRatings([])
    } finally {
      setLoading((prev) => ({ ...prev, ratings: false }))
    }
  }

  // Transform the ratings data from the API to group by module
  const transformRatingsData = (apiData) => {
    if (!apiData || apiData.length === 0) return []

    // Group ratings by module_id
    const modulesMap = {}

    apiData.forEach((rating) => {
      const moduleId = rating.module_id

      if (!modulesMap[moduleId]) {
        modulesMap[moduleId] = {
          id: moduleId,
          module_name: rating.module_name || `Module ${moduleId}`,
          program_name: rating.program_name || "Unknown Program",
          program_code: rating.program_code || "N/A",
          ratings: [],
        }
      }

      modulesMap[moduleId].ratings.push({
        id: rating.id,
        rating: rating.rating,
        comments: rating.comments,
        created_at: rating.created_at,
        rated_by_name: rating.rated_by_name || "Anonymous",
      })
    })

    return Object.values(modulesMap)
  }

  const submitFeedback = async (reportId) => {
    try {
      await API.put(`/reports/${reportId}/feedback`, {
        principal_feedback: feedback,
      })
      alert("Feedback submitted successfully!")
      setSelectedReport(null)
      setFeedback("")
      fetchReports()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback")
    }
  }

  const updateChallengeStatus = async (challengeId, status, adminFeedback = "") => {
    try {
      await API.put(`/challenges/${challengeId}`, {
        status: status,
        admin_feedback: adminFeedback,
      })
      alert(`Challenge ${status} successfully!`)
      fetchChallenges()
    } catch (error) {
      console.error("Error updating challenge:", error)
      alert("Failed to update challenge")
    }
  }

  // Calculate average rating for a module
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return (sum / ratings.length).toFixed(1)
  }

  // Get rating display with stars
  const renderRatingStars = (rating) => {
    const numericRating = Number.parseFloat(rating)
    const fullStars = Math.floor(numericRating)
    const hasHalfStar = numericRating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div style={styles.ratingStars}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} style={styles.starFull}>
            ★
          </span>
        ))}
        {hasHalfStar && <span style={styles.starHalf}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} style={styles.starEmpty}>
            ☆
          </span>
        ))}
        <span style={styles.ratingValue}>({rating})</span>
      </div>
    )
  }

  // Filter data based on search term
  const filteredReports = reports.filter(report =>
    report.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredChallenges = challenges.filter(challenge =>
    challenge.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.challenge_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredModuleRatings = moduleRatings.filter(module =>
    module.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get challenges by status
  const pendingChallenges = filteredChallenges.filter((challenge) => challenge.status === "pending")
  const resolvedChallenges = filteredChallenges.filter((challenge) => challenge.status === "resolved")

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.dashboardHeader}>
        <h1 style={styles.headerTitle}>Principal Lecturer Dashboard</h1>
        <p style={styles.headerSubtitle}>Review lecture reports, monitor module ratings, and manage challenges</p>
        
        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by module, lecturer, program, or challenge type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.dashboardContent}>
        {/* Statistics Overview */}
        <div style={styles.statsOverview}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Reports for Review</h3>
            <p style={styles.statNumber}>{reports.filter((r) => !r.principal_feedback).length}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Pending Challenges</h3>
            <p style={styles.statNumber}>{pendingChallenges.length}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Modules Rated</h3>
            <p style={styles.statNumber}>{moduleRatings.length}</p>
          </div>
        </div>

        {/* Module Ratings Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Module Ratings & Student Feedback</h2>
          {loading.ratings ? (
            <div style={styles.loading}>Loading ratings...</div>
          ) : filteredModuleRatings.length === 0 ? (
            <div style={styles.noData}>
              <p>No module ratings found matching your search.</p>
            </div>
          ) : (
            <div style={styles.ratingsGrid}>
              {filteredModuleRatings.map((module) => {
                const avgRating = calculateAverageRating(module.ratings)
                return (
                  <div key={module.id} style={styles.ratingCard}>
                    <div style={styles.ratingHeader}>
                      <h3 style={styles.moduleName}>{module.module_name}</h3>
                      <div style={styles.moduleInfo}>
                        <span>
                          {module.program_name} ({module.program_code})
                        </span>
                      </div>
                      <div style={styles.overallRating}>
                        <strong>Average Rating:</strong>
                        {renderRatingStars(avgRating)}
                      </div>
                    </div>

                    <div style={styles.ratingDetails}>
                      <p>
                        <strong>Total Ratings:</strong> {module.ratings?.length || 0}
                      </p>

                      {module.ratings && module.ratings.length > 0 && (
                        <div style={styles.recentFeedback}>
                          <h4>Recent Student Feedback:</h4>
                          {module.ratings.slice(0, 5).map((rating, index) => (
                            <div key={rating.id || index} style={styles.feedbackItem}>
                              <div style={styles.feedbackRating}>
                                {renderRatingStars(rating.rating)}
                                <span style={styles.feedbackDate}>
                                  {new Date(rating.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {rating.comments && <p style={styles.feedbackComment}>"{rating.comments}"</p>}
                              <p style={styles.feedbackAuthor}>- {rating.rated_by_name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Challenges Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Current Challenges</h2>
          {loading.challenges ? (
            <div style={styles.loading}>Loading challenges...</div>
          ) : filteredChallenges.length === 0 ? (
            <div style={styles.noData}>
              <p>No challenges found matching your search.</p>
            </div>
          ) : (
            <div style={styles.challengesTabs}>
              <div style={styles.tabContent}>
                <h3 style={styles.subsectionTitle}>Pending Challenges ({pendingChallenges.length})</h3>
                {pendingChallenges.length === 0 ? (
                  <div style={styles.noData}>
                    <p>No pending challenges</p>
                  </div>
                ) : (
                  <div style={styles.challengesGrid}>
                    {pendingChallenges.map((challenge) => (
                      <div key={challenge.id} style={styles.challengeCardPending}>
                        <div style={styles.challengeHeader}>
                          <h3 style={styles.challengeType}>{challenge.challenge_type}</h3>
                          <span style={styles.statusBadgePending}>{challenge.status}</span>
                        </div>

                        <div style={styles.challengeDetails}>
                          <p>
                            <strong>Module:</strong> {challenge.module_name}
                          </p>
                          <p>
                            <strong>Program:</strong> {challenge.program_name} ({challenge.program_code})
                          </p>
                          <p>
                            <strong>Reported By:</strong> {challenge.lecturer_name}
                          </p>
                          <p>
                            <strong>Date Reported:</strong> {new Date(challenge.submitted_date).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Description:</strong>
                          </p>
                          <div style={styles.challengeDescription}>{challenge.description}</div>
                          <p>
                            <strong>Impact:</strong> {challenge.impact}
                          </p>
                          {challenge.proposed_solution && (
                            <p>
                              <strong>Proposed Solution:</strong> {challenge.proposed_solution}
                            </p>
                          )}
                        </div>

                        <div style={styles.challengeActions}>
                          <button
                            style={styles.btnResolve}
                            onClick={() =>
                              updateChallengeStatus(
                                challenge.id,
                                "resolved",
                                "Challenge resolved by principal lecturer",
                              )
                            }
                          >
                            Mark as Resolved
                          </button>
                          <button
                            style={styles.btnSecondary}
                            onClick={() =>
                              updateChallengeStatus(challenge.id, "in_progress", "Under review by principal lecturer")
                            }
                          >
                            Mark In Progress
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resolvedChallenges.length > 0 && (
                  <>
                    <h3 style={styles.subsectionTitle}>Resolved Challenges ({resolvedChallenges.length})</h3>
                    <div style={styles.challengesGrid}>
                      {resolvedChallenges.slice(0, 3).map((challenge) => (
                        <div key={challenge.id} style={styles.challengeCardResolved}>
                          <div style={styles.challengeHeader}>
                            <h3 style={styles.challengeType}>{challenge.challenge_type}</h3>
                            <span style={styles.statusBadgeResolved}>Resolved</span>
                          </div>

                          <div style={styles.challengeDetails}>
                            <p>
                              <strong>Module:</strong> {challenge.module_name}
                            </p>
                            <p>
                              <strong>Reported By:</strong> {challenge.lecturer_name}
                            </p>
                            <p>
                              <strong>Resolved On:</strong> {new Date(challenge.resolved_date).toLocaleDateString()}
                            </p>
                            {challenge.admin_feedback && (
                              <p>
                                <strong>Admin Feedback:</strong> {challenge.admin_feedback}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Lecture Reports for Review</h2>
          {loading.reports ? (
            <div style={styles.loading}>Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div style={styles.noData}>
              <p>No reports found matching your search.</p>
            </div>
          ) : (
            <div style={styles.reportsGrid}>
              {filteredReports.map((report) => (
                <div key={report.id} style={styles.reportCard}>
                  <div style={styles.reportHeader}>
                    <h3 style={styles.moduleName}>{report.module_name}</h3>
                    <span style={styles.statusBadgePending}>{report.status}</span>
                  </div>

                  <div style={styles.reportDetails}>
                    <p>
                      <strong>Program:</strong> {report.program_name} ({report.program_code})
                    </p>
                    <p>
                      <strong>Lecturer:</strong> {report.lecturer_name}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Week:</strong> {report.week_of_reporting}
                    </p>
                    <p>
                      <strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}
                    </p>
                    <p>
                      <strong>Venue:</strong> {report.venue}
                    </p>
                    <p>
                      <strong>Topic:</strong> {report.topic_taught}
                    </p>
                    <p>
                      <strong>Learning Outcomes:</strong> {report.learning_outcomes}
                    </p>
                    <p>
                      <strong>Recommendations:</strong> {report.recommendations}
                    </p>
                  </div>

                  {!report.principal_feedback ? (
                    <button style={styles.btnPrimary} onClick={() => setSelectedReport(report)}>
                      Add Feedback
                    </button>
                  ) : (
                    <div style={styles.feedbackSection}>
                      <h4>Your Feedback:</h4>
                      <p>{report.principal_feedback}</p>
                      <button style={styles.btnSecondary} onClick={() => setSelectedReport(report)}>
                        Update Feedback
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Modal */}
        {selectedReport && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2>Add Feedback for {selectedReport.module_name}</h2>
              <div style={styles.formGroup}>
                <label>Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback for this lecture report..."
                  rows="6"
                  style={styles.textarea}
                />
              </div>
              <div style={styles.formActions}>
                <button
                  style={styles.btnCancel}
                  onClick={() => {
                    setSelectedReport(null)
                    setFeedback("")
                  }}
                >
                  Cancel
                </button>
                <button
                  style={styles.btnPrimary}
                  onClick={() => submitFeedback(selectedReport.id)}
                  disabled={!feedback.trim()}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Internal CSS Styles
const styles = {
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  dashboardHeader: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  headerTitle: {
    margin: '0 0 10px 0',
    color: '#2c3e50',
    fontSize: '2rem'
  },
  headerSubtitle: {
    margin: '0 0 20px 0',
    color: '#7f8c8d',
    fontSize: '1.1rem'
  },
  searchContainer: {
    marginTop: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e1e8ed',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    ':focus': {
      borderColor: '#3498db'
    }
  },
  dashboardContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statsOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statTitle: {
    margin: '0 0 15px 0',
    color: '#2c3e50',
    fontSize: '1.1rem'
  },
  statNumber: {
    margin: '0',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#3498db'
  },
  section: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#2c3e50',
    fontSize: '1.5rem',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '10px'
  },
  subsectionTitle: {
    margin: '25px 0 15px 0',
    color: '#34495e',
    fontSize: '1.2rem'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
    fontSize: '1.1rem'
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#95a5a6',
    fontSize: '1.1rem'
  },
  ratingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  ratingCard: {
    border: '1px solid #ecf0f1',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa'
  },
  ratingHeader: {
    marginBottom: '15px'
  },
  moduleName: {
    margin: '0 0 10px 0',
    color: '#2c3e50',
    fontSize: '1.3rem'
  },
  moduleInfo: {
    color: '#7f8c8d',
    marginBottom: '10px'
  },
  overallRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  ratingDetails: {
    fontSize: '14px'
  },
  recentFeedback: {
    marginTop: '15px'
  },
  feedbackItem: {
    borderTop: '1px solid #ecf0f1',
    paddingTop: '10px',
    marginTop: '10px'
  },
  feedbackRating: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  feedbackDate: {
    fontSize: '12px',
    color: '#95a5a6'
  },
  feedbackComment: {
    margin: '5px 0',
    fontStyle: 'italic',
    color: '#2c3e50'
  },
  feedbackAuthor: {
    margin: '0',
    fontSize: '12px',
    color: '#7f8c8d'
  },
  ratingStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  starFull: {
    color: '#f39c12',
    fontSize: '18px'
  },
  starHalf: {
    color: '#f39c12',
    fontSize: '18px',
    opacity: '0.7'
  },
  starEmpty: {
    color: '#bdc3c7',
    fontSize: '18px'
  },
  ratingValue: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#7f8c8d'
  },
  challengesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  },
  challengeCardPending: {
    border: '2px solid #e74c3c',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fef5f5'
  },
  challengeCardResolved: {
    border: '2px solid #27ae60',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f5fef7'
  },
  challengeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  challengeType: {
    margin: '0',
    color: '#2c3e50'
  },
  statusBadgePending: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  statusBadgeResolved: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  challengeDetails: {
    fontSize: '14px',
    lineHeight: '1.5'
  },
  challengeDescription: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '5px',
    margin: '5px 0',
    borderLeft: '3px solid #3498db'
  },
  challengeActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  },
  reportCard: {
    border: '1px solid #bdc3c7',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white'
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  reportDetails: {
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '15px'
  },
  feedbackSection: {
    borderTop: '1px solid #ecf0f1',
    paddingTop: '15px'
  },
  btnPrimary: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  },
  btnSecondary: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#7f8c8d'
    }
  },
  btnResolve: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#219a52'
    }
  },
  btnCancel: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '600px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ecf0f1',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  }
}

export default PrincipalLecturerDashboard