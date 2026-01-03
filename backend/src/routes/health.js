const router = require("express").Router();
const pool = require("../config/db");   // adjust path if needed

router.get("/health", async (req,res)=>{
  try {
    await pool.query("SELECT 1");
    res.json({status:"ok", database:"connected"});
  } catch {
    res.status(500).json({status:"error", database:"disconnected"});
  }
});

module.exports = router;
