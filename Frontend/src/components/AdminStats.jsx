// import React, { useState } from 'react'
import { Layers, ChevronDown, RefreshCw, FileText, PieChart } from 'react-feather'
import { Doughnut, Bar } from "react-chartjs-2";

import ComplaintsLineCharts from './ComplaintsLineCharts';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import React from 'react';
import { div } from 'framer-motion/client';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);


const AdminStats = ({PendingComplaints,
  inProgressComplaints,
  resolvedComplaints,
  RejectedComplaints,
  totalComplaints,
  satisfactionRate}) => {
    //   const [complaints, setComplaints] = useState([]);
//       const totalComplaints = complaints.length;
//   const resolvedComplaints = complaints.filter((g) => g.status === "Completed" || g.status === "Resolved").length;
//   const inProgressComplaints = complaints.filter((g) => g.status === "Assigned" || g.status === "Resolved - Pending Review").length;
//   const RejectedComplaints = complaints.filter((g) => g.approvalStatus === "REJECTED").length;
//   const PendingComplaints = complaints.filter((g) => g.status === "Pending").length;
//   const satisfactionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 1000) / 10 : 0;


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

  return (
    <div className='mt-8 mr-2 ml-4'>
      <div className="bg-white rounded-3xl p-4 flex items-center justify-center shadow-sm border border-slate-200 transition-all hover:shadow-md">
         <ComplaintsLineCharts />
      </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      
      {/* 1. Status Distribution - Doughnut Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Status Distribution</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time breakdown of all cases</p>
          </div>
          <div className="bg-indigo-50 p-2 rounded-xl">
             <PieChart className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        
        <div className="relative flex justify-center max-h-[300px]">
          <Doughnut
            data={statusPieData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    padding: 25,
                    font: { size: 12, weight: '600', family: 'Inter' },
                    color: '#64748b' // slate-500
                  }
                }
              },
              cutout: '75%',
              animation: { animateRotate: true, duration: 2000 }
            }}
          />
        </div>
      </div>

      {/* 2. Complaints Trend - Line Chart */}
      {/* Assuming ComplaintsLineCharts is already styled, we wrap it for consistency */}
      

      {/* 3. Status Comparison - Bar Chart */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Volume Comparison</h3>
            <p className="text-xs text-slate-500 font-medium">Workload per status category</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-indigo-600">{totalComplaints}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Cases</span>
          </div>
        </div>
        
        <div className="relative pt-4 ">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#0f172a', // slate-900
                  padding: 12,
                  cornerRadius: 12,
                  titleFont: { size: 12, weight: 'bold' }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { weight: '600', size: 11 }, color: '#64748b' }
                },
                y: {
                  border: { dash: [4, 4] },
                  grid: { color: '#f1f5f9' },
                  ticks: { font: { weight: '600' }, color: '#94a3b8' }
                }
              }
            }}
          />
        </div>
      </div>

      {/* 4. Satisfaction Rate - Compact Gauge */}
      <div className="bg-slate-900 rounded-3xl p-4 shadow-xl text-white flex flex-col justify-center items-center relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <h3 className="relative z-10 text-lg font-bold mb-6 text-slate-300">Community Satisfaction</h3>
        
        <div className="relative w-40 h-40">
          <Doughnut
            data={satisfactionChartData}
            options={{
              responsive: true,
              cutout: "82%",
              plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
              },
              animation: { animateRotate: true, duration: 2500 }
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">
              {satisfactionRate}%
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Positive</span>
          </div>
        </div>

        <p className="mt-6 text-slate-400 text-xs text-center leading-relaxed">
          Based on resolved complaints and <br/> citizen feedback loops.
        </p>
      </div>

    </div>
    </div>
  );
}

export default AdminStats
