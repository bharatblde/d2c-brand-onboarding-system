const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/brandController");
const { validateCreateBrand } = require("../middleware/validate");

router.post("/brands", validateCreateBrand, ctrl.createBrand);
router.get("/brands", ctrl.getBrands);
router.get("/brands/summary", ctrl.getSummary);
router.get("/brands/:id", ctrl.getBrand);
router.patch("/brands/:id/status", ctrl.updateStatus);
router.post("/brands/:id/notes", ctrl.addNote);

module.exports = router;