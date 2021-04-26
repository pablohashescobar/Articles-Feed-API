const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  //Get Token from the header
  const token = req.header("x-auth-token");

  //check if no token

  if (!token) {
    return res.status(401).json({ msg: "No token, Authorization denied" });
  }

  const jwtsecret = process.env.JWT_SECRET;

  //Verify token
  try {
    const decoded = jwt.verify(token, jwtsecret);

    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not Valid" });
  }
};
