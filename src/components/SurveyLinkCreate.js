// src/components/SurveyLinkCreate.js
import React, { useState } from 'react';
import { createSurveyLink } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

const SurveyLinkCreate = () => {
  const [campaignId, setCampaignId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { campaign_id: campaignId };
      if (expiryDate) {
        // Convert date to ISO datetime (end of day)
        payload.expiry = new Date(expiryDate).toISOString();
      }
      const response = await createSurveyLink(payload);
      setLink(`${window.location.origin}/survey-response/${response.data.signed_token}`);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create survey link');
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mt-5">
      <h2>Create Survey Link</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {link && (
        <div className="alert alert-success">
          Survey Link: <a href={link}>{link}</a>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Campaign ID (Optional)</label>
          <input
            type="text"
            className="form-control"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Expiration Date (Optional)</label>
          <input
            type="date"
            className="form-control"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            min={today}
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Link</button>
      </form>
    </div>
  );
};

export default SurveyLinkCreate;