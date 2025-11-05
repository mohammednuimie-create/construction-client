const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

router.get('/', async (req, res) => {
  try {
    const { project, status, priority } = req.query;
    const query = {};
    
    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const issues = await Issue.find(query)
      .populate('project', 'name')
      .populate('reportedBy', 'name email')
      .sort({ reportedDate: -1 });
    
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('project')
      .populate('reportedBy');
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issue', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();
    
    const populatedIssue = await Issue.findById(issue._id)
      .populate('project')
      .populate('reportedBy');
    
    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create issue', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project').populate('reportedBy');
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update issue', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete issue', message: error.message });
  }
});

module.exports = router;



