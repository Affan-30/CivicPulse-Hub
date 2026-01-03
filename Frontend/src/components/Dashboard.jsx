import React, { useEffect, useState } from "react";
import { FileText, CheckCircle, TrendingUp, Plus, AlertCircle, Target, MessageSquare } from "react-feather";
import RegisterGrievance from "./RegisterGrievance";
import Navbar from "./Navbar";
import AdminDashboard from "./AdminDashboard";
import { Navigate, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");

  const token = localStorage.getItem("jwtToken");
  const userName = localStorage.getItem("userName") || "USER";

  const totalComplaints = grievances.length;
  const resolvedComplaints = grievances.filter((g) => g.status === "Completed" || g.status === "Resolved").length;
  const inProgressComplaints = grievances.filter((g) => g.status === "Assigned" || g.status === "Resolved - Pending Review").length;
  const RejectedComplaints = grievances.filter((g) => g.approvalStatus === "REJECTED").length;
  const PendingComplaints = grievances.filter((g) => g.status === "Pending").length;
  const satisfactionRate =
    totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 1000) / 10 : 0;

  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const complaintForm = () => {
    setShowForm(true);
    navigate('/grievanceform');
  };

  function isOverdue(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dueDate);
    d.setHours(0, 0, 0, 0);

    return d < today; 
  }

  //Complaint Re-Open Function
  const handleReopen = async(id) => {
    try{
      const res = await fetch(
         `http://localhost:8080/api/complaints/${id}/reopen`,
          {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // send JWT
          },
        });
      if (!res.ok) {
          const text = await res.text();
          setLoadError(text || "Failed to reopen your grievances");
          alert("Failed to reopen your grievance")
          return;
        }

        const data = await res.json();
        console.log("Re-Open Complaint : "+data)
        
      }
      catch(e){
          console.log(e);
        }
  }


  // Submit feedback function
  const submitFeedback = async (feedback) => {
    if (!selectedComplaint) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/complaints/${selectedComplaint.id}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feedback }),
        }
      );

      if (res.ok) {
        
        window.location.reload();
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }

    setFeedbackOpen(false);
    setSelectedComplaint(null);
    setFeedbackText("");
    await fetchComplaints();
  };

  useEffect(() => {
    if (!token) return;

    const fetchMyComplaints = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const res = await fetch("http://localhost:8080/api/complaints/my", 
          {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // send JWT
          },
        });

        if (!res.ok) {
          const text = await res.text();
          setLoadError(text || "Failed to load your grievances");
          return;
        }

        const data = await res.json();
        console.log(data)
        setGrievances(
          data.map((c) => ({
            id: c.id,
            department: c.category,          // map to current UI field
            description: c.description,
            status: c.status,
            date: c.createdAt?.substring(0, 10) || "", // YYYY-MM-DD
            imagePath: c.imagePath || null,
            resolutionNotes: c.resolutionNotes || null,
            feedback: c.feedback || null,
            proofImg: c.proofImg || null,
            deadline: c.deadline || null,
            approvalStatus : c.approvalStatus ||null,
            approvalReason : c.approvalReason || null,
          }))
        );
      } catch (err) {
        console.error(err);
        setLoadError("Something went wrong while loading your grievances.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, [token]);

  return (
    <div className="mainbg min-h-screen bg-linear-to-br from-orange-50 via-white to-green-50 py-10">
      <Navbar />
      <div className="max-w-7xl mx-auto my-4  px-4 pt-10">
        {/* Welcome banner */}
        <div className="bg-linear-to-r from-orange-100 to-green-100 rounded-lg p-1 mb-8 border-l-8 border-orange-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="pl-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome, {userName}!
              </h2>
              <p className="text-gray-600">
                We are here to serve you and resolve your grievances
              </p>
            </div>
            <div className="text-6xl pr-4">
              <img src="/src/assets/india.png" alt="India" className="w-40 object-fill" />
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-fuchsia-500 hover:shadow-xl transition-shadow hover:bg-fuchsia-50">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-12 h-12 text-fuchsia-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{totalComplaints}</p>
                <p className="text-sm text-gray-500">Total Complaints</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-orange-500 hover:shadow-xl transition-shadow hover:bg-orange-50">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-12 h-12 text-orange-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{PendingComplaints}</p>
                <p className="text-sm text-gray-500">Pending Complaints</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-blue-500 hover:shadow-xl transition-shadow hover:bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-12 h-12 text-blue-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{inProgressComplaints}</p>
                <p className="text-sm text-gray-500">Complaints in Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-green-500 hover:shadow-xl transition-shadow hover:bg-green-50">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{resolvedComplaints}</p>
                <p className="text-sm text-gray-500">Complaints Resolved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-red-500 hover:shadow-xl transition-shadow hover:bg-red-50">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-12 h-12 text-red-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{RejectedComplaints}</p>
                <p className="text-sm text-gray-500">Complaints Rejected</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-fuchsia-500 hover:shadow-xl transition-shadow hover:bg-fuchsia-50">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-12 h-12 text-fuchsia-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{satisfactionRate}%</p>
                <p className="text-sm text-gray-500">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lodge new grievance */}
        <div className="text-center mb-8">
          {!showForm && (
            <button
              className="bg-linear-to-r from-orange-500 to-orange-600 text-white px-12 py-4 rounded-xl 
                       text-2xl font-extrabold shadow-xl hover:shadow-2xl hover:scale-105 
                       transition-all flex items-center space-x-3 mx-auto"
              onClick={complaintForm}
            >
              <Plus className="w-8 h-8" />
              <span>Lodge New Grievance</span>
            </button>
          )}
        </div>

        {/* Error while loading */}
        {loadError && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500 ">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-orange-500" />
            Your Grievances
          </h3>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading your grievances...</div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No grievances registered yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 ">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Image Proof</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grievances.map((g) => (

                  <tr key={g.id} className={`hover:bg-orange-50 transition-colors ${g.approvalStatus == "REJECTED" ? "bg-red-400" : "bg-white-100"}`}>
                    <td className="px-6 py-4 text-sm text-gray-800">#{g.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{g.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 ">{g.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {g.imagePath ? (
                        <img
                          src={g.imagePath}
                          alt="evidence"
                          className="h-15 w-44 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{g.date}</td>

                    <td className="px-6 py-4 text-center ">
                      {/* Status Badge - Centered */}
                      <div className="flex flex-col items-center gap-1 ">
                        <span>
                         {g.approvalStatus != "REJECTED" && (
                           <div className={`px-3 py-1 rounded-full text-xs font-semibold ${g.status === "Resolved" || g.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : g.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {g.status}
                          </div>
                         )}
                         {g.approvalStatus === "REJECTED" && (
                           <div className="px-3 py-2 rounded-lg text-xs font-extrabold text-red-800 bg-red-200 border border-red-400 max-w-xs mx-auto wrap-break-word whitespace-pre-wrap">
                            <div>COMPLAINT REJECTED!</div>
                            <span className="font-semibold text-black">{g.approvalReason}</span>
                          </div>
                         )}

                        </span>
                        {/* Resolution Notes - Only for Completed */}
                        {g.status === "Completed" && g.resolutionNotes && (
                          <div className="px-3 py- rounded-lg text-xs text-gray-800 bg-red-100 border border-red-400 max-w-xs mx-auto wrap-break-word whitespace-pre-wrap">
                            {g.resolutionNotes}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Image Proof - by officer */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {/* Resolution Notes - Only for Completed */}
                        {g.proofImg ? (

                          <img
                            src={g.proofImg}
                            alt="image proof"
                            className="h-15 w-44 object-cover rounded"
                            onClick={() => window.open(g.proofImg, "_blank")}
                          />
                        ) : (
                          <span> - </span>
                        )}

                      </div>
                    </td>

                    {/* Feedback Action Button */}
                    <td className="px-6 py-4 text-center">
                      {g.status === "Completed" ? (
                        g.feedback ? (
                          // Show submitted feedback ✓
                          <div className="flex flex-col items-center gap-1 max-w-32">
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium ">
                              {g.feedback}
                            </span>
                            <span className="text-xs text-gray-500">✓ Submitted</span>

                            <button className="bg-blue-700 text-white font-bold px-2 py-2 rounded-2xl" onClick={() => {handleReopen(g.id)}}>Re-Open</button>
                          </div>
                        ) : (
                          // Show feedback button
                          <button
                            onClick={() => {
                              setSelectedComplaint(g);
                              setFeedbackOpen(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
                            title="Add Feedback"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Feedback</span>
                          </button>
                        )
                      ) : (
                        // Non-Completed: Deadline + Overdue/Reopen
                        <span className="text-gray-800 text-xs">
                          <p>
                            {g.approvalStatus === "REJECTED" &&(
                              <button className="bg-red-800 text-white font-bold px-2 py-2">Delete</button>
                            )}
                            {g.approvalStatus != "REJECTED" && (
                              <div>
                            Deadline: {g.deadline || 'None'}
                            {g.deadline && isOverdue(g.deadline) && (
                              <div className="mt-1">
                                <p className="text-red-600 font-semibold text-xs">Deadline is Overdue!!!</p>
                                <button
                                  onClick={() => handleReopen(g.id)}
                                  className="ml-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  Re-Open
                                </button>
                              </div>
                            )}
                            </div>
                          )}
                          </p>
                        </span>
                      )}
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Submit Feedback</h2>
                <p className="text-sm text-gray-500 mt-1">Complaint #{selectedComplaint.id}</p>
              </div>
              <button
                onClick={() => {
                  setFeedbackOpen(false);
                  setSelectedComplaint(null);
                  setFeedbackText("");
                }}
                className="text-gray-400 hover:text-gray-600 p-1 -m-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <textarea
              rows="5"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your feedback about this complaint resolution..."
              className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setFeedbackOpen(false);
                  setSelectedComplaint(null);
                  setFeedbackText("");
                }}
                className="px-6 py-2 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => submitFeedback(feedbackText)}
                disabled={!feedbackText.trim()}
                className="px-6 py-2 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
