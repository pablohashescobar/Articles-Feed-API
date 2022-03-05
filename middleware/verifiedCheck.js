module.exports = function (req, res, next) {
    //Get Token from the header
    const user = req.user;
    if (!user.is_verified) {
        return res.status(401).json({ msg: "User is not verified" });
    }

    next();
};
