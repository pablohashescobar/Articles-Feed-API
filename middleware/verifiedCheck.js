const User = require("../models/User");


module.exports = async function (req, res, next) {
    //Get Token from the header

    try {
        let user = await User.findOne({ _id: req.user.id });
        console.log(user);
        if (!(user.is_verified)) {

            return res.status(401).json({ msg: "User is not verified" });
        }
        next();

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }

}