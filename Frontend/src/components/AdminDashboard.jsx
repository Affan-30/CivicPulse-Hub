// import React, { useEffect, useState } from "react";
// import {
//   FileText, RefreshCw, CheckCircle, Clock,
//   AlertCircle, MapPin, User, ChevronDown, Layers, UserCheck, X,
//   TrendingUp
// } from "react-feather";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Navbar from "./Navbar";
// import { format } from "date-fns";
// import { Doughnut, Bar } from "react-chartjs-2";
// import ComplaintsLineCharts from "./ComplaintsLineCharts";

// const STATUSES = ["Pending", "Assigned", "Resolved - Pending Review", "Completed"];

// const STATUS_PRIORITY = {
//   "Pending": 1,
//   "Assigned": 2,
//   "Resolved - Pending Review": 3,
//   "Completed": 4
// };

// const AdminDashboard = () => {

//   const [complaints, setComplaints] = useState([]);
//   const [officers, setOfficers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [departmentFilter, setDepartmentFilter] = useState("");
//   const [sortBy, setSortBy] = useState("newest");
//   const [statusUpdatingId, setStatusUpdatingId] = useState(null);
//   const [assigningComplaintId, setAssigningComplaintId] = useState(null);

//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedOfficerId, setSelectedOfficerId] = useState("");

//   // NEW: Modal state
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const totalComplaints = complaints.length;
//   const resolvedComplaints = complaints.filter((g) => g.status === "Completed" || g.status === "Resolved").length;
//   const inProgressComplaints = complaints.filter((g) => g.status === "Assigned" || g.status === "Resolved - Pending Review").length;
//   const RejectedComplaints = complaints.filter((g) => g.approvalStatus === "REJECTED").length;
//   const PendingComplaints = complaints.filter((g) => g.status === "Pending").length;
//   const satisfactionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 1000) / 10 : 0;


//   // Chart data remains exactly the same
//   const statusPieData = {
//     labels: ["Pending", "In Progress", "Resolved", "Rejected"],
//     datasets: [{
//       data: [PendingComplaints, inProgressComplaints, resolvedComplaints, RejectedComplaints],
//       backgroundColor: ["#facc15", "#3b82f6", "#22c55e", "#ef4444"],
//       borderWidth: 1
//     }]
//   };

//   const barChartData = {
//     labels: ["Pending", "In Progress", "Resolved", "Rejected"],
//     datasets: [{
//       label: "Complaints",
//       data: [PendingComplaints, inProgressComplaints, resolvedComplaints, RejectedComplaints],
//       backgroundColor: "#6366f1"
//     }]
//   };

//   const satisfactionChartData = {
//     labels: ["Satisfied", "Remaining"],
//     datasets: [{
//       data: [satisfactionRate, 100 - satisfactionRate],
//       backgroundColor: ["#16a34a", "#e5e7eb"],
//       borderWidth: 0
//     }]
//   };

//   const token = localStorage.getItem("jwtToken");

//   const fetchOfficers = async () => {
//     try {
//       const res = await fetch("http://localhost:8080/api/officers", {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setOfficers(data);
//       } else {
//         setOfficers([]);
//       }
//     } catch (err) {
//       console.error("Failed to load officers:", err);
//       setOfficers([]);
//     }
//   };

//   const fetchComplaints = async () => {
//     if (!token) {
//       setError("Not authorized. Please log in as admin.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       let url = "http://localhost:8080/api/admin/complaints";
//       if (departmentFilter) {
//         const params = new URLSearchParams({ department: departmentFilter });
//         console.log(params);
//         url += `?${params.toString()}`;
//         console.log(url)
//       }

//       const res = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to load complaints");
//       }

//       const data = await res.json();
//       setComplaints(data);
//       console.log(data);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Something went wrong while loading complaints");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssignOfficer = async (complaintId, officerId) => {
//     if (!officerId) return;

