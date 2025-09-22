import React, { useState, useEffect } from 'react';
import { websiteService } from '../../services/api';

const WebsiteHealthMonitor = () => {
  const [websites, setWebsites] = useState([]);
  const [summary, setSummary] = useState({ total: 0, up: 0, down: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch websites data
  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await websiteService.getWebsites();
      setWebsites(response.data.websites);
      setSummary(response.data.summary);
      setError(null);
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError('Failed to fetch websites data');
    } finally {
      setLoading(false);
    }
  };

  // Add new website
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    try {
      setIsAdding(true);
      await websiteService.addWebsite(newDomain.trim());
      setNewDomain('');
      await fetchWebsites(); // Refresh the list
    } catch (err) {
      console.error('Error adding website:', err);
      setError(err.message || 'Failed to add website');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete website
  const handleDeleteWebsite = async (websiteId) => {
    if (!window.confirm('Are you sure you want to remove this website from monitoring?')) {
      return;
    }

    try {
      await websiteService.deleteWebsite(websiteId);
      await fetchWebsites(); // Refresh the list
    } catch (err) {
      console.error('Error deleting website:', err);
      setError(err.message || 'Failed to delete website');
    }
  };

  // Manual health check
  const handleManualCheck = async (websiteId) => {
    try {
      await websiteService.checkWebsiteHealth(websiteId);
      await fetchWebsites(); // Refresh the list
    } catch (err) {
      console.error('Error checking website health:', err);
      setError(err.message || 'Failed to check website health');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format response time
  const formatResponseTime = (responseTime) => {
    if (!responseTime) return 'N/A';
    return `${responseTime}ms`;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    return status === 'up' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Get expiry badge class
  const getExpiryBadgeClass = (expiryDate) => {
    if (!expiryDate) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800 border-red-200'; // Expired
    if (daysUntilExpiry <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Expiring soon
    return 'bg-green-100 text-green-800 border-green-200'; // Safe
  };

  // Get days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 'N/A';
    
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry === 0) return 'Today';
    if (daysUntilExpiry === 1) return '1 day';
    return `${daysUntilExpiry} days`;
  };

  // Auto-refresh every minute
  useEffect(() => {
    fetchWebsites();

    const interval = setInterval(() => {
      fetchWebsites();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  if (loading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌐 Website Health Monitor
        </h1>
        <p className="text-gray-600">
          Monitor your websites for uptime, SSL certificates, and domain expiry
        </p>
      </div>

      {/* Summary Badge */}
      <div className="mb-6">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-sm font-medium text-blue-800">
            Total: {summary.total} sites | Up: {summary.up} | Down: {summary.down}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Website Form */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Website</h2>
        <form onSubmit={handleAddWebsite} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <input
              type="text"
              id="domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAdding || !newDomain.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add Website'}
            </button>
          </div>
        </form>
      </div>

      {/* Websites Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monitored Websites</h2>
        </div>
        
        {websites.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No websites</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a website to monitor.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SSL Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {websites.map((website) => (
                  <tr key={website._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {website.domain}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(website.status)}`}>
                        {website.status === 'up' ? '🟢 Up' : '🔴 Down'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatResponseTime(website.responseTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpiryBadgeClass(website.sslValidTill)}`}>
                        {getDaysUntilExpiry(website.sslValidTill)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpiryBadgeClass(website.domainExpiry)}`}>
                        {getDaysUntilExpiry(website.domainExpiry)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(website.lastChecked)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleManualCheck(website._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Check
                      </button>
                      <button
                        onClick={() => handleDeleteWebsite(website._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Data refreshes automatically every minute • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default WebsiteHealthMonitor;