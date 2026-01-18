import React, { useEffect, useState } from "react";
import {
  FileText, RefreshCw, CheckCircle, Clock,
  AlertCircle, MapPin, User, ChevronDown, Layers, UserCheck, X
} from "react-feather";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./Navbar";
import { format } from "date-fns";
import { Doughnut, Bar } from "react-chartjs-2";

const STATUSES = ["Pending", "Assigned", "Resolved - Pending Review", "Completed"];

const STATUS_PRIORITY = {
  "Pending": 1,
  "Assigned": 2,
  "Resolved - Pending Review": 3,
  "Completed": 4
};

const AdminDashboard = () => {

  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [assigningComplaintId, setAssigningComplaintId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");

  // NEW: Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((g) => g.status === "Completed" || g.status === "Resolved").length;
  const inProgressComplaints = complaints.filter((g) => g.status === "Assigned" || g.status === "Resolved - Pending Review").length;
  const RejectedComplaints = complaints.filter((g) => g.approvalStatus === "REJECTED").length;
  const PendingComplaints = complaints.filter((g) => g.status === "Pending").length;
  const satisfactionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 1000) / 10 : 0;


  // Chart data remains exactly the same
  const statusPieData = {
    labels: ["Pending", "In Progress", "Resolved", "Rejected"],
    datasets: [{
      data: [PendingComplaints, inProgressComplaints, resolvedComplaints, RejectedComplaints],
      backgroundColor: ["#facc15", "#3b82f6", "#22c55e", "#ef4444"],
      borderWidth: 1
    }]
  };

  const barChartData = {
    labels: ["Pending", "In Progress", "Resolved", "Rejected"],
    datasets: [{
      label: "Complaints",
      data: [PendingComplaints, inProgressComplaints, resolvedComplaints, RejectedComplaints],
      backgroundColor: "#6366f1"
    }]
  };

  const satisfactionChartData = {
    labels: ["Satisfied", "Remaining"],
    datasets: [{
      data: [satisfactionRate, 100 - satisfactionRate],
      backgroundColor: ["#16a34a", "#e5e7eb"],
      borderWidth: 0
    }]
  };

  const token = localStorage.getItem("jwtToken");

  const fetchOfficers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/officers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOfficers(data);
      } else {
        setOfficers([]);
      }
    } catch (err) {
      console.error("Failed to load officers:", err);
      setOfficers([]);
    }
  };

  const fetchComplaints = async () => {
    if (!token) {
      setError("Not authorized. Please log in as admin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = "http://localhost:8080/api/admin/complaints";
      if (departmentFilter) {
        const params = new URLSearchParams({ department: departmentFilter });
        console.log(params);
        url += `?${params.toString()}`;
        console.log(url)
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load complaints");
      }

      const data = await res.json();
      setComplaints(data);
      console.log(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while loading complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOfficer = async (complaintId, officerId) => {
    if (!officerId) return;

    setAssigningComplaintId(complaintId);
    try {
      const selectedOfficer = officers.find(o => o.id == officerId);
      const officerName = selectedOfficer?.name || "Unknown Officer";

      const res = await fetch(`http://localhost:8080/api/complaints/${complaintId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          officerId: parseInt(officerId),
          officerName: officerName,
          deadline: selectedDate
            ? format(selectedDate, "yyyy-MM-dd")
            : null
        })
      });

      if (!res.ok) {
        const text = await res.json();
        throw new Error(text || "Failed to assign officer");
      }

      const responseText = await res.json();
      let updatedComplaint;
      try { updatedComplaint = JSON.parse(responseText); } catch (e) { updatedComplaint = null; }

      setComplaints(prev =>
        prev.map(c => {
          if (c.id === complaintId) {
            return updatedComplaint ? updatedComplaint : { ...c, officerId, officerName };
          }
          return c;
        })
      );

      setError("✅ Officer assigned successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to assign officer");
    } finally {
      setAssigningComplaintId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!token) return;
    setStatusUpdatingId(id);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/complaints/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }

      const responseText = await res.text();
      let updatedComplaint;
      try { updatedComplaint = JSON.parse(responseText); } catch (e) { updatedComplaint = null; }

      setComplaints(prev =>
        prev.map(c => {
          if (c.id === id) {
            return updatedComplaint ? updatedComplaint : { ...c, status: newStatus };
          }
          return c;
        })
      );

    } catch (err) {
      console.error(err);
      setError(err.message || "Could not update complaint status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(`http://localhost:8080/api/complaints/${id}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updated = await res.json();
      setSelectedComplaint(updated);
      await fetchOfficers();
    }

  };

  const handleReject = async (id, reason) => {
    const token = localStorage.getItem("jwtToken");
    console.log("Reject token:", token);

    if (!token) {
      alert("Please login again - no token found");
      return;
    }
    const res = await fetch(`http://localhost:8080/api/complaints/${id}/reject`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSelectedComplaint(updated);
      await fetchOfficers();
    }

  };


  useEffect(() => {
    fetchOfficers();
    fetchComplaints();
  }, [departmentFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "border-l-emerald-500 bg-emerald-50/30";
      case "Assigned": return "border-l-blue-500 bg-blue-50/30";
      case "Resolved - Pending Review": return "border-l-amber-500 bg-amber-50/30";
      case "Rejected": return "border-l-red-800 bg-red-500"
      default: return "border-l-red-500 bg-red-50/30";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-800";
      case "Assigned": return "bg-blue-100 text-blue-800";
      case "Resolved - Pending Review": return "bg-amber-100 text-amber-800";
      case "Rejected": return "bg-red-800 text-white";
      default: return "bg-red-100 text-red-800";
    }
  };

  const departments = ["Electricity", "Roads", "Water", "Sanitation", "Agriculture"];
  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const resolvedCount = complaints.filter(c => c.status === "Completed").length;
  const assignedCount = complaints.filter(c => c.status === "Assigned").length;
  const totalCount = pendingCount + resolvedCount + assignedCount;

  const sortedComplaints = [...complaints].sort((a, b) => {
    if (sortBy === "status") {
      const priorityA = STATUS_PRIORITY[a.status] || 99;
      const priorityB = STATUS_PRIORITY[b.status] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return b.id - a.id;
    }
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Welcome Header */}
      <div className="text-5xl text-black text-center mx-5 p-4 font-extrabold bg-linear-to-r from-red-100 via-blue-100 to-green-100 rounded-2xl mt-2">
        <h2>Welcome, Admin</h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">

        {/* Header & Stats  */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-1 text-slate-500">Overview of municipal operations and grievances.</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
              <p className="text-xs text-slate-400 font-medium uppercase">Total</p>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span className="text-2xl font-bold text-slate-700">{totalCount}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
              <p className="text-xs text-slate-400 font-medium uppercase">Pending</p>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-slate-700">{pendingCount}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
              <p className="text-xs text-slate-400 font-medium uppercase">Assigned</p>
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-slate-700">{assignedCount}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
              <p className="text-xs text-slate-400 font-medium uppercase">Resolved</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl font-bold text-slate-700">{resolvedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-0 pt-1 border-t border-orange-100/50 bg-linear-to-b from-slate-50/80 to-white/80 backdrop-blur-sm rounded-3xl p-8">

          {/* Status Distribution Card */}
          <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:border-blue-200/70 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"></div>
            <h3 className="relative z-10 text-2xl font-black text-center mb-8 bg-linear-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              Status Distribution
            </h3>
            <div className="relative z-10 flex justify-center">
              <Doughnut
                data={statusPieData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 13, weight: '600' },
                        color: '#1f2937'
                      }
                    }
                  },
                  cutout: '0%',
                  animation: { animateRotate: true, duration: 2000 }
                }}
              />

            </div>
          </div>

          {/* Status Comparison Card */}
          <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:border-purple-200/70 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"></div>
            <h3 className="relative z-10 text-2xl font-black text-center mb-8 bg-linear-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              Status Comparison
            </h3>
            <div className="relative z-10 pt-9 pb-7">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0,0,0,0.85)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      cornerRadius: 12
                    }
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { weight: '600' } }
                    },
                    y: {
                      grid: { color: 'rgba(0,0,0,0.06)' },
                      ticks: { font: { weight: 'bold' } }
                    }
                  },
                  animation: { duration: 1500, easing: 'easeOutQuart' }
                }}
              />

            </div>
            <span className="justify-center items-center text-2xl text-blue-500 font-extrabold p-10 ">Total Complaints </span>
            <span className="justify-center items-center text-4xl text-blue-700 font-extrabold p-30">{totalComplaints}</span>
          </div>

          {/* Satisfaction Rate Card */}
          <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:border-emerald-200/70 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 hover:scale-[1.02] flex flex-col justify-center items-center">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"></div>
            <h3 className="relative z-10 text-xl font-black text-center mb-6 bg-linear-to-r from-emerald-800 to-teal-800 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              Satisfaction Rate
            </h3>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Doughnut
                data={satisfactionChartData}
                options={{
                  responsive: true,
                  cutout: "70%",
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                  },
                  animation: { animateRotate: true, duration: 2500 },
                  circumference: 360,
                  rotation: 0,
                  maintainAspectRatio: false
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-2xl">
                  {satisfactionRate}%
                </span>
              </div>
            </div>
          </div>

        </div>
        {/*  */}

        {/* Toolbar (UNCHANGED) */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2 no-scrollbar">
            <button
              onClick={() => setDepartmentFilter("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${departmentFilter === "" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
            >
              All
            </button>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${departmentFilter === dept ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end px-2">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm text-sm font-semibold">
                <Layers className="w-4 h-4 text-slate-400" />
                {sortBy === "newest" ? "Newest First" : "By Status Priority"}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 transform origin-top-right">
                <div className="p-1">
                  <button
                    onClick={() => setSortBy("newest")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortBy === "newest" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setSortBy("status")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortBy === "status" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    By Status Priority
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={fetchComplaints}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${error.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            <div className={`w-2 h-2 rounded-full ${error.includes("✅") ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Complaints Table */}
        {loading ? (
          <div className="grid place-items-center py-20">
            <RefreshCw className="w-10 h-10 text-slate-300 animate-spin" />
            <p className="mt-4 text-slate-400">Fetching latest data...</p>
          </div>
        ) : sortedComplaints.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No complaints found</h3>
            <p className="text-slate-500">Try changing the filter or refresh the dashboard.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Officer</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedComplaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="hover:bg-slate-50/50 border-l-4 border-l-transparent hover:border-l-indigo-500 cursor-pointer transition-all group"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900 w-12">
                        #{complaint.id}
                      </td>
                      <td>
                        <div className={`text-center pb-1 rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                          <span className={`px-1 py-2  text-xs font-bold text-center`}>
                            {complaint.status === "Pending" && <Clock className="w-3 h-3 inline mr-1" />}
                            {complaint.status === "Completed" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {complaint.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {complaint.department || complaint.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 max-w-md truncate" title={complaint.description}>
                        {complaint.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {complaint.district || complaint.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm w-32">
                        {complaint.officerId ? (
                          <div className="text-center rounded-full bg-indigo-100 text-indigo-800 px-1 py-1 pb-1">
                            <span className=" rounded-full text-xs font-semibold">
                              {complaint.officerName}
                            </span>
                          </div>

                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(complaint);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL WITH EXISTING CARD UI */}
        {isModalOpen && selectedComplaint && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedComplaint(null);
              }}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="p-6 pb-2 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${getStatusColor(selectedComplaint.status)}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">#{selectedComplaint.id} - {selectedComplaint.department || selectedComplaint.category}</h2>
                        <p className="text-slate-500">{selectedComplaint.district || selectedComplaint.location}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedComplaint(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* EXISTING CARD CONTENT (1:1 COPY) */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className={`group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 border-l-4 ${getStatusColor(selectedComplaint.status)}`}>

                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                        #{selectedComplaint.id}
                      </span>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusBadgeColor(selectedComplaint.status)}`}>
                        {selectedComplaint.status === "Pending" && <Clock className="w-3 h-3" />}
                        {selectedComplaint.status === "Completed" && <CheckCircle className="w-3 h-3" />}
                        {selectedComplaint.status}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                        {selectedComplaint.department || selectedComplaint.category}
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1 text-slate-500 normal-case font-normal"><MapPin className="w-3 h-3" /> {selectedComplaint.district || selectedComplaint.location}</span>
                      </h3>
                      <h4 className="text-indigo-600">
                        <span className="text-gray-500">Created At : </span>
                        {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</h4>
                      {selectedComplaint.deadline ? (<h4 className="text-red-600">
                        <span className="text-gray-500">Deadline : </span>
                        {new Date(selectedComplaint.deadline).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</h4>) : (<span className="text-red-600">No deadline set!</span>)
                      }
                      <p className="text-slate-800 font-medium leading-relaxed min-h-8">
                        <span className="text-gray-500">Description : </span> {selectedComplaint.description}
                      </p>

                      {selectedComplaint.resolutionNotes ? (
                        <p className="text-slate-800 font-medium leading-relaxed min-h-8">
                          <span className="text-gray-500">Resolution Notes : </span>{selectedComplaint.resolutionNotes}
                        </p>
                      ) : (
                        <p></p>
                      )

                      }

                    </div>

                    <div className="grid grid-cols-2 p-0.5 text-gray-700 text-sm gap-6">
                      <p>Evidence :</p>
                      <p>Work proof :</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Complaint Image */}
                      <div className="h-32 w-full flex items-center justify-center border rounded-md bg-gray-50">
                        {selectedComplaint.imagePath ? (
                          <img src={selectedComplaint.imagePath} alt="" className="h-full w-full object-cover rounded-md" />
                        ) : (
                          <span className="text-gray-500 text-sm">No Image</span>
                        )}
                      </div>

                      {/* Proof Image */}
                      <div className="h-32 w-full flex items-center justify-center border rounded-md bg-gray-50">
                        {selectedComplaint.proofImg ? (
                          <img src={selectedComplaint.proofImg} alt="" className="h-full w-full object-cover rounded-md" />
                        ) : (
                          <span className="text-gray-500 text-sm">No Image</span>
                        )}
                      </div>
                    </div>

                    <hr className="border-slate-100 mb-4" />

                    {/* Controls Section (UNCHANGED LOGIC) */}
                    <div className="space-y-3">
                      {selectedComplaint.approvalStatus === "PENDING" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(selectedComplaint.id)}
                            className="px-4 py-2 text-xs bg-green-100 font-bold text-green-700 rounded hover:bg-green-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Rejection reason:");
                              if (reason !== null) handleReject(selectedComplaint.id, reason);
                            }}
                            className="px-4 py-2 text-xs font-bold bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full 
                              {g.approvalStatus === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'}">
                          {selectedComplaint.approvalStatus}
                        </span>
                      )}
                      {/* Officer Assignment */}
                      <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`p-2 rounded-full ${selectedComplaint.officerId ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Officer</span>
                            {selectedComplaint.officerId ? (
                              <span className="text-xs font-bold text-indigo-900 truncate">{selectedComplaint.officerName}</span>
                            ) : (
                              <span className="text-xs font-medium text-slate-500 italic">Unassigned</span>
                            )}
                          </div>
                        </div>

                        {!selectedComplaint.officerId && (
                          <div className="flex flex-row gap-3 items-center">

                            <select
                              value={selectedOfficerId}
                              onChange={(e) => setSelectedOfficerId(e.target.value)}
                              disabled={assigningComplaintId === selectedComplaint.id}
                              className="px-4 py-1 border border-slate-300 rounded-lg text-xs"
                            >
                              <option value="">Choose officer...</option>
                              {officers.map(o => (
                                <option key={o.id} value={o.id}>
                                  {o.name} ({o.department})
                                </option>
                              ))}
                            </select>

                            <DatePicker
                              selected={selectedDate}
                              onChange={(date) => setSelectedDate(date)}
                              dateFormat="yyyy-MM-dd"
                              minDate={new Date()}
                              className="w-28 px-4 py-1 border border-gray-300 rounded-lg"
                            />

                            <button
                              onClick={() => {
                                if (!selectedOfficerId || !selectedDate) {
                                  alert("Please select officer and deadline");
                                  return;
                                }
                                handleAssignOfficer(selectedComplaint.id, selectedOfficerId);
                              }}
                              className="px-4 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                            >
                              Done
                            </button>

                          </div>
                        )}

                      </div>

                      {/* Status Update Control */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-400">Update Status</label>
                        <div className="relative">
                          <select
                            value={selectedComplaint.status}
                            onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                            disabled={statusUpdatingId === selectedComplaint.id}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-indigo-300 transition-all"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