//     setAssigningComplaintId(complaintId);
//     try {
//       const selectedOfficer = officers.find(o => o.id == officerId);
//       const officerName = selectedOfficer?.name || "Unknown Officer";

//       const res = await fetch(`http://localhost:8080/api/complaints/${complaintId}/assign`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           officerId: parseInt(officerId),
//           officerName: officerName,
//           deadline: selectedDate
//             ? format(selectedDate, "yyyy-MM-dd")
//             : null
//         })
//       });

//       if (!res.ok) {
//         const text = await res.json();
//         throw new Error(text || "Failed to assign officer");
//       }

//       const responseText = await res.json();
//       let updatedComplaint;
//       try { updatedComplaint = JSON.parse(responseText); } catch (e) { updatedComplaint = null; }

//       setComplaints(prev =>
//         prev.map(c => {
//           if (c.id === complaintId) {
//             return updatedComplaint ? updatedComplaint : { ...c, officerId, officerName };
//           }
//           return c;
//         })
//       );

//       setError("✅ Officer assigned successfully!");
//       setTimeout(() => setError(""), 3000);
//     } catch (err) {
//       setError(err.message || "Failed to assign officer");
//     } finally {
//       setAssigningComplaintId(null);
//     }
//   };

//   const handleStatusChange = async (id, newStatus) => {
//     if (!token) return;
//     setStatusUpdatingId(id);
//     setError("");

//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/admin/complaints/${id}/status`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ status: newStatus })
//         }
//       );

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to update status");
//       }

//       const responseText = await res.text();
//       let updatedComplaint;
//       try { updatedComplaint = JSON.parse(responseText); } catch (e) { updatedComplaint = null; }

//       setComplaints(prev =>
//         prev.map(c => {
//           if (c.id === id) {
//             return updatedComplaint ? updatedComplaint : { ...c, status: newStatus };
//           }
//           return c;
//         })
//       );

//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Could not update complaint status");
//     } finally {
//       setStatusUpdatingId(null);
//     }
//   };

//   const handleApprove = async (id) => {
//     const token = localStorage.getItem("jwtToken");
//     const res = await fetch(`http://localhost:8080/api/complaints/${id}/approve`, {
//       method: "PUT",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     if (res.ok) {
//       const updated = await res.json();
//       setSelectedComplaint(updated);
//       await fetchOfficers();
//     }

//   };

//   const handleReject = async (id, reason) => {
//     const token = localStorage.getItem("jwtToken");
//     console.log("Reject token:", token);

//     if (!token) {
//       alert("Please login again - no token found");
//       return;
//     }
//     const res = await fetch(`http://localhost:8080/api/complaints/${id}/reject`, {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ reason }),
//     });
//     if (res.ok) {
//       const updated = await res.json();
//       setSelectedComplaint(updated);
//       await fetchOfficers();
//     }

//   };


//   useEffect(() => {
//     fetchOfficers();
//     fetchComplaints();
//   }, [departmentFilter]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Completed": return "border-l-emerald-500 bg-emerald-50/30";
//       case "Assigned": return "border-l-blue-500 bg-blue-50/30";
//       case "Resolved - Pending Review": return "border-l-amber-500 bg-amber-50/30";
//       case "Rejected": return "border-l-red-800 bg-red-500"
//       default: return "border-l-red-500 bg-red-50/30";
//     }
//   };

//   const getStatusBadgeColor = (status) => {
//     switch (status) {
//       case "Completed": return "bg-emerald-100 text-emerald-800";
//       case "Assigned": return "bg-blue-100 text-blue-800";
//       case "Resolved - Pending Review": return "bg-amber-100 text-amber-800";
//       case "Rejected": return "bg-red-800 text-white";
//       default: return "bg-red-100 text-red-800";
//     }
//   };

