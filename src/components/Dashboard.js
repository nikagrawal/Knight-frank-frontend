import React, { useState, useEffect } from 'react';
import { getMetrics, listSurveyLinks } from '../api';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [dailyResponses, setDailyResponses] = useState([]);

  const fetchMetrics = async () => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (campaignId) params.campaign_id = campaignId;
      if (searchQuery) params.search = searchQuery;
      const response = await getMetrics(params);
      setMetrics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load metrics');
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await listSurveyLinks(); // Replace with actual response data API if needed
      const responses = response.data;

      // Aggregate responses by date
      const responseCounts = {};
      responses.forEach((link) => {
        // Extract date (YYYY-MM-DD) from expiry timestamp
        const date = link.expiry.split('T')[0];
        responseCounts[date] = (responseCounts[date] || 0) + 1;
      });

      // Convert to array for charting
      const sortedDates = Object.keys(responseCounts).sort();
      const dailyResponseData = sortedDates.map((date) => ({
        date,
        count: responseCounts[date],
      }));

      setDailyResponses(dailyResponseData);
    } catch (err) {
      setError('Failed to load response data');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await listSurveyLinks();
      const uniqueCampaigns = [
        ...new Set(response.data.map((link) => link.campaign_id).filter(Boolean)),
      ];
      setCampaigns(uniqueCampaigns);
    } catch (err) {
      setError('Failed to load campaigns');
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchCampaigns();
    fetchResponses();
  }, [startDate, endDate, campaignId, searchQuery]);

  const barData = metrics
    ? {
        labels: ['Promoters', 'Passives', 'Detractors'],
        datasets: [
          {
            label: 'NPS Breakdown',
            data: [metrics.promoters, metrics.passives, metrics.detractors],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          },
        ],
      }
    : {};

  const npsLineData = metrics
    ? {
        labels: metrics.trend.map((item) => item.date),
        datasets: [
          {
            label: 'NPS Score Over Time',
            data: metrics.trend.map((item) => item.nps_score),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            fill: true,
            tension: 0.3,
          },
        ],
      }
    : {};

  const responseLineData = dailyResponses
    ? {
        labels: dailyResponses.map((item) => item.date),
        datasets: [
          {
            label: 'Responses Per Day',
            data: dailyResponses.map((item) => item.count),
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            fill: true,
            tension: 0.3,
          },
        ],
      }
    : {};

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true, // For response counts, start at 0
        title: {
          display: true,
          text: 'Number of Responses',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
      legend: {
        display: true,
      },
    },
  };

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Campaign</label>
          <select
            className="form-select"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            <option value="">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign} value={campaign}>
                {campaign}
              </option>
            ))}
          </select>
        </div>
      </div>
      {metrics && (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <h5>NPS Score: {metrics.nps_score.toFixed(2)}</h5>
              <p>Total Responses: {metrics.total_responses}</p>
            </div>
          </div>
          <div className="card mb-4">
            <div className="card-body">
              <h5>Promoters / Passives / Detractors Breakdown</h5>
              <Bar data={barData} options={{ responsive: true }} />
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5>Responses Per Day</h5>
              <Line data={responseLineData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;


{/* <div className="card mb-4">
<div className="card-body">
  <h5>NPS Score Over Time</h5>
  <Line data={npsLineData} options={chartOptions} />
</div>
</div> */}