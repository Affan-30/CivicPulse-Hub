import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ComplaintsLineCharts() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/admin/complaints/line-chart")
      .then(res => res.json())
      .then(data => {
        setChartData({
          labels: data.map(item => item.date),
          datasets: [
            {
              label: "Complaints Registered",
              data: data.map(item => item.count),
              borderColor: "#2563eb",      // blue line
              backgroundColor: "#93c5fd",  // light blue
              pointBackgroundColor: "#1e40af",
              pointBorderColor: "#1e40af",
              tension: 0.4,
              fill: false
            }
          ]
        });
      });
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div style={{ width: "600px", height: "300px" }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,        // 🔑 forces natural numbers
                precision: 0        // 🔑 removes decimals
              },
              title: {
                display: true,
                text: "Number of Complaints"
              }
            },
            x: {
              title: {
                display: true,
                text: "Date"
              }
            }
          }
        }}
      />
    </div>
  );
}

export default ComplaintsLineCharts;
