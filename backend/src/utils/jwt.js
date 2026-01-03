const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "fallback_test_secret_key_32_chars_long";

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "24h" });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