//   const departments = ["Electricity", "Roads", "Water", "Sanitation", "Agriculture"];
//   const pendingCount = complaints.filter(c => c.status === "Pending").length;
//   const resolvedCount = complaints.filter(c => c.status === "Completed").length;
//   const assignedCount = complaints.filter(c => c.status === "Assigned").length;
//   const totalCount = pendingCount + resolvedCount + assignedCount;

//   const sortedComplaints = [...complaints].sort((a, b) => {
//     if (sortBy === "status") {
//       const priorityA = STATUS_PRIORITY[a.status] || 99;
//       const priorityB = STATUS_PRIORITY[b.status] || 99;
//       if (priorityA !== priorityB) {
//         return priorityA - priorityB;
//       }
//       return b.id - a.id;
//     }
//     return b.id - a.id;
//   });

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
//       {/* Welcome Header */}
//       <div className="text-5xl text-black text-center mx-5 p-4 font-extrabold bg-linear-to-r from-red-100 via-blue-100 to-green-100 rounded-2xl mt-2">
//         <h2>Welcome, Admin</h2>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">

//         {/* Header & Stats  */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
//           <div>
//             <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
//             <p className="mt-1 text-slate-500">Overview of municipal operations and grievances.</p>
//           </div>

//           <div className="flex gap-4">
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
//               <p className="text-xs text-slate-400 font-medium uppercase">Total</p>
//               <div className="flex items-center gap-2">
//                 <FileText className="w-5 h-5 text-indigo-500" />
//                 <span className="text-2xl font-bold text-slate-700">{totalCount}</span>
//               </div>
//             </div>
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
//               <p className="text-xs text-slate-400 font-medium uppercase">Pending</p>
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="w-5 h-5 text-red-500" />
//                 <span className="text-2xl font-bold text-slate-700">{pendingCount}</span>
//               </div>
//             </div>
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
//               <p className="text-xs text-slate-400 font-medium uppercase">Assigned</p>
//               <div className="flex items-center gap-2">
//                 <UserCheck className="w-5 h-5 text-blue-500" />
//                 <span className="text-2xl font-bold text-slate-700">{assignedCount}</span>
//               </div>
//             </div>
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
//               <p className="text-xs text-slate-400 font-medium uppercase">Resolved</p>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-emerald-500" />
//                 <span className="text-2xl font-bold text-slate-700">{resolvedCount}</span>
//               </div>
//             </div>
//             {/* <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
//               <p className="text-xs text-slate-400 font-medium uppercase">Stats</p>
//               <div className="flex items-center gap-2">
//                 <TrendingUp className="w-5 h-5 text-emerald-500" />
//                 <span className="text-2xl font-bold text-slate-700">{resolvedCount}</span>
//               </div>
//             </div> */}
//           </div>
//         </div>


//         {/*  */}

//         {/*  */}

//         {/* Toolbar (UNCHANGED) */}
//         <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2 no-scrollbar">
//             <button
//               onClick={() => setDepartmentFilter("")}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${departmentFilter === "" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
//             >
//               All
//             </button>
//             {departments.map(dept => (
//               <button
//                 key={dept}
//                 onClick={() => setDepartmentFilter(dept)}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${departmentFilter === dept ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
//               >
//                 {dept}
//               </button>
//             ))}
//           </div>

//           <div className="flex items-center gap-2 w-full md:w-auto justify-end px-2">
//             <div className="relative group">
//               <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm text-sm font-semibold">
//                 <Layers className="w-4 h-4 text-slate-400" />
//                 {sortBy === "newest" ? "Newest First" : "By Status Priority"}
//                 <ChevronDown className="w-3 h-3 text-slate-400" />
//               </button>
//               <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 transform origin-top-right">
//                 <div className="p-1">
//                   <button
//                     onClick={() => setSortBy("newest")}
//                     className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortBy === "newest" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
//                   >
//                     Newest First
//                   </button>
//                   <button
//                     onClick={() => setSortBy("status")}
//                     className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortBy === "status" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
//                   >
//                     By Status Priority
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <button
//               onClick={fetchComplaints}
//               className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
//               title="Refresh Data"
//             >
//               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//             </button>
//           </div>
//         </div>

