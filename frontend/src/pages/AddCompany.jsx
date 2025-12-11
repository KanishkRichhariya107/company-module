import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompany } from '../api/company';
import Navbar from '../components/Navbar';
import '../styles/company.css';

export default function AddCompany() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    city: '',
    state: '',
    country: '',
    company_size: '',
    founded_year: '',
    logo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name) {
      setError('Company name is required');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      if (formData.description) submitData.append('description', formData.description);
      if (formData.industry) submitData.append('industry', formData.industry);
      if (formData.website) submitData.append('website', formData.website);
      if (formData.email) submitData.append('email', formData.email);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.location) submitData.append('location', formData.location);
      if (formData.address) submitData.append('address', formData.address);
      if (formData.city) submitData.append('city', formData.city);
      if (formData.state) submitData.append('state', formData.state);
      if (formData.country) submitData.append('country', formData.country);
      if (formData.company_size) submitData.append('company_size', formData.company_size);
      if (formData.founded_year) submitData.append('founded_year', formData.founded_year);
      if (formData.logo) submitData.append('logo', formData.logo);

      const response = await createCompany(submitData);
      setSuccess('Company created successfully!');
      
      setTimeout(() => {
        navigate('/companies');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  return (
    <>
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Add New Company</h1>
            <p className="page-subtitle">Fill in the details to add a new company</p>
          </div>
        </div>

        <div className="company-form-container">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>
              
              <div className="form-group">
                <label className="form-label form-label-required">Company Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter company name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Enter company description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select
                    name="industry"
                    className="form-select"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select
                    name="company_size"
                    className="form-select"
                    value={formData.company_size}
                    onChange={handleChange}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Founded Year</label>
                <input
                  type="number"
                  name="founded_year"
                  className="form-input"
                  placeholder="e.g., 2020"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.founded_year}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3 className="form-section-title">Contact Information</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="company@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  name="website"
                  className="form-input"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-section">
              <h3 className="form-section-title">Location</h3>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    placeholder="State/Province"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-input"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location (Short)</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Company Logo */}
            <div className="form-section">
              <h3 className="form-section-title">Company Logo</h3>
              
              <div className="form-group">
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  className="form-file-input"
                  onChange={handleFileChange}
                />
                <label htmlFor="logo" className="file-upload-area">
                  <div className="file-upload-icon">📤</div>
                  <div className="file-upload-text">
                    {formData.logo ? formData.logo.name : 'Click to upload logo'}
                  </div>
                  <div className="file-upload-hint">
                    PNG, JPG, GIF up to 5MB
                  </div>
                </label>

                {logoPreview && (
                  <div className="image-preview">
                    <img src={logoPreview} alt="Logo preview" />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Company'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
