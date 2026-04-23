const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const Note = require("../models/Note");

// Allowed statuses
const allowedStatuses = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "ACCEPTED", "REJECTED"];

// Status flow rules
const validTransitions = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["SHORTLISTED"],
  SHORTLISTED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: []
};

// CREATE BRAND
exports.createBrand = async (req, res) => {
  try {
    const { brand_name, founder_name, category, monthly_revenue, website } = req.body;

    const brand = await Brand.create({
      brand_name,
      founder_name,
      category,
      monthly_revenue,
      website,
    });

    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL BRANDS (FILTER)
exports.getBrands = async (req, res) => {
  try {
    const filter = {};

    // ✅ Validate status filter
    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({ error: "Invalid status filter" });
      }
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const brands = await Brand.find(filter);
    res.json(brands);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE BRAND
exports.getBrand = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const notes = await Note.find({ brand_id: req.params.id });

    res.json({
      ...brand.toObject(),
      notes
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const newStatus = req.body.status;

    // ✅ Check status provided
    if (!newStatus) {
      return res.status(400).json({ error: "Status is required" });
    }

    // ✅ Validate status value
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // ✅ Validate transition
    if (!validTransitions[brand.status].includes(newStatus)) {
      return res.status(400).json({ error: "Invalid status transition" });
    }

    brand.status = newStatus;
    await brand.save();

    res.json(brand);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD NOTE
exports.addNote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // ✅ Check brand exists
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "Note cannot be empty" });
    }

    const newNote = await Note.create({
      brand_id: req.params.id,
      note
    });

    res.status(201).json(newNote);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SUMMARY
exports.getSummary = async (req, res) => {
  try {
    const total = await Brand.countDocuments();

    const summary = {
      total,
      submitted: await Brand.countDocuments({ status: "SUBMITTED" }),
      under_review: await Brand.countDocuments({ status: "UNDER_REVIEW" }),
      shortlisted: await Brand.countDocuments({ status: "SHORTLISTED" }),
      accepted: await Brand.countDocuments({ status: "ACCEPTED" }),
      rejected: await Brand.countDocuments({ status: "REJECTED" }),
    };

    res.json(summary);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};