//         {/* Messages */}
//         {error && (
//           <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${error.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
//             <div className={`w-2 h-2 rounded-full ${error.includes("✅") ? "bg-green-500" : "bg-red-500"}`}></div>
//             <span className="font-medium">{error}</span>
//           </div>
//         )}

//         {/* Complaints Table */}
//         {loading ? (
//           <div className="grid place-items-center py-20">
//             <RefreshCw className="w-10 h-10 text-slate-300 animate-spin" />
//             <p className="mt-4 text-slate-400">Fetching latest data...</p>
//           </div>
//         ) : sortedComplaints.length === 0 ? (
//           <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
//             <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-slate-900">No complaints found</h3>
//             <p className="text-slate-500">Try changing the filter or refresh the dashboard.</p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-slate-50/50">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Officer</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {sortedComplaints.map((complaint) => (
//                     <tr
//                       key={complaint.id}
//                       className="hover:bg-slate-50/50 border-l-4 border-l-transparent hover:border-l-indigo-500 cursor-pointer transition-all group"
//                       onClick={() => {
//                         setSelectedComplaint(complaint);
//                         setIsModalOpen(true);
//                       }}
//                     >
//                       <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900 w-12">
//                         #{complaint.id}
//                       </td>
//                       <td>
//                         <div className={`text-center pb-1 rounded-full ${getStatusBadgeColor(complaint.status)}`}>
//                           <span className={`px-1 py-2  text-xs font-bold text-center`}>
//                             {complaint.status === "Pending" && <Clock className="w-3 h-3 inline mr-1" />}
//                             {complaint.status === "Completed" && <CheckCircle className="w-3 h-3 inline mr-1" />}
//                             {complaint.status}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm font-medium text-slate-900">
//                         {complaint.department || complaint.category}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-slate-700 max-w-md truncate" title={complaint.description}>
//                         {complaint.description}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-slate-600">
//                         <div className="flex items-center gap-1">
//                           <MapPin className="w-4 h-4" />
//                           {complaint.district || complaint.location}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm w-32">
//                         {complaint.officerId ? (
//                           <div className="text-center rounded-full bg-indigo-100 text-indigo-800 px-1 py-1 pb-1">
//                             <span className=" rounded-full text-xs font-semibold">
//                               {complaint.officerName}
//                             </span>
//                           </div>

//                         ) : (
//                           <span className="text-slate-400 text-xs italic">Unassigned</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setSelectedComplaint(complaint);
//                             setIsModalOpen(true);
//                           }}
//                           className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
//                         >
//                           Manage
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* MODAL WITH EXISTING CARD UI */}
//         {isModalOpen && selectedComplaint && (
//           <>
//             {/* Backdrop */}
//             <div
//               className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
//               onClick={() => {
//                 setIsModalOpen(false);
//                 setSelectedComplaint(null);
//               }}
//             />

//             {/* Modal */}
//             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//               <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300">
//                 {/* Header */}
//                 <div className="p-6 pb-2 border-b border-slate-200">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-3 rounded-2xl ${getStatusColor(selectedComplaint.status)}`}>
//                         <FileText className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <h2 className="text-2xl font-bold text-slate-900">#{selectedComplaint.id} - {selectedComplaint.department || selectedComplaint.category}</h2>
//                         <p className="text-slate-500">{selectedComplaint.district || selectedComplaint.location}</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setIsModalOpen(false);
//                         setSelectedComplaint(null);
//                       }}
//                       className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
//                     >
//                       <X className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* EXISTING CARD CONTENT (1:1 COPY) */}
//                 <div className="p-6 max-h-[70vh] overflow-y-auto">
//                   <div className={`group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 border-l-4 ${getStatusColor(selectedComplaint.status)}`}>

