import { useMemo, useState } from 'react';
import logo from '../assets/barangay-logo.jpg';
import searchIcon from '../assets/magnifying glass.jpg';

const statuses = ['assigned', 'in_progress', 'resolved', 'rejected'];

const getStatusKey = (status) => {
  if (!status) {
    return 'pending';
  }
  const normalized = status.toLowerCase();
  if (normalized.includes('progress')) {
    return 'in-progress';
  }
  if (normalized.includes('resolve')) {
    return 'resolved';
  }
  if (normalized.includes('reject')) {
    return 'rejected';
  }
  return normalized;
};

function PersonnelDashboard({ user, incidents, onUpdate, onLogout, loading }) {
  const [updates, setUpdates] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const setField = (incidentId, field, value) => {
    setUpdates((prev) => ({
      ...prev,
      [incidentId]: {
        ...prev[incidentId],
        [field]: value
      }
    }));
  };

  const handleIncidentSave = async (incident, local) => {
    const updated = await onUpdate(incident._id, {
      status: local.status ?? incident.status,
      personnelNotes: local.personnelNotes ?? ''
    });
    if (updated) {
      setUpdates((prev) => ({ ...prev, [incident._id]: {} }));
    }
  };

  const stats = useMemo(() => {
    return incidents.reduce(
      (acc, incident) => {
        const statusKey = getStatusKey(incident.status);
        acc.total += 1;
        if (statusKey === 'assigned' || statusKey === 'pending') {
          acc.pending += 1;
        } else if (statusKey === 'in-progress') {
          acc.inProgress += 1;
        } else if (statusKey === 'resolved') {
          acc.resolved += 1;
        }
        return acc;
      },
      { total: 0, pending: 0, inProgress: 0, resolved: 0 }
    );
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return incidents.filter((incident) => {
      const statusKey = getStatusKey(incident.status);
      const matchesFilter = filter === 'all' || statusKey === filter;
      const matchesSearch =
        !keyword ||
        incident.title?.toLowerCase().includes(keyword) ||
        incident.description?.toLowerCase().includes(keyword) ||
        incident.location?.toLowerCase().includes(keyword);
      return matchesFilter && matchesSearch;
    });
  }, [filter, incidents, search]);

  return (
    <div className="resident-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Barangay IRS logo" className="brand-logo" />
          <div>
            <p className="brand-title">Barangay IRS</p>
            <p className="brand-subtitle">Personnel Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className="nav-item active">Dashboard</button>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">{user?.fullName?.[0] || 'P'}</div>
          <div>
            <p className="profile-name">{user?.fullName || 'Personnel'}</p>
            <p className="profile-email">{user?.email || 'personnel@example.com'}</p>
          </div>
        </div>

        <button type="button" className="sidebar-logout" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="resident-main">
        <header className="resident-topbar">
          <div className="search-field">
            <img src={searchIcon} alt="" className="search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search incidents..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="topbar-actions" />
        </header>

        <div className="resident-content">
          <div className="resident-header">
            <div>
              <h1>Personnel Dashboard</h1>
              <p>Track assigned incidents and updates</p>
            </div>
          </div>

          <section className="stat-grid">
            <div className="stat-card stat-total">
              <div>
                <p>Total Assigned</p>
                <strong>{stats.total}</strong>
              </div>
            </div>
            <div className="stat-card stat-pending">
              <div>
                <p>Assigned</p>
                <strong>{stats.pending}</strong>
              </div>
            </div>
            <div className="stat-card stat-progress">
              <div>
                <p>In Progress</p>
                <strong>{stats.inProgress}</strong>
              </div>
            </div>
            <div className="stat-card stat-resolved">
              <div>
                <p>Resolved</p>
                <strong>{stats.resolved}</strong>
              </div>
            </div>
          </section>

          <div className="content-grid single">
            <section className="incident-panel">
              <div className="panel-header">
                <h2>Assigned Incidents</h2>
                <div className="filter-tabs">
                  {['all', 'assigned', 'in-progress', 'resolved'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`tab-btn ${filter === key ? 'active' : ''}`}
                      onClick={() => setFilter(key)}
                    >
                      {key === 'all' ? 'All Reports' : key.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {filteredIncidents.length === 0 && <p className="empty">No incidents assigned to you.</p>}

              <ul className="list">
                {filteredIncidents.map((incident) => {
                  const local = updates[incident._id] || {};
                  return (
                    <li key={incident._id} className="list-item">
                      <div className="list-row">
                        <strong>{incident.title}</strong>
                        <span className="badge">{incident.status}</span>
                      </div>
                      <p>{incident.description}</p>
                      <small>
                        Resident: {incident.reportedBy?.fullName || 'Unknown'} | Location: {incident.location}
                      </small>
                      <p className="helper-text">
                        Resident Additional Information: {incident.residentNotes?.trim() || 'No additional information yet.'}
                      </p>
                      <p className="helper-text">
                        Admin Notes: {incident.adminNotes?.trim() || 'No admin notes yet.'}
                      </p>

                      <div className="inline-form">
                        <label>
                          Status
                          <select
                            value={local.status ?? incident.status}
                            onChange={(event) => setField(incident._id, 'status', event.target.value)}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Personnel Notes
                          <input
                            type="text"
                            value={local.personnelNotes ?? ''}
                            onChange={(event) => setField(incident._id, 'personnelNotes', event.target.value)}
                            placeholder={incident.personnelNotes?.trim() || 'Update details'}
                          />
                        </label>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleIncidentSave(incident, local)}
                        >
                          {loading ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PersonnelDashboard;
