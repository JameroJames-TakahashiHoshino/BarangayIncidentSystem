const express = require('express');
const { body, param } = require('express-validator');

const {
  createIncident,
  getResidentIncidents,
  updateIncidentByResident,
  getAllIncidentsForAdmin,
  updateIncidentByAdmin,
  getAssignedIncidentsForPersonnel,
  updateAssignedIncidentByPersonnel
} = require('../controllers/incidentController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

const incidentStatuses = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'];

router.post(
  '/',
  protect,
  authorizeRoles('resident'),
  [
    body('title').notEmpty().withMessage('Title is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('incidentDate').isISO8601().withMessage('incidentDate must be a valid date (YYYY-MM-DD).')
  ],
  validateRequest,
  createIncident
);

router.get('/my-reports', protect, authorizeRoles('resident'), getResidentIncidents);

router.patch(
  '/resident/:id',
  protect,
  authorizeRoles('resident'),
  [
    param('id').isMongoId().withMessage('Valid incident id is required.'),
    body('description').optional().isString().withMessage('description must be a string.'),
    body('location').optional().isString().withMessage('location must be a string.'),
    body('incidentDate').optional().isISO8601().withMessage('incidentDate must be a valid date (YYYY-MM-DD).'),
    body('residentNotes').optional().isString().withMessage('residentNotes must be a string.')
  ],
  validateRequest,
  updateIncidentByResident
);

router.get('/admin/all', protect, authorizeRoles('admin'), getAllIncidentsForAdmin);

router.patch(
  '/admin/:id',
  protect,
  authorizeRoles('admin'),
  [
    param('id').isMongoId().withMessage('Valid incident id is required.'),
    body('status').optional().isIn(incidentStatuses).withMessage('Invalid status.'),
    body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('assignedTo must be a valid user id.'),
    body('adminNotes').optional().isString().withMessage('adminNotes must be a string.')
  ],
  validateRequest,
  updateIncidentByAdmin
);

router.get('/personnel/assigned', protect, authorizeRoles('personnel'), getAssignedIncidentsForPersonnel);

router.patch(
  '/personnel/:id',
  protect,
  authorizeRoles('personnel'),
  [
    param('id').isMongoId().withMessage('Valid incident id is required.'),
    body('status').optional().isIn(incidentStatuses).withMessage('Invalid status.'),
    body('personnelNotes').optional().isString().withMessage('personnelNotes must be a string.')
  ],
  validateRequest,
  updateAssignedIncidentByPersonnel
);

module.exports = router;
