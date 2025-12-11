import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCompanies, deleteCompany } from '../api/company';
import Navbar from '../components/Navbar';
import '../styles/company.css';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [search, industryFilter, locationFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (industryFilter) params.industry = industryFilter;
      if (locationFilter) params.location = locationFilter;
      
      const response = await getAllCompanies(params);
      setCompanies(response.data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, companyName) => {
    if (!window.confirm(`Are you sure you want to delete "${companyName}"?`)) {
      return;
    }

    try {
      await deleteCompany(id);
      setCompanies(companies.filter(c => c.id !== id));
      alert('Company deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete company');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleIndustryChange = (e) => {
    setIndustryFilter(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const uniqueIndustries = [...new Set(companies.map(c => c.industry).filter(Boolean))];
  const uniqueLocations = [...new Set(companies.map(c => c.city || c.location).filter(Boolean))];

  return (
    <>
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Companies</h1>
            <p className="page-subtitle">Browse and manage company listings</p>
          </div>
          <Link to="/companies/add">
            <button className="btn-primary">+ Add Company</button>
          </Link>
        </div>

        <div className="search-filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search companies..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          
          <select
            className="filter-select"
            value={industryFilter}
            onChange={handleIndustryChange}
          >
            <option value="">All Industries</option>
            {uniqueIndustries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={locationFilter}
            onChange={handleLocationChange}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p className="loading-text">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3 className="empty-state-title">No companies found</h3>
            <p className="empty-state-text">
              {search || industryFilter || locationFilter
                ? 'Try adjusting your search filters'
                : 'Start by adding your first company'}
            </p>
            <Link to="/companies/add">
              <button className="btn-primary">+ Add Your First Company</button>
            </Link>
          </div>
        ) : (
          <div className="company-grid">
            {companies.map(company => (
              <div key={company.id} className="company-card">
                <div className="company-card-header">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="company-logo"
                    />
                  ) : (
                    <div className="company-logo-placeholder">
                      {getInitials(company.name)}
                    </div>
                  )}
                  <div className="company-card-info">
                    <h3 className="company-name">{company.name}</h3>
                    {company.industry && (
                      <span className="company-industry">{company.industry}</span>
                    )}
                  </div>
                </div>

                {company.description && (
                  <p className="company-description">{company.description}</p>
                )}

                <div className="company-meta">
                  {(company.city || company.location) && (
                    <div className="company-meta-item">
                      <span className="company-meta-icon">📍</span>
                      {company.city || company.location}
                    </div>
                  )}
                  {company.website && (
                    <div className="company-meta-item">
                      <span className="company-meta-icon">🌐</span>
                      Website
                    </div>
                  )}
                  {company.company_size && (
                    <div className="company-meta-item">
                      <span className="company-meta-icon">👥</span>
                      {company.company_size}
                    </div>
                  )}
                </div>

                <div className="company-card-actions">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    View
                  </button>
                  {localStorage.getItem('token') && (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/companies/${company.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(company.id, company.name)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
