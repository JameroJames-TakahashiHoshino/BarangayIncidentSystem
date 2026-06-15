import { useMemo, useState } from 'react';
import logo from '../assets/barangay-logo.jpg';
import searchIcon from '../assets/magnifying glass.jpg';

const initialForm = {
  title: '',
  description: '',
  location: '',
  incidentDate: ''
};

const FILTERS = [
  { key: 'all', label: 'All Reports' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' }
];

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
  return normalized;
};

function ResidentDashboard({
  user,
  incidents,
  onCreateIncident,
  onUpdateIncident,
  onLogout,
  loading
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [updateForms, setUpdateForms] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return sortedIncidents.filter((incident) => {
      const statusKey = getStatusKey(incident.status);
      const matchesFilter = filter === 'all' || statusKey === filter;
      const matchesSearch =
        !keyword ||
        incident.title?.toLowerCase().includes(keyword) ||
        incident.description?.toLowerCase().includes(keyword) ||
        incident.location?.toLowerCase().includes(keyword);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, sortedIncidents]);

  const stats = useMemo(() => {
    return sortedIncidents.reduce(
      (acc, incident) => {
        const statusKey = getStatusKey(incident.status);
        acc.total += 1;
        if (statusKey === 'pending') {
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
  }, [sortedIncidents]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isAnyFieldEmpty = Object.values(form).some((value) => !value);

    if (isAnyFieldEmpty) {
      setError('Please fill in all incident fields.');
      return;
    }

    setError('');
    const created = await onCreateIncident(form);
    if (created) {
      setForm(initialForm);
      setShowReportForm(false);
    }
  };

  const handleUpdateChange = (incidentId, value) => {
    setUpdateForms((prev) => ({ ...prev, [incidentId]: value }));
  };

  const handleIncidentUpdate = async (incidentId) => {
    const residentNotes = (updateForms[incidentId] || '').trim();
    const updated = await onUpdateIncident(incidentId, { residentNotes });
    if (updated) {
      setUpdateForms((prev) => ({ ...prev, [incidentId]: '' }));
    }
  };

  return (
    <div className="resident-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Barangay IRS logo" className="brand-logo" />
          <div>
            <p className="brand-title">Barangay IRS</p>
            <p className="brand-subtitle">Resident Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className="nav-item active">Dashboard</button>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">{user?.fullName?.[0] || 'R'}</div>
          <div>
            <p className="profile-name">{user?.fullName || 'Resident'}</p>
            <p className="profile-email">{user?.email || 'resident@example.com'}</p>
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
              <h1>Resident Dashboard</h1>
              <p>Manage and track your incident reports</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={() => setShowReportForm(true)}
            >
              + Report New Incident
            </button>
          </div>

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

          <div className="content-grid single">
            <section className="incident-panel">
              <div className="panel-header">
                <h2>My Incident Reports</h2>
                <div className="filter-tabs">
                  {FILTERS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`tab-btn ${filter === item.key ? 'active' : ''}`}
                      onClick={() => setFilter(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredIncidents.length === 0 && <p className="empty">No incidents submitted yet.</p>}

              <div className="incident-grid">
                {filteredIncidents.map((incident) => {
                  const statusKey = getStatusKey(incident.status);
                  return (
                    <article key={incident._id} className="incident-card">
                      <div className="incident-header">
                        <h3>{incident.title}</h3>
                        <span className={`status-pill ${statusKey}`}>{incident.status || 'Pending'}</span>
                      </div>
                      <p className="incident-desc">{incident.description}</p>
                      <div className="incident-meta">
                        <span>{incident.location}</span>
                        <span>{new Date(incident.incidentDate).toLocaleDateString()}</span>
                      </div>

                      <label className="update-label">
                        Additional Information
                        <textarea
                          rows="3"
                          value={updateForms[incident._id] ?? ''}
                          onChange={(event) => handleUpdateChange(incident._id, event.target.value)}
                          placeholder="Add updates or more details about your report"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleIncidentUpdate(incident._id)}
                        disabled={loading}
                        className="secondary-btn"
                      >
                        {loading ? 'Updating...' : 'Update Information'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      {showReportForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Report New Incident</h2>
                <p className="panel-subtitle">Submit details for a new incident report.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowReportForm(false);
                  setError('');
                }}
                aria-label="Close report form"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <label>
                Incident Title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Noise disturbance"
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe what happened"
                />
              </label>

              <label>
                Location
                <select name="location" value={form.location} onChange={handleChange}>
                  <option value="">Select street</option>
                  <option value="A. Bonifacio">A. Bonifacio</option>
                  <option value="Abelardo">Abelardo</option>
                  <option value="Adarna ST">Adarna ST</option>
                  <option value="Aguinaldo">Aguinaldo</option>
                  <option value="Apple St">Apple St</option>
                  <option value="Bacer St">Bacer St</option>
                  <option value="Bach">Bach</option>
                  <option value="Batasan Rd">Batasan Rd</option>
                  <option value="Bato-Bato St">Bato-Bato St</option>
                  <option value="Beethoven">Beethoven</option>
                  <option value="Bicoleyte">Bicoleyte</option>
                  <option value="Brahms">Brahms</option>
                  <option value="Caridad">Caridad</option>
                  <option value="Chopin">Chopin</option>
                  <option value="Commonwealth Ave">Commonwealth Ave</option>
                  <option value="Cuenco St">Cuenco St</option>
                  <option value="D. Carmencita">D. Carmencita</option>
                  <option value="Dear St">Dear St</option>
                  <option value="Debussy">Debussy</option>
                  <option value="Don Benedicto">Don Benedicto</option>
                  <option value="Don Desiderio Ave">Don Desiderio Ave</option>
                  <option value="Don Espejo Ave">Don Espejo Ave</option>
                  <option value="Don Fabian">Don Fabian</option>
                  <option value="Don Jose Ave">Don Jose Ave</option>
                  <option value="Don Macario">Don Macario</option>
                  <option value="Dona Adaucto">Dona Adaucto</option>
                  <option value="Dona Agnes">Dona Agnes</option>
                  <option value="Dona Ana Candelaria">Dona Ana Candelaria</option>
                  <option value="Dona Carmen Ave">Dona Carmen Ave</option>
                  <option value="Dona Cynthia">Dona Cynthia</option>
                  <option value="Dona Fabian Castillo">Dona Fabian Castillo</option>
                  <option value="Dona Juliana">Dona Juliana</option>
                  <option value="Dona Lucia">Dona Lucia</option>
                  <option value="Dona Maria">Dona Maria</option>
                  <option value="Dona Severino">Dona Severino</option>
                  <option value="Ecol St">Ecol St</option>
                  <option value="Elliptical Rd">Elliptical Rd</option>
                  <option value="Elma St">Elma St</option>
                  <option value="Ernestine">Ernestine</option>
                  <option value="Ernestito">Ernestito</option>
                  <option value="Eulogio St">Eulogio St</option>
                  <option value="Freedom Park">Freedom Park</option>
                  <option value="Gen. Evangelista">Gen. Evangelista</option>
                  <option value="Gen. Ricarte">Gen. Ricarte</option>
                  <option value="Geraldine St">Geraldine St</option>
                  <option value="Gold St">Gold St</option>
                  <option value="Grapes St">Grapes St</option>
                  <option value="Handel">Handel</option>
                  <option value="Hon. B. Soliven">Hon. B. Soliven</option>
                  <option value="Jasmin St">Jasmin St</option>
                  <option value="Johan St">Johan St</option>
                  <option value="John Street">John Street</option>
                  <option value="Julius">Julius</option>
                  <option value="June June">June June</option>
                  <option value="Kalapati St">Kalapati St</option>
                  <option value="Kamagong St">Kamagong St</option>
                  <option value="Kasoy St">Kasoy St</option>
                  <option value="Kasunduan">Kasunduan</option>
                  <option value="Katibayan St">Katibayan St</option>
                  <option value="Katipunan St">Katipunan St</option>
                  <option value="Katuparan">Katuparan</option>
                  <option value="Kaunlaran">Kaunlaran</option>
                  <option value="Kilyawan St">Kilyawan St</option>
                  <option value="La Mesa Drive">La Mesa Drive</option>
                  <option value="Laurel St">Laurel St</option>
                  <option value="Lawin St">Lawin St</option>
                  <option value="Liszt">Liszt</option>
                  <option value="Lunas St">Lunas St</option>
                  <option value="Ma Theresa">Ma Theresa</option>
                  <option value="Mango">Mango</option>
                  <option value="Manila Gravel Pit Rd">Manila Gravel Pit Rd</option>
                  <option value="Mark Street">Mark Street</option>
                  <option value="Markos Rd">Markos Rd</option>
                  <option value="Martan St">Martan St</option>
                  <option value="Martirez St">Martirez St</option>
                  <option value="Matthew St">Matthew St</option>
                  <option value="Melon">Melon</option>
                  <option value="Mozart">Mozart</option>
                  <option value="Obanc St">Obanc St</option>
                  <option value="Ocampo Ave">Ocampo Ave</option>
                  <option value="Odigal">Odigal</option>
                  <option value="Pacamara St">Pacamara St</option>
                  <option value="Pantaleona">Pantaleona</option>
                  <option value="Paul St">Paul St</option>
                  <option value="Payatas Rd">Payatas Rd</option>
                  <option value="Perez St">Perez St</option>
                  <option value="Pilot Drive">Pilot Drive</option>
                  <option value="Pineapple St">Pineapple St</option>
                  <option value="Pres. Osmena">Pres. Osmena</option>
                  <option value="Pres. Quezon">Pres. Quezon</option>
                  <option value="Pres. Roxas">Pres. Roxas</option>
                  <option value="Pugo St">Pugo St</option>
                  <option value="Republic Ave">Republic Ave</option>
                  <option value="Riverside Ext">Riverside Ext</option>
                  <option value="Riverside St">Riverside St</option>
                  <option value="Rose St">Rose St</option>
                  <option value="Rossini">Rossini</option>
                  <option value="Saint Anthony Street">Saint Anthony Street</option>
                  <option value="Saint Paul Street">Saint Paul Street</option>
                  <option value="San Andres St">San Andres St</option>
                  <option value="San Diego St">San Diego St</option>
                  <option value="San Miguel St">San Miguel St</option>
                  <option value="San Pascual">San Pascual</option>
                  <option value="San Pedro">San Pedro</option>
                  <option value="Sanchez St">Sanchez St</option>
                  <option value="Santo Nino Street">Santo Nino Street</option>
                  <option value="Santo Rosario Street">Santo Rosario Street</option>
                  <option value="Schubert">Schubert</option>
                  <option value="Simon St">Simon St</option>
                  <option value="Skinita Shortcut">Skinita Shortcut</option>
                  <option value="Steve St">Steve St</option>
                  <option value="Sto. Nino">Sto. Nino</option>
                  <option value="Strauss">Strauss</option>
                  <option value="Sumapi Drive">Sumapi Drive</option>
                  <option value="Tabigo St">Tabigo St</option>
                  <option value="Thomas St">Thomas St</option>
                  <option value="Verdi">Verdi</option>
                  <option value="Villonco">Villonco</option>
                  <option value="Wagner">Wagner</option>
                </select>
              </label>

              <label>
                Incident Date
                <input type="date" name="incidentDate" value={form.incidentDate} onChange={handleChange} />
              </label>

              {error && <p className="message error">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowReportForm(false);
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResidentDashboard;