//                     {/* Card Header */}
//                     <div className="flex justify-between items-start mb-4">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
//                         #{selectedComplaint.id}
//                       </span>
//                       <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusBadgeColor(selectedComplaint.status)}`}>
//                         {selectedComplaint.status === "Pending" && <Clock className="w-3 h-3" />}
//                         {selectedComplaint.status === "Completed" && <CheckCircle className="w-3 h-3" />}
//                         {selectedComplaint.status}
//                       </div>
//                     </div>

//                     {/* Card Content */}
//                     <div className="mb-6">
//                       <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
//                         {selectedComplaint.department || selectedComplaint.category}
//                         <span className="w-1 h-1 rounded-full bg-slate-300"></span>
//                         <span className="flex items-center gap-1 text-slate-500 normal-case font-normal"><MapPin className="w-3 h-3" /> {selectedComplaint.district || selectedComplaint.location}</span>
//                       </h3>
//                       <h4 className="text-indigo-600">
//                         <span className="text-gray-500">Created At : </span>
//                         {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric',
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}</h4>
//                       {selectedComplaint.deadline ? (<h4 className="text-red-600">
//                         <span className="text-gray-500">Deadline : </span>
//                         {new Date(selectedComplaint.deadline).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric',
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}</h4>) : (<span className="text-red-600">No deadline set!</span>)
//                       }
//                       <p className="text-slate-800 font-medium leading-relaxed min-h-8">
//                         <span className="text-gray-500">Description : </span> {selectedComplaint.description}
//                       </p>

//                       {selectedComplaint.resolutionNotes ? (
//                         <p className="text-slate-800 font-medium leading-relaxed min-h-8">
//                           <span className="text-gray-500">Resolution Notes : </span>{selectedComplaint.resolutionNotes}
//                         </p>
//                       ) : (
//                         <p></p>
//                       )

//                       }

//                     </div>

//                     <div className="grid grid-cols-2 p-0.5 text-gray-700 text-sm gap-6">
//                       <p>Evidence :</p>
//                       <p>Work proof :</p>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       {/* Complaint Image */}
//                       <div className="h-32 w-full flex items-center justify-center border rounded-md bg-gray-50">
//                         {selectedComplaint.imagePath ? (
//                           <img src={selectedComplaint.imagePath} alt="" className="h-full w-full object-cover rounded-md" />
//                         ) : (
//                           <span className="text-gray-500 text-sm">No Image</span>
//                         )}
//                       </div>

//                       {/* Proof Image */}
//                       <div className="h-32 w-full flex items-center justify-center border rounded-md bg-gray-50">
//                         {selectedComplaint.proofImg ? (
//                           <img src={selectedComplaint.proofImg} alt="" className="h-full w-full object-cover rounded-md" />
//                         ) : (
//                           <span className="text-gray-500 text-sm">No Image</span>
//                         )}
//                       </div>
//                     </div>

//                     <hr className="border-slate-100 mb-4" />

