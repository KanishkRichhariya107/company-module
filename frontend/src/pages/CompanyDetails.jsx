import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyById, deleteCompany } from '../api/company';
import Navbar from '../components/Navbar';
import '../styles/company.css';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await getCompanyById(id);
      setCompany(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch company details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${company.name}"?`)) {
      return;
    }

    try {
      await deleteCompany(id);
      alert('Company deleted successfully!');
      navigate('/companies');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete company');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="company-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p className="loading-text">Loading company details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !company) {
    return (
      <>
        <Navbar />
        <div className="company-container">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <h3 className="empty-state-title">Company Not Found</h3>
            <p className="empty-state-text">{error || 'The company you are looking for does not exist.'}</p>
            <Link to="/companies">
              <button className="btn-primary">Back to Companies</button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="company-container">
        <div style={{ marginBottom: '20px' }}>
          <Link to="/companies" className="btn-icon">
            ← Back to Companies
          </Link>
        </div>

        <div className="company-details-container">
          {/* Header */}
          <div className="company-details-header">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="company-details-logo"
              />
            ) : (
              <div className="company-logo-placeholder" style={{ width: '120px', height: '120px', fontSize: '36px' }}>
                {getInitials(company.name)}
              </div>
            )}

            <div className="company-details-info">
              <h1 className="company-details-name">{company.name}</h1>
              
              {company.industry && (
                <span className="company-details-industry">{company.industry}</span>
              )}

              <div className="company-details-meta">
                {(company.city || company.location) && (
                  <div className="company-details-meta-item">
                    <span>📍</span>
                    {company.city || company.location}
                  </div>
                )}
                {company.company_size && (
                  <div className="company-details-meta-item">
                    <span>👥</span>
                    {company.company_size} employees
                  </div>
                )}
                {company.founded_year && (
                  <div className="company-details-meta-item">
                    <span>📅</span>
                    Founded in {company.founded_year}
                  </div>
                )}
              </div>

              {token && (
                <div className="company-details-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/companies/${id}/edit`)}
                  >
                    ✏️ Edit Company
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleDelete}
                  >
                    🗑️ Delete Company
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="company-details-section">
              <h3 className="company-details-section-title">About</h3>
              <p className="company-details-text">{company.description}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="company-details-section">
            <h3 className="company-details-section-title">Contact Information</h3>
            <div className="company-details-grid">
              {company.email && (
                <div className="company-details-item">
                  <span className="company-details-label">Email</span>
                  <a
                    href={`mailto:${company.email}`}
                    className="company-details-value company-details-link"
                  >
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="company-details-item">
                  <span className="company-details-label">Phone</span>
                  <a
                    href={`tel:${company.phone}`}
                    className="company-details-value company-details-link"
                  >
                    {company.phone}
                  </a>
                </div>
              )}
              {company.website && (
                <div className="company-details-item">
                  <span className="company-details-label">Website</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="company-details-value company-details-link"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          {(company.address || company.city || company.state || company.country) && (
            <div className="company-details-section">
              <h3 className="company-details-section-title">Location</h3>
              <div className="company-details-grid">
                {company.address && (
                  <div className="company-details-item">
                    <span className="company-details-label">Address</span>
                    <span className="company-details-value">{company.address}</span>
                  </div>
                )}
                {company.city && (
                  <div className="company-details-item">
                    <span className="company-details-label">City</span>
                    <span className="company-details-value">{company.city}</span>
                  </div>
                )}
                {company.state && (
                  <div className="company-details-item">
                    <span className="company-details-label">State/Province</span>
                    <span className="company-details-value">{company.state}</span>
                  </div>
                )}
                {company.country && (
                  <div className="company-details-item">
                    <span className="company-details-label">Country</span>
                    <span className="company-details-value">{company.country}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Info */}
          <div className="company-details-section">
            <h3 className="company-details-section-title">Company Information</h3>
            <div className="company-details-grid">
              {company.industry && (
                <div className="company-details-item">
                  <span className="company-details-label">Industry</span>
                  <span className="company-details-value">{company.industry}</span>
                </div>
              )}
              {company.company_size && (
                <div className="company-details-item">
                  <span className="company-details-label">Company Size</span>
                  <span className="company-details-value">{company.company_size}</span>
                </div>
              )}
              {company.founded_year && (
                <div className="company-details-item">
                  <span className="company-details-label">Founded Year</span>
                  <span className="company-details-value">{company.founded_year}</span>
                </div>
              )}
              {company.created_at && (
                <div className="company-details-item">
                  <span className="company-details-label">Listed On</span>
                  <span className="company-details-value">
                    {new Date(company.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          {(company.creator_name || company.creator_email) && (
            <div className="company-details-section">
              <h3 className="company-details-section-title">Listed By</h3>
              <div className="company-details-grid">
                {company.creator_name && (
                  <div className="company-details-item">
                    <span className="company-details-label">Name</span>
                    <span className="company-details-value">{company.creator_name}</span>
                  </div>
                )}
                {company.creator_email && (
                  <div className="company-details-item">
                    <span className="company-details-label">Email</span>
                    <a
                      href={`mailto:${company.creator_email}`}
                      className="company-details-value company-details-link"
                    >
                      {company.creator_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
