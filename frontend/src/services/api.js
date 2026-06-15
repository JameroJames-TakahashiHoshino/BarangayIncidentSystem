const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getErrorMessage = (data) => {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.msg).join(' ');
  }

  return data?.message || 'Request failed.';
};

const request = async (path, options = {}) => {
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergedHeaders
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(getErrorMessage(data));
    error.status = response.status;
    error.details = data?.errors || [];
    throw error;
  }

  return data;
};

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMyProfile: (token) =>
    request('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),

  createIncident: (token, body) =>
    request('/api/incidents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    }),
  getMyIncidents: (token) =>
    request('/api/incidents/my-reports', { headers: { Authorization: `Bearer ${token}` } }),
  updateIncidentByResident: (token, incidentId, body) =>
    request(`/api/incidents/resident/${incidentId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    }),

  getAllIncidentsForAdmin: (token) =>
    request('/api/incidents/admin/all', { headers: { Authorization: `Bearer ${token}` } }),
  updateIncidentByAdmin: (token, incidentId, body) =>
    request(`/api/incidents/admin/${incidentId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    }),

  getAssignedIncidentsForPersonnel: (token) =>
    request('/api/incidents/personnel/assigned', { headers: { Authorization: `Bearer ${token}` } }),
  updateAssignedIncidentByPersonnel: (token, incidentId, body) =>
    request(`/api/incidents/personnel/${incidentId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    }),

  getAllUsers: (token) => request('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
  updateUser: (token, userId, body) =>
    request(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    }),
  deleteUser: (token, userId) =>
    request(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
};
