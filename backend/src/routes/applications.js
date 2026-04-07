const express = require('express');
const router = express.Router();
const {
  createApplication,
  getApplication,
  getDecision,
  listApplications,
} = require('../controllers/applicationController');
const { validateApplication } = require('../middleware/validate');

router.post('/', validateApplication, createApplication);
router.get('/', listApplications);
router.get('/:id', getApplication);
router.get('/:id/decision', getDecision);

module.exports = router;
