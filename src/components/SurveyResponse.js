// src/components/SurveyResponse.js
import React, { useState, useEffect } from 'react';
import { submitSurveyResponse, checkSurveyResponse } from '../api';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const SurveyResponse = () => {
  const { signedToken } = useParams();
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const checkResponse = async () => {
      try {
        await checkSurveyResponse(signedToken);
        setIsSubmitted(false);
      } catch (err) {
        if (err.response?.data?.error === 'Response already submitted for this survey link.') {
          setIsSubmitted(true);
          setError('Response already submitted for this survey link.');
        } else {
          setError(err.response?.data?.error || 'Invalid survey link.');
        }
      }
    };
    checkResponse();
  }, [signedToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitted) return;
    try {
      await submitSurveyResponse({ signed_token: signedToken, score, comments });
      setMessage('Thank you for your feedback!');
      setError('');
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit response');
    }
  };

  return (
    <div className="container mt-5">
      <h2>NPS Survey</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!isSubmitted && !error.includes('Invalid') ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Score (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              className="form-control"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Comments (Optional)</label>
            <textarea
              className="form-control"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      ) : (
        <p>{error || 'You have already submitted a response for this survey.'}</p>
      )}
    </div>
  );
};

export default SurveyResponse;