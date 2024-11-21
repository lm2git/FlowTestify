const Test = require('../models/Test');

// Create a New Test
const createTest = async (req, res) => {
  const { tenantId, name, steps } = req.body;

  try {
    const newTest = new Test({ tenantId, name, steps });
    await newTest.save();

    res.status(201).json({ message: 'Test created successfully', test: newTest });
  } catch (error) {
    res.status(500).json({ message: 'Error creating test', error });
  }
};

// Get All Tests for a Tenant
const getTests = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const tests = await Test.find({ tenantId });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests', error });
  }
};

// Get a Single Test
const getTestById = async (req, res) => {
  const { id } = req.params;

  try {
    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test', error });
  }
};

// Update a Test
const updateTest = async (req, res) => {
  const { id } = req.params;
  const { name, steps } = req.body;

  try {
    const updatedTest = await Test.findByIdAndUpdate(
      id,
      { name, steps },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Test updated successfully', test: updatedTest });
  } catch (error) {
    res.status(500).json({ message: 'Error updating test', error });
  }
};

// Delete a Test
const deleteTest = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTest = await Test.findByIdAndDelete(id);

    if (!deletedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting test', error });
  }
};

module.exports = {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
};
