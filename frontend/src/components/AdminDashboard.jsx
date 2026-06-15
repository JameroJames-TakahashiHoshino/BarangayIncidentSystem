import { useEffect, useMemo, useState } from 'react';
import logo from '../assets/barangay-logo.jpg';
import searchIcon from '../assets/magnifying glass.jpg';

const statuses = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'];

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

function AdminDashboard({
  user,
  incidents,
  users,
  onUpdate,
  onLoadUsers,
  onUpdateUser,
  onDeleteUser,
  onLogout,
  loading
}) {
  const [updates, setUpdates] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeView, setActiveView] = useState('dashboard');
  const [userEdits, setUserEdits] = useState({});
  useEffect(() => {
    if (users.length > 0 || !onLoadUsers) {
      return;
    }
    onLoadUsers();
  }, [onLoadUsers, users.length]);

  const personnelOptions = useMemo(() => {
    return users.filter((person) => person.role === 'personnel');
  }, [users]);


  const setField = (incidentId, field, value) => {
    setUpdates((prev) => ({
      ...prev,
      [incidentId]: {
        ...prev[incidentId],
        [field]: value
      }
    }));
  };

  const setUserField = (userId, field, value) => {
    setUserEdits((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  const handleIncidentSave = async (incident, local) => {
    const updated = await onUpdate(incident._id, {
      status: local.status ?? incident.status,
      assignedTo: local.assignedTo ?? incident.assignedTo?._id ?? '',
      adminNotes: local.adminNotes ?? ''
    });
    if (updated) {
      setUpdates((prev) => ({ ...prev, [incident._id]: {} }));
    }
  };

  const handleUserSave = async (person) => {
    if (!onUpdateUser) {
      return;
    }
    const local = userEdits[person._id] || {};
    const payload = {
      fullName: local.fullName ?? person.fullName,
      email: local.email ?? person.email,
      role: local.role ?? person.role,
      isActive: typeof local.isActive === 'boolean' ? local.isActive : person.isActive
    };

    if (local.password) {
      payload.password = local.password;
    }

    const updated = await onUpdateUser(person._id, payload);
    if (updated) {
      setUserEdits((prev) => ({ ...prev, [person._id]: { password: '' } }));
    }
  };

  const handleUserToggle = async (person, isActive) => {
    if (!onUpdateUser) {
      return;
    }
    const updated = await onUpdateUser(person._id, { isActive });
    if (updated) {
      setUserEdits((prev) => ({ ...prev, [person._id]: { ...prev[person._id], isActive } }));
    }
  };

  const handleUserDelete = async (person) => {
    if (!onDeleteUser) {
      return;
    }
    const confirmed = window.confirm(`Delete ${person.fullName}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    await onDeleteUser(person._id);
  };

  const stats = useMemo(() => {
    return incidents.reduce(
      (acc, incident) => {
        const statusKey = getStatusKey(incident.status);
        acc.total += 1;
        if (statusKey === 'pending' || statusKey === 'submitted') {
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
            <p className="brand-subtitle">Admin Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-item ${activeView === 'users' ? 'active' : ''}`}
            onClick={() => setActiveView('users')}
          >
            Manage User Accounts
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">{user?.fullName?.[0] || 'A'}</div>
          <div>
            <p className="profile-name">{user?.fullName || 'Admin'}</p>
            <p className="profile-email">{user?.email || 'admin@example.com'}</p>
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
              <h1>Admin Dashboard</h1>
              <p>Manage incidents and assignments</p>
            </div>
          </div>

          {activeView !== 'users' && (
            <section className="stat-grid">
              <div className="stat-card stat-total">
                <div>
                  <p>Total Reports</p>
                  <strong>{stats.total}</strong>
                </div>
              </div>
              <div className="stat-card stat-pending">
                <div>
                  <p>Pending</p>
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
          )}

          <div className="content-grid single">
            <section className="incident-panel">
              {activeView !== 'users' && (
                <>
                  <div className="panel-header">
                    <h2>Incident Management</h2>
                    <div className="filter-tabs">
                      {['all', 'pending', 'in-progress', 'resolved'].map((key) => (
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

                  {filteredIncidents.length === 0 && <p className="empty">No incidents found.</p>}

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
                            Reported by: {incident.reportedBy?.fullName || 'Unknown'} | Location: {incident.location}
                          </small>
                          <p className="helper-text">
                            Resident Additional Information: {incident.residentNotes?.trim() || 'No additional information yet.'}
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
                              Assign Personnel
                              <select
                                value={local.assignedTo ?? incident.assignedTo?._id ?? ''}
                                onChange={(event) => setField(incident._id, 'assignedTo', event.target.value)}
                              >
                                <option value="">Unassigned</option>
                                {personnelOptions.map((person) => (
                                  <option key={person._id} value={person._id}>
                                    {person.fullName} ({person.email})
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label>
                              Admin Notes
                              <input
                                type="text"
                                value={local.adminNotes ?? ''}
                                onChange={(event) => setField(incident._id, 'adminNotes', event.target.value)}
                                placeholder={incident.adminNotes?.trim() || 'Optional notes'}
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
                </>
              )}
            </section>
          </div>

          {activeView === 'users' && (
            <section className="incident-panel user-management">
              <div className="panel-header">
                <h2>Manage User Accounts</h2>
                <p className="panel-subtitle">Edit user details, roles, disable accounts, or delete users.</p>
                <div className="filter-tabs">
                  {['all', 'admin', 'personnel', 'resident'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`tab-btn ${filter === role ? 'active' : ''}`}
                      onClick={() => setFilter(role)}
                    >
                      {role === 'all' ? 'All Roles' : role}
                    </button>
                  ))}
                </div>
              </div>

              {users.length === 0 && <p className="empty">No users found.</p>}

              <div className="user-grid">
                {users
                  .filter((person) => {
                    if (filter === 'all') {
                      return true;
                    }
                    return person.role === filter;
                  })
                  .filter((person) => {
                    const keyword = search.trim().toLowerCase();
                    if (!keyword) {
                      return true;
                    }
                    return (
                      person.fullName?.toLowerCase().includes(keyword) ||
                      person.email?.toLowerCase().includes(keyword) ||
                      person.role?.toLowerCase().includes(keyword)
                    );
                  })
                  .map((person) => {
                    const local = userEdits[person._id] || {};
                    const activeValue = typeof local.isActive === 'boolean' ? local.isActive : person.isActive;
                    return (
                      <article key={person._id} className="user-card editable">
                        <div className="user-header">
                          <div className="avatar">{person.fullName?.[0] || 'U'}</div>
                          <div>
                            <p className="profile-name">{person.fullName || 'Unknown'}</p>
                            <p className="profile-email">{person.email}</p>
                          </div>
                          <span className={`status-pill ${person.role}`}>{person.role}</span>
                        </div>

                        <div className="user-fields">
                          <label>
                            Full Name
                            <input
                              type="text"
                              value={local.fullName ?? person.fullName}
                              onChange={(event) => setUserField(person._id, 'fullName', event.target.value)}
                            />
                          </label>

                          <label>
                            Email
                            <input
                              type="email"
                              value={local.email ?? person.email}
                              onChange={(event) => setUserField(person._id, 'email', event.target.value)}
                            />
                          </label>

                          <label>
                            Role
                            <select
                              value={local.role ?? person.role}
                              onChange={(event) => setUserField(person._id, 'role', event.target.value)}
                            >
                              <option value="resident">Resident</option>
                              <option value="personnel">Personnel</option>
                              <option value="admin">Admin</option>
                            </select>
                          </label>

                          <label>
                            New Password
                            <input
                              type="password"
                              value={local.password ?? ''}
                              onChange={(event) => setUserField(person._id, 'password', event.target.value)}
                              placeholder="Leave blank to keep"
                            />
                          </label>
                        </div>

                        <div className="user-actions">
                          <button type="button" onClick={() => handleUserSave(person)} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => handleUserToggle(person, !activeValue)}
                            disabled={loading}
                          >
                            {activeValue ? 'Disable Account' : 'Enable Account'}
                          </button>
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => handleUserDelete(person)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
