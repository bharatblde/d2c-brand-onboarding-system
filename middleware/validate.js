module.exports.validateCreateBrand = (req, res, next) => {
  const { brand_name, founder_name, category, monthly_revenue } = req.body;

  if (!brand_name || !founder_name || !category) {
    return res.status(400).json({ error: "brand_name, founder_name, category are required" });
  }

  if (monthly_revenue != null && monthly_revenue < 0) {
    return res.status(400).json({ error: "monthly_revenue must be >= 0" });
  }

  next();
};