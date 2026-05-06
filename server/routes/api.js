const express = require('express');
const router = express.Router();
const Node = require('../models/Node');
const Edge = require('../models/Edge');

// ─── GET /api/nodes ─── Returns all nodes
router.get('/nodes', async (req, res) => {
  try {
    const nodes = await Node.find({}).lean();
    res.json({ success: true, data: nodes });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch nodes' });
  }
});

// ─── GET /api/edges ─── Returns all edges
router.get('/edges', async (req, res) => {
  try {
    const edges = await Edge.find({}).lean();
    res.json({ success: true, data: edges });
  } catch (error) {
    console.error('Error fetching edges:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch edges' });
  }
});

// ─── GET /api/search?q= ─── Search nodes by name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, data: [] });
    }

    const nodes = await Node.find({
      name: { $regex: q, $options: 'i' },
    })
      .limit(10)
      .lean();

    res.json({ success: true, data: nodes });
  } catch (error) {
    console.error('Error searching nodes:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// ─── POST /api/nodes ─── Add a new node (Admin)
router.post('/nodes', async (req, res) => {
  try {
    const node = new Node(req.body);
    await node.save();
    res.status(201).json({ success: true, data: node });
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── PUT /api/nodes/:id ─── Update a node (Admin)
router.put('/nodes/:id', async (req, res) => {
  try {
    const node = await Node.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }
    res.json({ success: true, data: node });
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── POST /api/edges ─── Add a new edge (Admin)
router.post('/edges', async (req, res) => {
  try {
    const edge = new Edge(req.body);
    await edge.save();
    res.status(201).json({ success: true, data: edge });
  } catch (error) {
    console.error('Error creating edge:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── DELETE /api/nodes/:id ─── Delete a node (Admin)
router.delete('/nodes/:id', async (req, res) => {
  try {
    const node = await Node.findOneAndDelete({ id: req.params.id });
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }
    // Also remove related edges
    await Edge.deleteMany({ $or: [{ from: req.params.id }, { to: req.params.id }] });
    res.json({ success: true, message: 'Node and related edges deleted' });
  } catch (error) {
    console.error('Error deleting node:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
