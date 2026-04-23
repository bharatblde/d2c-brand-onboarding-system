require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();   

app.use(cors());        
app.use(express.json());

connectDB();

app.use("/api", require("./routes/brandRoutes"));

app.get("/", (req, res) => {
  res.send("API Running Successfully");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});