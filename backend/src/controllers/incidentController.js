const Incident = require('../models/Incident');

const createIncident = async (req, res, next) => {
  try {
    const { title, description, location, incidentDate } = req.body;

    const incident = await Incident.create({
      title,
      description,
      location,
      incidentDate,
      reportedBy: req.user._id
    });

    res.status(201).json({
      message: 'Incident reported successfully.',
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

const getResidentIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user._id })
      .populate('assignedTo', 'fullName email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Resident incidents fetched successfully.',
      data: incidents
    });
  } catch (error) {
    next(error);
  }
};

const updateIncidentByResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, location, incidentDate, residentNotes } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found.' });
    }

    if (incident.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own reported incidents.' });
    }

    if (typeof description !== 'undefined') {
      incident.description = description;
    }

    if (typeof location !== 'undefined') {
      incident.location = location;
    }

    if (typeof incidentDate !== 'undefined') {
      incident.incidentDate = incidentDate;
    }

    if (typeof residentNotes !== 'undefined') {
      incident.residentNotes = residentNotes;
    }

    await incident.save();

    res.status(200).json({
      message: 'Reported incident updated successfully.',
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

const getAllIncidentsForAdmin = async (req, res, next) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'fullName email role')
      .populate('assignedTo', 'fullName email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All incidents fetched successfully.',
      data: incidents
    });
  } catch (error) {
    next(error);
  }
};

const updateIncidentByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, adminNotes } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found.' });
    }

    if (status) {
      incident.status = status;
    }

    if (typeof assignedTo !== 'undefined') {
      incident.assignedTo = assignedTo || null;
    }

    if (typeof adminNotes !== 'undefined') {
      incident.adminNotes = adminNotes;
    }

    await incident.save();

    res.status(200).json({
      message: 'Incident updated by admin successfully.',
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

const getAssignedIncidentsForPersonnel = async (req, res, next) => {
  try {
    const incidents = await Incident.find({ assignedTo: req.user._id })
      .populate('reportedBy', 'fullName email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Assigned incidents fetched successfully.',
      data: incidents
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignedIncidentByPersonnel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, personnelNotes } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found.' });
    }

    if (!incident.assignedTo || incident.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update incidents assigned to you.' });
    }

    if (status) {
      incident.status = status;
    }

    if (typeof personnelNotes !== 'undefined') {
      incident.personnelNotes = personnelNotes;
    }

    await incident.save();

    res.status(200).json({
      message: 'Assigned incident updated successfully.',
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  getResidentIncidents,
  updateIncidentByResident,
  getAllIncidentsForAdmin,
  updateIncidentByAdmin,
  getAssignedIncidentsForPersonnel,
  updateAssignedIncidentByPersonnel
};
