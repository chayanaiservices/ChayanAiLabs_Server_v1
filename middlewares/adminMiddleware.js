module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized - No user found",
      });
    }

    if (req.user.userType !== "Admin") {
      return res.status(403).send({
        success: false,
        message: "Only Admin Access",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unauthorized access",
      error,
    });
  }
};