//                     {/* Controls Section (UNCHANGED LOGIC) */}
//                     <div className="space-y-3">
//                       {selectedComplaint.approvalStatus === "PENDING" ? (
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={() => handleApprove(selectedComplaint.id)}
//                             className="px-4 py-2 text-xs bg-green-100 font-bold text-green-700 rounded hover:bg-green-200"
//                           >
//                             Accept
//                           </button>
//                           <button
//                             onClick={() => {
//                               const reason = prompt("Rejection reason:");
//                               if (reason !== null) handleReject(selectedComplaint.id, reason);
//                             }}
//                             className="px-4 py-2 text-xs font-bold bg-red-100 text-red-700 rounded hover:bg-red-200"
//                           >
//                             Reject
//                           </button>
//                         </div>
//                       ) : (
//                         <span className="text-xs px-2 py-1 rounded-full 
//                               {g.approvalStatus === 'APPROVED'
//                             ? 'bg-green-100 text-green-700'
//                               : 'bg-red-100 text-red-700'}">
//                           {selectedComplaint.approvalStatus}
//                         </span>
//                       )}
//                       {/* Officer Assignment */}
//                       <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors">
//                         <div className="flex items-center gap-3 overflow-hidden">
//                           <div className={`p-2 rounded-full ${selectedComplaint.officerId ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
//                             <User className="w-4 h-4" />
//                           </div>
//                           <div className="flex flex-col">
//                             <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Officer</span>
//                             {selectedComplaint.officerId ? (
//                               <span className="text-xs font-bold text-indigo-900 truncate">{selectedComplaint.officerName}</span>
//                             ) : (
//                               <span className="text-xs font-medium text-slate-500 italic">Unassigned</span>
//                             )}
//                           </div>
//                         </div>

//                         {!selectedComplaint.officerId && (
//                           <div className="flex flex-row gap-3 items-center">

//                             <select
//                               value={selectedOfficerId}
//                               onChange={(e) => setSelectedOfficerId(e.target.value)}
//                               disabled={assigningComplaintId === selectedComplaint.id}
//                               className="px-4 py-1 border border-slate-300 rounded-lg text-xs"
//                             >
//                               <option value="">Choose officer...</option>
//                               {officers.map(o => (
//                                 <option key={o.id} value={o.id}>
//                                   {o.name} ({o.department})
//                                 </option>
//                               ))}
//                             </select>

//                             <DatePicker
//                               selected={selectedDate}
//                               onChange={(date) => setSelectedDate(date)}
//                               dateFormat="yyyy-MM-dd"
//                               minDate={new Date()}
//                               className="w-28 px-4 py-1 border border-gray-300 rounded-lg"
//                             />

//                             <button
//                               onClick={() => {
//                                 if (!selectedOfficerId || !selectedDate) {
//                                   alert("Please select officer and deadline");
//                                   return;
//                                 }
//                                 handleAssignOfficer(selectedComplaint.id, selectedOfficerId);
//                               }}
//                               className="px-4 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
//                             >
//                               Done
//                             </button>

//                           </div>
//                         )}

//                       </div>

