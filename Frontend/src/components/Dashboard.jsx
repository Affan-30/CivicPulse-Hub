import React, { useEffect, useState } from "react";
import { FileText, CheckCircle, TrendingUp, Plus, AlertCircle, Target, MessageSquare, Bell, RefreshCw, Clock, } from "react-feather";
import RegisterGrievance from "./RegisterGrievance";
import Navbar from "./Navbar";
import AdminDashboard from "./AdminDashboard";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // All existing state and logic remains exactly the same
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [activeSection, setActiveSection] = useState('stats'); // New: Track active section
  const [notifications, setNotifications] = useState([]); // New: For notifications

  const token = localStorage.getItem("jwtToken");
  const userName = localStorage.getItem("userName") || "USER";

  // All existing calculations remain the same
  const totalComplaints = grievances.length;
  const resolvedComplaints = grievances.filter((g) => g.status === "Completed" || g.status === "Resolved").length;
  const inProgressComplaints = grievances.filter((g) => g.status === "Assigned" || g.status === "Resolved - Pending Review").length;
  const RejectedComplaints = grievances.filter((g) => g.approvalStatus === "REJECTED").length;
  const PendingComplaints = grievances.filter((g) => g.status === "Pending").length;
  const satisfactionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 1000) / 10 : 0;

  const StatCard = ({ title, value, icon: Icon, color, rotate }) => (
    <div className={`flex items-center justify-between border-2 
                   border-fuchsia-200 rounded-2xl p-4`}>
      <div className={`p-3 sm:p-4 rounded-2xl bg-fuchsia-100`}>
        <Icon
          className={`w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-600 ${rotate ? "rotate-45" : ""
            }`}
        />
      </div>
      <div className="text-right">
        <p className={`text-lg sm:text-xl font-black 
                     bg-linear-to-r from-fuchsia-600 to-fuchsia-700 
                     bg-clip-text text-transparent`}>
          {title}
        </p>
        <p className={`text-xl sm:text-2xl font-extrabold text-fuchsia-600`}>
          {value}
        </p>
      </div>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl 
                  p-4 sm:p-6 lg:p-8 
                  shadow-2xl border border-white/50 
                  transition-all duration-500 hover:-translate-y-1">
      <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-center mb-6">
        {title}
      </h3>
      {children}
    </div>
  );


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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/complaints/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Failed to Delete Complaint");
      }
    } catch (err) {
      console.error("Error deleting complaint:", err);
    }
  };

  const handleReopen = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/complaints/${id}/reopen`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const text = await res.text();
        setLoadError(text || "Failed to reopen your grievances");
        alert("Failed to reopen your grievance");
        return;
      }
      const data = await res.json();
      console.log("Re-Open Complaint : " + data);
    } catch (e) {
      console.log(e);
    }
  };

  const submitRating = async (id, rating, feedback) => {
    try {
      const response = await fetch(`http://localhost:8080/api/complaints/${id}/rating`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, feedback })
      });
      if (response.ok) {
        setFeedbackOpen(false);
        setSelectedComplaint(null);
        setRating(0);
        console.log("Ratings given : " + rating);
        console.log("Feedback provided : " + feedback);
      }
    } catch (error) {
      console.error('Failed to submit rating', error);
    }
  };

  // Existing useEffect remains the same
  useEffect(() => {
    if (!token) return;
    const fetchMyComplaints = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch("http://localhost:8080/api/complaints/my", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const text = await res.text();
          setLoadError(text || "Failed to load your grievances");
          return;
        }
        const data = await res.json();
        setGrievances(data.map((c) => ({
          id: c.id,
          department: c.category,
          description: c.description,
          status: c.status,
          date: c.createdAt?.substring(0, 10) || "",
          imagePath: c.imagePath || null,
          resolutionNotes: c.resolutionNotes || null,
          feedback: c.feedback || null,
          proofImg: c.proofImg || null,
          deadline: c.deadline || null,
          approvalStatus: c.approvalStatus || null,
          approvalReason: c.approvalReason || null,
          rating: c.rating || null,
        })));
      } catch (err) {
        console.error(err);
        setLoadError("Something went wrong while loading your grievances.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, [token]);

  const statsData = [
    { title: "Total Complaints", value: totalComplaints, icon: FileText, color: "fuchsia" },
    { title: "Pending", value: PendingComplaints, icon: Target, color: "orange" },
    { title: "In Progress", value: inProgressComplaints, icon: Target, color: "blue" },
    { title: "Resolved", value: resolvedComplaints, icon: CheckCircle, color: "green" },
    { title: "Rejected", value: RejectedComplaints, icon: Target, color: "red" },
    { title: "Satisfaction", value: `${satisfactionRate}%`, icon: TrendingUp, color: "fuchsia" }
  ];

  return (
    <div className="mainbg min-h-screen bg-linear-to-br from-orange-50 via-white to-green-50 py-10">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-7">

        {/* Welcome Banner */}
        <div className="rounded-lg p-4 md:p-6 mb-0">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4">

            {/* Image */}
            <img
              src="/src/assets/hub-logo.png"
              alt="India"
              className="w-50 h-20 md:w-40 md:h-40 object-contain"
            />

            {/* Text Content */}
            <div className="text-center md:pr-96">
              <h2 className="text-lg md:text-3xl font-bold text-gray-800 mb-2 bg-amber-500 rounded-full px-4 py-2 inline-block">
                Welcome, {userName}!
              </h2>
              <p className="text-gray-600 text-xs md:text-base">
                We are here to serve you and resolve your grievances
              </p>
            </div>

          </div>
        </div>

        <div className="mb-4 bg-transparent backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-lg">
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {[
              { id: 'stats', label: 'Stats', icon: TrendingUp },
              { id: 'lodge', label: 'Lodge Grievance', icon: Plus },
              { id: 'grievances', label: 'My Grievances', icon: FileText },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`
          flex items-center justify-center gap-2
          w-[48%] sm:w-auto
          px-3 py-2
          rounded-xl font-semibold
          text-sm md:text-base
          transition-all duration-300
          ${activeSection === id
                    ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'}
        `}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>


        <section
          className={`transition-all duration-500 ${activeSection === "stats" ? "block" : "hidden"
            }`}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl 
                  p-4 sm:p-6 lg:p-8 
                  border border-orange-100 mb-6 sm:mb-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold 
                     bg-linear-to-r from-orange-600 to-orange-500 
                     bg-clip-text text-transparent">
                Dashboard Overview
              </h2>
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 
                            hover:rotate-180 transition-transform duration-300 cursor-pointer" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

              {/* Total */}

              <div className={`flex items-center justify-between border-2 
                   border-fuchsia-200 rounded-2xl p-4`}>
                <div className={`p-3 sm:p-4 rounded-2xl bg-fuchsia-100`}>
                  <FileText
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-600 `}
                  />
                </div>
                <div className="text-right">
                  <p className={`text-lg sm:text-xl font-black 
                     bg-linear-to-r from-fuchsia-600 to-fuchsia-700 
                     bg-clip-text text-transparent`}>
                    Total Complaints                  </p>
                  <p className={`text-xl sm:text-2xl font-extrabold text-fuchsia-600`}>
                    {totalComplaints}
                  </p>
                </div>
              </div>

              {/* Pending */}
              <div className={`flex items-center justify-between border-2 
                   border-orange-200 rounded-2xl p-4`}>
                <div className={`p-3 sm:p-4 rounded-2xl bg-orange-100`}>
                  <Clock
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-orange-600 `}
                  />
                </div>
                <div className="text-right">
                  <p className={`text-lg sm:text-xl font-black 
                     bg-linear-to-r from-orange-600 to-orange-700 
                     bg-clip-text text-transparent`}>
                    Pending Complaints                 </p>
                  <p className={`text-xl sm:text-2xl font-extrabold text-orange-600`}>
                    {PendingComplaints}
                  </p>
                </div>
              </div>

              {/* In Progress */}
              <div className={`flex items-center justify-between border-2 
                   border-blue-200 rounded-2xl p-4`}>
                <div className={`p-3 sm:p-4 rounded-2xl bg-blue-100`}>
                  <Target
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-blue-600 `}
                  />
                </div>
                <div className="text-right">
                  <p className={`text-lg sm:text-xl font-black 
                     bg-linear-to-r from-blue-600 to-blue-700 
                     bg-clip-text text-transparent`}>
                    Complaints In Progress              </p>
                  <p className={`text-xl sm:text-2xl font-extrabold text-blue-600`}>
                    {inProgressComplaints}
                  </p>
                </div>
              </div>

              {/* Resolved */}
              <div className={`flex items-center justify-between border-2 
                   border-green-200 rounded-2xl p-4`}>
                <div className={`p-3 sm:p-4 rounded-2xl bg-green-100`}>
                  <CheckCircle
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-green-600 `}
                  />
                </div>
                <div className="text-right">
                  <p className={`text-lg sm:text-xl font-black 
                     bg-linear-to-r from-green-600 to-green-700 
                     bg-clip-text text-transparent`}>
                    Resolved Complaints              </p>
                  <p className={`text-xl sm:text-2xl font-extrabold text-green-600`}>
                    {resolvedComplaints}
                  </p>
                </div>
              </div>

              {/* Rejected */}
              <div className={`flex items-center justify-between border-2 
                   border-red-200 rounded-2xl p-4`}>
                <div className={`p-3 sm:p-4 rounded-2xl bg-red-100`}>
                  <Plus
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-red-600 rotate-45`}
                  />
                </div>
                <div className="text-right">
                  <p className={`text-lg sm:text-xl font-black 
                     bg-linear-to-r from-red-600 to-red-700 
                     bg-clip-text text-transparent`}>
                    Rejected Complaints              </p>
                  <p className={`text-xl sm:text-2xl font-extrabold text-red-600`}>
                    {RejectedComplaints}
                  </p>
                </div>
              </div>

              {/* Satisfaction */}
              <div className={`flex items-center justify-between border-2 
                   border-fuchsia-200 rounded-2xl p-4`}>
                <div className={`p-3 sm:p-4 rounded-2xl bg-fuchsia-100`}>
                  <TrendingUp
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-600`}
                  />
                </div>
                <div className="text-right">
                  <p className={`text-lg sm:text-xl font-black 
                     bg-linear-to-r from-fuchsia-600 to-fuchsia-700 
                     bg-clip-text text-transparent`}>
                    Satisfaction Rate             </p>
                  <p className={`text-xl sm:text-2xl font-extrabold text-fuchsia-600`}>
                    {satisfactionRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 
                    mt-8 sm:mt-12 pt-8 sm:pt-12 
                    border-t border-orange-100/50 
                    bg-linear-to-b from-slate-50/80 to-white/80 
                    backdrop-blur-sm rounded-3xl 
                    p-4 sm:p-6 lg:p-8">

              {/* Status Distribution */}
              <ChartCard title="Status Distribution" gradient="blue">
                <div className="max-w-xs mx-auto">
                  <Doughnut
                    data={statusPieData}
                    options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 13, weight: '600' }, color: '#1f2937' } } }, cutout: '0%', animation: { animateRotate: true, duration: 2000 } }} />
                </div>
              </ChartCard>

              {/* Status Comparison */}
              <ChartCard title="Status Comparison" gradient="purple">
                <Bar data={barChartData} />
              </ChartCard>

              {/* Satisfaction */}
              <ChartCard title="Satisfaction Rate" gradient="emerald">
                <div className="relative max-w-xs mx-auto">
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
                    <span className="text-xl sm:text-2xl font-black 
                             bg-linear-to-r from-emerald-600 to-teal-600 
                             bg-clip-text text-transparent">
                      {satisfactionRate}%
                    </span>
                  </div>
                </div>
              </ChartCard>

            </div>
          </div>
        </section>



        {/* 2. Lodge Grievance Section */}

        <section
          className={`transition-all duration-500 ${activeSection === "lodge" ? "block" : "hidden"
            }`}
        >
          <div
            className="bg-linear-to-r from-emerald-50 to-blue-50 
               rounded-xl shadow-2xl 
               p-4 sm:p-6 lg:p-8 
               text-center 
               border-2 sm:border-4 border-dashed border-blue-200"
          >
            <div className="max-w-xl sm:max-w-2xl mx-auto">

              {/* Icon */}
              <Plus
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 
                   text-blue-500 mx-auto mb-6 sm:mb-8 animate-pulse"
              />

              {/* Heading */}
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-black 
                   bg-linear-to-r from-emerald-600 via-blue-600 to-purple-600 
                   bg-clip-text text-transparent mb-4 sm:mb-6"
              >
                Ready to Report?
              </h2>

              {/* Description */}
              <p
                className="text-base  sm:text-lg lg:text-xl 
                   text-gray-700 mb-8 sm:mb-12 
                   leading-relaxed"
              >
                Lodge a new grievance and our team will work tirelessly to resolve it
                within the stipulated time frame.
              </p>

              {/* Button */}
              <button
                onClick={complaintForm}
                className="group relative 
                   bg-linear-to-r from-orange-500 via-red-500 to-orange-600 
                   text-white 
                   px-6 sm:px-8 py-3 sm:py-4 
                   rounded-2xl sm:rounded-3xl 
                   text-lg sm:text-xl lg:text-2xl 
                   font-black 
                   shadow-2xl hover:shadow-3xl 
                   hover:scale-105 hover:-translate-y-1 sm:hover:-translate-y-2 
                   transition-all duration-500 
                   flex items-center gap-2 sm:gap-4 
                   mx-auto overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 group-hover:scale-110 transition-transform" />
                  Lodge New Grievance
                </span>

                {/* Shine Effect */}
                <div
                  className="absolute inset-0 
                     bg-linear-to-r from-white/20 to-transparent 
                     -skew-x-12 -translate-x-24 
                     group-hover:translate-x-64 
                     transition-transform duration-700"
                />
              </button>

            </div>
          </div>
        </section>


        {/* 3. My Grievances Section */}

        <section className={`transition-all duration-500 ${activeSection === 'grievances' ? 'block' : 'hidden'}`}>
          {/* Adjusted padding for mobile (p-4) vs laptop (p-8) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-8 border-t-8 border-orange-500">
            {loadError && (
              <div className="mb-8 p-6 rounded-2xl border-2 border-red-200 bg-red-50 text-red-800 text-center">
                {loadError}
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
                <FileText className="w-8 h-8 md:w-10 md:h-10" />
                Your Grievances ({totalComplaints})
              </h2>
              <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-orange-500 hover:rotate-180 transition-all cursor-pointer" />
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
                <p className="mt-4 text-xl text-gray-500">Loading your grievances...</p>
              </div>
            ) : grievances.length === 0 ? (
              <div className="text-center py-20">
                <AlertCircle className="w-24 h-24 text-gray-300 mx-auto mb-8 animate-bounce" />
                <h3 className="text-2xl font-bold text-gray-500 mb-2">No grievances yet</h3>
                <p className="text-gray-400">Start by lodging your first complaint above 👆</p>
              </div>
            ) : (
              /* MOBILE: Block layout | LAPTOP: Table layout */
              <div className="w-full">
                <table className="w-full block md:table">
                  {/* Hide header on mobile, show on laptop */}
                  <thead className="hidden md:table-header-group bg-linear-to-r from-orange-100 to-orange-50 rounded-2xl border-2 border-orange-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Image</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Proof</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-orange-100 block md:table-row-group">
                    {grievances.map((g) => (
                      /* MOBILE: Card-like container | LAPTOP: Standard row */
                      <tr key={g.id} className={`
                flex flex-col md:table-row 
                mb-6 md:mb-0 
                p-4 md:p-0 
                rounded-2xl md:rounded-none 
                shadow-md md:shadow-none 
                bg-white md:bg-transparent 
                border-2 md:border-0 
                ${g.approvalStatus === "REJECTED" ? "border-red-200 bg-red-50/30" : "border-orange-100"}
                hover:bg-orange-50/50 transition-all group
              `}>

                        {/* ID Field */}
                        <td className="flex justify-between items-center md:table-cell px-2 md:px-6 py-2 md:py-4 text-sm font-semibold text-gray-900 group-hover:text-orange-700 before:content-['ID'] md:before:content-none before:text-gray-400 before:font-medium">
                          #{g.id}
                        </td>

                        {/* Department */}
                        <td className="flex justify-between items-center md:table-cell px-2 md:px-6 py-2 md:py-4 text-sm text-gray-800 before:content-['Department'] md:before:content-none before:text-gray-400 before:font-medium">
                          {g.department}
                        </td>

                        {/* Description - Multi-line on mobile */}
                        <td className="flex flex-col md:table-cell px-2 md:px-6 py-2 md:py-4 text-sm text-gray-800 md:max-w-xs border-b md:border-0 border-gray-100 mb-2 md:mb-0">
                          <span className="md:hidden text-gray-400 font-medium mb-1">Description:</span>
                          <div className="line-clamp-3 md:line-clamp-none">{g.description}</div>
                        </td>

                        {/* Image */}
                        <td className="flex justify-between items-center md:table-cell px-2 md:px-6 py-2 md:py-4 before:content-['Evidence'] md:before:content-none before:text-gray-400 before:font-medium">
                          {g.imagePath ? (
                            <img src={g.imagePath} alt="evidence" className="h-12 w-24 md:h-16 md:w-32 object-cover rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer" />
                          ) : (
                            <span className="text-gray-400 text-xs bg-gray-100 px-3 py-1 rounded-full">No image</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="flex justify-between items-center md:table-cell px-2 md:px-6 py-2 md:py-4 text-sm font-medium text-gray-800 before:content-['Date'] md:before:content-none before:text-gray-400 before:font-medium">
                          {g.date}
                        </td>

                        {/* Status */}
                        <td className="flex flex-col md:table-cell px-2 md:px-6 py-4">
                          <span className="md:hidden text-gray-400 font-medium mb-2 text-center">Current Status</span>
                          <div className="flex flex-col items-center gap-2">
                            {g.approvalStatus !== "REJECTED" && (
                              <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${g.status === "Resolved" || g.status === "Completed"
                                ? "bg-green-100 text-green-800 border-2 border-green-200"
                                : g.status === "In Progress" || g.status === "Assigned"
                                  ? "bg-blue-100 text-blue-800 border-2 border-blue-200"
                                  : "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
                                }`}>
                                {g.status}
                              </div>
                            )}
                            {g.approvalStatus === "REJECTED" && (
                              <div className="px-4 py-3 rounded-xl text-xs font-black text-red-800 bg-red-100 border-2 border-red-400 shadow-lg text-center">
                                <div>🚫 REJECTED</div>
                                <span className="text-red-900 block mt-1">{g.approvalReason}</span>
                              </div>
                            )}
                            {g.status === "Completed" && g.resolutionNotes && (
                              <div className="px-3 py-2 rounded-lg text-xs text-gray-800 bg-orange-100 border border-orange-300 max-w-xs text-center">
                                {g.resolutionNotes}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Proof */}
                        <td className="flex justify-between items-center md:table-cell px-2 md:px-6 py-2 md:py-4 text-center before:content-['Proof'] md:before:content-none before:text-gray-400 before:font-medium">
                          {g.proofImg ? (
                            <img
                              src={g.proofImg}
                              alt="proof"
                              className="h-12 w-24 md:h-16 md:w-32 object-cover rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(g.proofImg, "_blank")}
                            />
                          ) : (
                            <span className="text-gray-400 text-xs px-3 py-1 bg-gray-100 rounded-full">No proof</span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="flex flex-col md:table-cell px-2 md:px-6 py-4 bg-orange-50/30 md:bg-transparent rounded-b-2xl md:rounded-none mt-2 md:mt-0">
                          <span className="md:hidden text-gray-400 font-medium mb-3 text-center uppercase text-[10px] tracking-widest">Available Actions</span>
                          <div className="w-full flex justify-center">
                            {g.status === "Completed" ? (
                              g.feedback ? (
                                <div className="flex flex-col items-center gap-3 p-3 bg-green-50 rounded-xl w-full max-w-xs">
                                  {g.rating && (
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} viewBox="0 0 24 24" className={`w-5 h-5 ${star <= g.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor">
                                          <path d="M12 .587l3.668 7.428 8.332 1.213-6 5.828-1.484 7.276L12 21.113l-6.516 3.414-1.484-7.276-6-5.828 8.332-1.213L12 .587z" />
                                        </svg>
                                      ))}
                                      <span className="text-xs text-gray-500 ml-1">{g.rating}/5</span>
                                    </div>
                                  )}
                                  <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium text-center">{g.feedback}</span>
                                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-all" onClick={() => handleReopen(g.id)}>
                                    Re-Open
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setSelectedComplaint(g); setFeedbackOpen(true); }}
                                  className="flex items-center justify-center gap-2 w-full max-w-xs px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Rate & Feedback
                                </button>
                              )
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-sm w-full max-w-xs">
                                {g.approvalStatus === "REJECTED" && (
                                  <button
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                                    onClick={() => handleDelete(g.id)}
                                  >
                                    Delete Case
                                  </button>
                                )}
                                {g.approvalStatus !== "REJECTED" && (
                                  <div className="text-center w-full">
                                    <div className="font-semibold text-gray-700 mb-2">Deadline: {g.deadline || "None"}</div>
                                    {g.deadline && isOverdue(g.deadline) && (
                                      <div className="bg-red-100 p-3 rounded-xl border-2 border-red-300">
                                        <p className="text-red-700 font-bold text-sm mb-2">⏰ Overdue!</p>
                                        <button
                                          onClick={() => handleReopen(g.id)}
                                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-sm shadow-lg transition-all"
                                        >
                                          Re-Open Case
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Rating Modal */}
      {feedbackOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md p-7 shadow-3xl max-h-[90vh] overflow-y-auto border border-white/50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-black bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Rate the Resolution</h2>
                <p className="text-sm text-gray-500 mt-1">Complaint #{selectedComplaint.id}</p>
              </div>
              <button
                onClick={() => { setFeedbackOpen(false); setSelectedComplaint(null); setFeedbackText(""); setRating(0); }}
                className="p-2 -m-2 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-lg font-semibold text-gray-800 mb-2">How would you rate the resolution?</label>
              <div className="flex items-center justify-center gap-2 mb-4">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${star <= rating ? "bg-yellow-200 text-white shadow-lg" : "bg-gray-200 text-gray-500 hover:bg-yellow-200"
                      }`}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className={`text-center text-lg font-semibold ${rating ? 'text-yellow-700' : 'text-gray-500'}`}>
                {rating ? `${rating} star${rating > 1 ? 's' : ''}` : 'Please select a rating'}
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-800 mb-2">Additional feedback (optional)</label>
              <textarea
                rows="2"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about the resolution process..."
                className="w-full border border-gray-300 rounded-2xl p-5 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-vertical transition-all shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-4 pt-0 border-t border-gray-200">
              <button
                onClick={() => { setFeedbackOpen(false); setSelectedComplaint(null); setFeedbackText(""); setRating(0); }}
                className="px-4 py-1.5 text-lg font-semibold text-gray-700 rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => submitRating(selectedComplaint.id, rating, feedbackText)}
                disabled={!rating || rating === 0}
                className="px-4 py-1.5 text-sm font-bold text-white rounded-xl bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all disabled:shadow-none"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
