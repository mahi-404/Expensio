const Group = require('../models/Group');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { group_name, members } = req.body;

    if (!group_name) {
      return res.status(400).json({ message: 'Please provide a group name' });
    }

    // Include the creator in the members list if not already there
    const groupMembers = members || [];
    if (!groupMembers.includes(req.user.id)) {
      groupMembers.push(req.user.id);
    }

    const group = await Group.create({
      group_name,
      created_by: req.user.id,
      members: groupMembers,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email upi_id');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to view this group' });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupDetails,
};