//                       {/* Status Update Control */}
//                       <div className="flex items-center justify-between">
//                         <label className="text-xs font-semibold text-slate-400">Update Status</label>
//                         <div className="relative">
//                           <select
//                             value={selectedComplaint.status}
//                             onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
//                             disabled={statusUpdatingId === selectedComplaint.id}
//                             className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-indigo-300 transition-all"
//                           >
//                             {STATUSES.map(s => (
//                               <option key={s} value={s}>{s}</option>
//                             ))}
//                           </select>
//                           <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useEffect, useState } from "react";
import {
  FileText, RefreshCw, CheckCircle, Clock,
  AlertCircle, MapPin, User, ChevronDown, Layers, UserCheck, X,
  TrendingUp, Menu, PieChart, Map, Settings, List, LogOut
} from "react-feather";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import AdminStats from "./AdminStats";
import { div, main } from "framer-motion/client";


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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [assigningComplaintId, setAssigningComplaintId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);


  // Constants for counts
  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const resolvedCount = complaints.filter(c => c.status === "Completed").length;
  const rejectedCount = complaints.filter(c => c.status === "REJECTED").length;
  const assignedCount = complaints.filter(c => c.status === "Assigned" || c.status === "Resolved - Pending Review").length;
  const totalCount = complaints.length;
  const satisfactionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 1000) / 10 : 0;

  // const complaints = [ /* your API response array */ ];

  const groupedData = complaints.reduce((acc, complaint) => {
    const { citizenId } = complaint;
    if (!acc[citizenId]) {
      acc[citizenId] = {
        id: citizenId,
        name: complaint.citizenName || `Citizen #${citizenId}`, // Fallback if name is null
        list: []
      };
    }
    acc[citizenId].list.push(complaint);
    return acc;
  }, {});

  // Convert object back to array for easy mapping
  const displayList = Object.values(groupedData);


  const token = localStorage.getItem("jwtToken");
  const navigate = useNavigate();

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

  const handleLogout = () => {
    navigate('/login');
  };


  useEffect(() => {
    fetchOfficers();
    fetchComplaints();
  }, [departmentFilter]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-800";
      case "Assigned": return "bg-blue-100 text-blue-800";
      case "Resolved - Pending Review": return "bg-amber-100 text-amber-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case "Completed": return "border-l-emerald-500";
      case "Assigned": return "border-l-blue-500";
      case "Resolved - Pending Review": return "border-l-amber-500";
      default: return "border-l-red-500";
    }
  };

  const departments = ["Electricity", "Roads", "Water", "Sanitation", "Agriculture"];
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
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CivicPulse</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => setActiveView("dashboard")}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all
      ${activeView === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
          >
            <List className="w-5 h-5" />
            Dashboard
          </button>

          {/* Stats */}
          <button
            onClick={() => setActiveView("stats")}
            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all
      ${activeView === "stats"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
          >
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5" />
              Stats
            </div>

            <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">
              New
            </span>
          </button>

          <button
            onClick={() => setActiveView("users")}
            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all
      ${activeView === "users"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              Users
            </div>

            <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">
              New
            </span>
          </button>

          <button
            onClick={() => handleLogout()}
            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all hover:bg-indigo-600 hover:text-white`}
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              Logout
            </div>
          </button>
        </nav>

      </aside>

      {/* MAIN CONTENT */}
      {activeView === "dashboard" && (
        <>
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
              <button onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6 text-slate-600" /></button>
              <span className="font-bold text-slate-900">CivicPulse</span>
              <div className="w-6" />
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mb-8 p-6 bg-linear-to-r from-red-100 via-blue-100 to-green-100 rounded-2xl text-white shadow-xl">
                <h2 className="text-3xl font-extrabold text-black">Welcome back, Admin</h2>
                <p className="text-slate-600 mt-1">Here is what's happening in the municipality today.</p>
              </div>

              {/* Stats Row */}
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">
                {[
                  { label: "Total", val: totalCount, icon: FileText, color: "text-indigo-500" },
                  { label: "Pending", val: pendingCount, icon: AlertCircle, color: "text-red-500" },
                  { label: "Assigned", val: assignedCount, icon: UserCheck, color: "text-blue-500" },
                  { label: "Resolved", val: resolvedCount, icon: CheckCircle, color: "text-emerald-500" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 min-w-40 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-2xl font-bold text-slate-800">{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>
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

              {/* Table Container */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Grievance</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">#{complaint.id}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getStatusBadgeColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-800">{complaint.category}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{complaint.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {complaint.district}
                            </p>                      </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setSelectedComplaint(complaint); setIsModalOpen(true); }}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
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
            </div>

            {/* --- MANAGEMENT MODAL --- */}
            {isModalOpen && selectedComplaint && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                  onClick={() => setIsModalOpen(false)}
                />

                {/* Modal Box */}
                <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

                  {/* Header */}
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 p-3 rounded-2xl">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Case #{selectedComplaint.id}</h3>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {selectedComplaint.district || selectedComplaint.location}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className={`p-6 rounded-2xl bg-white border border-slate-100 border-l-8 ${getStatusBorderColor(selectedComplaint.status)} shadow-sm`}>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedComplaint.department}</span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeColor(selectedComplaint.status)}`}>
                          {selectedComplaint.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                          <p className="text-slate-700 text-sm leading-relaxed mb-4">{selectedComplaint.description}</p>

                          {selectedComplaint.resolutionNotes && (
                            <>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Resolution Notes</h4>
                              <p className="text-slate-700 text-sm leading-relaxed">{selectedComplaint.resolutionNotes}</p>
                            </>
                          )

                          }

                          <div className="mt-6 flex gap-4 text-xs font-medium">
                            <div className="text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                              Created: {format(new Date(selectedComplaint.createdAt), "dd MMM yyyy, hh:mm a")}
                            </div>
                            {selectedComplaint.deadline && (
                              <div className="text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                Deadline: {format(new Date(selectedComplaint.deadline), "dd MMM yyyy")}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Visual Evidence</h4>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Work Evidence</h4>

                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                              {selectedComplaint.imagePath ? (
                                <img src={selectedComplaint.imagePath} className="w-full h-full object-cover" alt="Evidence" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 uppercase">No Image</span>
                              )}
                            </div>
                            <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                              {selectedComplaint.proofImg ? (
                                <img src={selectedComplaint.proofImg} className="w-full h-full object-cover" alt="Proof" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Work Proof</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Assignment Box */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <User className="w-3 h-3" /> Officer Assignment
                        </h4>
                        {!selectedComplaint.officerId ? (
                          <div className="space-y-4">
                            <select
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={selectedOfficerId}
                              onChange={(e) => setSelectedOfficerId(e.target.value)}
                            >
                              <option value="">Select an officer...</option>
                              {officers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.department})</option>)}
                            </select>
                            <div className="flex gap-2">
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                                placeholderText="Set Deadline"
                                minDate={new Date()}
                              />
                              <button
                                onClick={() => handleAssignOfficer(selectedComplaint.id, selectedOfficerId)}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                              >
                                Assign
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                              {selectedComplaint.officerName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{selectedComplaint.officerName}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Assigned Personnel</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Controls Box */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Verification & Status</h4>
                        <div className="space-y-4">
                          {selectedComplaint.approvalStatus === "PENDING" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(selectedComplaint.id)} className="flex-1 bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all">Accept Case</button>
                              <button onClick={() => {
                                const reason = prompt("Reason for rejection:");
                                if (reason) handleReject(selectedComplaint.id, reason);
                              }} className="flex-1 bg-red-100 text-red-700 py-2.5 rounded-xl text-xs font-bold hover:bg-red-200 transition-all">Reject Case</button>
                            </div>
                          )}

                          <div className="relative">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 px-1 uppercase">Update Workflow Status</label>
                            <select
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none"
                              value={selectedComplaint.status}
                              onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                            >
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-9 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      )}
      {activeView === "stats" && (
        <main className="flex-1 flex flex-col min-w-0 overflow-scroll relative">
          <AdminStats
            PendingComplaints={pendingCount}
            inProgressComplaints={assignedCount}
            resolvedComplaints={resolvedCount}
            RejectedComplaints={rejectedCount}
            totalComplaints={totalCount}
            satisfactionRate={satisfactionRate}
          />
        </main>
      )}

      {activeView === "users" && (
        <div className="flex-1 flex flex-col min-w-0 overflow-scroll relative">

          {displayList.map(user => (
            <div key={user.id} style={{ border: '3px solid #ddd', margin: '10px', padding: '15px' }} className="rounded-2xl">
              {/* User Header */}
              <h2 className="font-extrabold text-white mb-3">
                <span className="bg-indigo-950 p-2 rounded-xl ">User : {user.name} </span>
              </h2>

              {/* Complaints Table for this User */}
              <table width="100%" style={{ textAlign: 'left', marginTop: '10px' }}>
                <thead className="border-b-indigo-400 border-b-2">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">District</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.list.map(item => (
                    <tr key={item.id}>
                      <td className="p-2">{item.id}</td>
                      <td className="p-2"><strong>{item.category}</strong></td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.district}</td>
                      <td className="p-2">
                        <span className={`badge-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          </div>
      )

        
      }
    </div>
  );
};

export default AdminDashboard;