const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupDetails,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createGroup).get(protect, getGroups);
router.route('/:id').get(protect, getGroupDetails);

module.exports = router;
