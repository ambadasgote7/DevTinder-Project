const express = require("express");
const profileRouter = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/view", isAuthenticated, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).send("Failed to fetch profile");
  }
});

profileRouter.patch("/edit", isAuthenticated, async (req, res) => {
  try {
    if (!validateEditProfileData(req.body)) {
      return res.status(400).send("Invalid edit fields");
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "photoUrl",
      "age",
      "gender",
      "about"
    ];

    const user = req.user;

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.skills !== undefined) {
      user.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : [];
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});



profileRouter.patch('/password', async (req, res) => {
    try {
        const {emailId, password, newPassword } = req.body;

        if (!emailId || !password || !newPassword) {
            return res.status(400).send("All fields are required");
        }

        const user = await User.findOne({emailId: emailId});
            if (!user) {
                throw new Error("Invalid Credentails");
            }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send("Incorrect current password");
        } 

        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.password = passwordHash;

        await user.save();

        res.send("Password changed successfully");

    } catch (err) {
        res.send("Error : " + err);
    }

});

module.exports = profileRouter;