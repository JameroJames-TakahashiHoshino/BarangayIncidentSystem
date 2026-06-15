import { useEffect, useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import ResidentDashboard from './components/ResidentDashboard';
import AdminDashboard from './components/AdminDashboard';
import PersonnelDashboard from './components/PersonnelDashboard';
import { api } from './services/api';

const STORAGE_KEY = 'barangay_auth';

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const user = auth?.user;
  const token = auth?.token;

  const saveAuth = (authData) => {
    setAuth(authData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  };

  const clearMessages = () => {
    setErrorMessage('');
    setFeedbackMessage('');
  };

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setFeedbackMessage('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  const loadIncidentsByRole = async (currentToken, role) => {
    if (!currentToken || !role) {
      return;
    }

    if (role === 'resident') {
      const response = await api.getMyIncidents(currentToken);
      setIncidents(response.data || []);
      return;
    }

    if (role === 'admin') {
      const response = await api.getAllIncidentsForAdmin(currentToken);
      setIncidents(response.data || []);
      return;
    }

    if (role === 'personnel') {
      const response = await api.getAssignedIncidentsForPersonnel(currentToken);
      setIncidents(response.data || []);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!token || !user?.role) {
        return;
      }

      setLoading(true);
      clearMessages();
      try {
        await loadIncidentsByRole(token, user.role);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token, user?.role]);

  const handleLogin = async (form) => {
    setLoading(true);
    clearMessages();

    try {
      const loginResponse = await api.login(form);
      const loginData = loginResponse.data;
      const profileResponse = await api.getMyProfile(loginData.token);

      const authData = {
        token: loginData.token,
        user: profileResponse.data
      };

      saveAuth(authData);
      await loadIncidentsByRole(authData.token, authData.user.role);
      setFeedbackMessage('Login successful.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (form) => {
    setLoading(true);
    clearMessages();

    try {
      const registerResponse = await api.register(form);
      const registerData = registerResponse.data;
      const profileResponse = await api.getMyProfile(registerData.token);

      const authData = {
        token: registerData.token,
        user: profileResponse.data
      };

      saveAuth(authData);
      await loadIncidentsByRole(authData.token, authData.user.role);
      setFeedbackMessage('Account created successfully.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setIncidents([]);
    setUsers([]);
    clearMessages();
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleLoadUsers = async () => {
    if (!token) {
      return [];
    }
    setLoading(true);
    clearMessages();
    try {
      const response = await api.getAllUsers(token);
      const nextUsers = response.data || [];
      setUsers(nextUsers);
      return nextUsers;
    } catch (error) {
      setErrorMessage(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updateBody) => {
    if (!token) {
      return false;
    }
    setLoading(true);
    clearMessages();
    try {
      const response = await api.updateUser(token, userId, updateBody);
      await handleLoadUsers();
      setFeedbackMessage('User updated successfully.');

      if (response.data && response.data._id === user?._id && response.data.isActive === false) {
        handleLogout();
        return true;
      }

      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!token) {
      return false;
    }
    setLoading(true);
    clearMessages();
    try {
      await api.deleteUser(token, userId);
      await handleLoadUsers();
      setFeedbackMessage('User deleted successfully.');

      if (userId === user?._id) {
        handleLogout();
        return true;
      }

      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async (incidentForm) => {
    setLoading(true);
    clearMessages();
    try {
      await api.createIncident(token, incidentForm);
      await loadIncidentsByRole(token, user.role);
      setFeedbackMessage('Incident submitted successfully.');
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleResidentUpdate = async (incidentId, updateBody) => {
    setLoading(true);
    clearMessages();
    try {
      await api.updateIncidentByResident(token, incidentId, updateBody);
      await loadIncidentsByRole(token, user.role);
      setFeedbackMessage('Incident information updated successfully.');
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdate = async (incidentId, updateBody) => {
    setLoading(true);
    clearMessages();
    try {
      const payload = {
        status: updateBody.status,
        adminNotes: updateBody.adminNotes,
        assignedTo: updateBody.assignedTo || null
      };
      await api.updateIncidentByAdmin(token, incidentId, payload);
      await loadIncidentsByRole(token, user.role);
      setFeedbackMessage('Incident updated successfully.');
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePersonnelUpdate = async (incidentId, updateBody) => {
    setLoading(true);
    clearMessages();
    try {
      await api.updateAssignedIncidentByPersonnel(token, incidentId, updateBody);
      await loadIncidentsByRole(token, user.role);
      setFeedbackMessage('Assigned incident updated successfully.');
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isResident = user?.role === 'resident';
  const isAdmin = user?.role === 'admin';
  const isPersonnel = user?.role === 'personnel';

  return (
    <div className="app-shell">
      {!user && (
        <LoginForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loading}
          errorMessage={errorMessage}
        />
      )}

      {isResident && (
        <ResidentDashboard
          user={user}
          incidents={incidents}
          onCreateIncident={handleCreateIncident}
          onUpdateIncident={handleResidentUpdate}
          onLogout={handleLogout}
          loading={loading}
        />
      )}

      {(isAdmin || isPersonnel) && (
        <>
          {errorMessage && <p className="message error container-message">{errorMessage}</p>}

          {isAdmin && (
            <AdminDashboard
              user={user}
              incidents={incidents}
              users={users}
              onUpdate={handleAdminUpdate}
              onLoadUsers={handleLoadUsers}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onLogout={handleLogout}
              loading={loading}
            />
          )}

          {isPersonnel && (
            <PersonnelDashboard
              user={user}
              incidents={incidents}
              onUpdate={handlePersonnelUpdate}
              onLogout={handleLogout}
              loading={loading}
            />
          )}
        </>
      )}

      {(feedbackMessage || errorMessage) && (
        <div className={`toast ${errorMessage ? 'error' : 'success'}`}>
          {errorMessage || feedbackMessage}
        </div>
      )}
    </div>
  );
}

export default App;
