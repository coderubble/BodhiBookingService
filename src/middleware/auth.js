const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.headers[ "x-access-token" ] || req.headers[ "authorization" ];
  if (!token) return res.status(401).send("Access denied. No token provided.");
  try {
    decode_token(token, ({ email_id, user_type, clinic_id }) => {
      req.user = {
        email_id,
        user_type,
        clinic_id
      }
    });
    next();
  } catch (ex) {
    console.error(`Error in auth middleware: ${token}`);
    res.status(400).send({ error: "Invalid token." });
  }
}

const decode_token = function (token, callback) {
  const result = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
  if (callback) {
    callback(result);
  } else {
    return result;
  }
};