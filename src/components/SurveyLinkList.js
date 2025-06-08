// src/components/SurveyLinkList.js
import React, { useState, useEffect, useRef } from 'react';
import { listSurveyLinks, checkMultipleSurveyResponses } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css';
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-buttons-bs5';
import 'datatables.net-buttons/js/buttons.html5.min.js';
import 'datatables.net-buttons/js/buttons.print.min.js';
import 'jszip';
import 'pdfmake/build/pdfmake.min.js';
import 'pdfmake/build/vfs_fonts.js';

const SurveyLinkList = () => {
  const [links, setLinks] = useState([]);
  const [responseStatus, setResponseStatus] = useState({});
  const [error, setError] = useState('');
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await listSurveyLinks();
        const fetchedLinks = response.data;
        setLinks(fetchedLinks);

        if (fetchedLinks.length > 0) {
          const signedTokens = fetchedLinks.map((link) => link.signed_token);
          const statusResponse = await checkMultipleSurveyResponses(signedTokens);
          setResponseStatus(statusResponse.data);
        }
      } catch (err) {
        setError('Failed to fetch survey links');
      }
    };
    fetchLinks();
  }, []);

  useEffect(() => {
    if (links.length > 0 && tableRef.current && !dataTableRef.current) {
      dataTableRef.current = $(tableRef.current).DataTable({
        paging: true,
        pageLength: 10,
        searching: true,
        ordering: true,
        order: [[3, 'desc']], // Default sort by Created date (descending)
        responsive: true,
        dom: 'Bfrtip', // Include buttons in the layout
        buttons: [
          'copy',
          'csv',
          'excel',
          {
            extend: 'pdfHtml5',
            orientation: 'landscape',
            pageSize: 'A4',
            exportOptions: {
              columns: [0, 1, 2, 3, 4], // Exclude Actions column
            },
          },
          'print',
        ],
        language: {
          search: 'Filter links:',
          searchPlaceholder: 'Search by campaign ID, token, status...',
        },
        columnDefs: [
          { targets: 5, orderable: false }, // Disable sorting on Actions column
        ],
      });
    }

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [links]);

  const isExpired = (expiry) => new Date(expiry) < new Date();

  const getStatus = (link) => {
    const status = responseStatus[link.signed_token];
    if (status === 'responded') return 'responded';
    if (isExpired(link.expiry)) return 'expired';
    return 'active';
  };

  const getStatusBadge = (link) => {
    const status = getStatus(link);
    const badgeClasses = {
      active: 'badge bg-success',
      expired: 'badge bg-danger',
      responded: 'badge bg-primary',
    };
    const badgeText = {
      active: 'Active',
      expired: 'Expired',
      responded: 'Responded',
    };
    return <span className={badgeClasses[status]}>{badgeText[status]}</span>;
  };

  const getShareLinks = (signedToken) => {
    const surveyUrl = `${window.location.origin}/survey-response/${signedToken}`;
    const encodedUrl = encodeURIComponent(surveyUrl);
    const encodedText = encodeURIComponent('Please provide your feedback via this NPS survey link!');

    return {
      email: `mailto:?subject=NPS Survey&body=${encodedText}%0A${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      sms: `sms:?body=${encodedText}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    };
  };

  const shareViaWebShare = async (signedToken) => {
    const surveyUrl = `${window.location.origin}/survey-response/${signedToken}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NPS Survey',
          text: 'Please provide your feedback via this NPS survey link!',
          url: surveyUrl,
        });
      } catch (err) {
        console.error('Web Share API failed:', err);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Survey Links</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table ref={tableRef} className="table table-hover" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Campaign ID</th>
            <th>Link</th>
            <th>Expiry</th>
            <th>Created</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => {
            const shareLinks = getShareLinks(link.signed_token);
            const status = getStatus(link);
            const isShareable = status === 'active';

            return (
              <tr key={link.id}>
                <td>{link.campaign_id || 'N/A'}</td>
                <td>
                  <a href={`${window.location.origin}/survey-response/${link.signed_token}`}>
                    {link.signed_token.slice(0, 20)}...
                  </a>
                </td>
                <td>{new Date(link.expiry).toLocaleString()}</td>
                <td>{new Date(link.created_at).toLocaleString()}</td>
                <td>{getStatusBadge(link)}</td>
                <td>
                  {isShareable ? (
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        id={`dropdownMenuButton-${link.id}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        ...
                      </button>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby={`dropdownMenuButton-${link.id}`}
                      >
                        <li>
                          <a className="dropdown-item" href={shareLinks.email}>
                            Share via Email
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href={shareLinks.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Share via WhatsApp
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href={shareLinks.sms}>
                            Share via SMS
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Share via LinkedIn
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href={shareLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Share via Twitter/X
                          </a>
                        </li>
                        {navigator.share && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => shareViaWebShare(link.signed_token)}
                            >
                              Share via System
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SurveyLinkList;