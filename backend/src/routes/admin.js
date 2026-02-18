const express = require('express');
const adminRouter = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { allowRoles } = require('../middlewares/role');
const User = require("../models/user");

const {ConnectionRequest} = require("../models/connectionRequest");

// Admin only
adminRouter.use(isAuthenticated, allowRoles('admin'));

adminRouter.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("firstName lastName emailId role isBlocked createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
});

adminRouter.get("/users", async (req, res) => {
  try {
    const { role, blocked, email } = req.query;

    const query = {};

    if (role) query.role = role;
    if (blocked !== undefined) query.isBlocked = blocked === "true";
    if (email) query.emailId = { $regex: email, $options: "i" };

    const users = await User.find(query)
      .select("firstName lastName emailId role isBlocked createdAt");

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
});

adminRouter.patch("/block/:userId", async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.userId) {
      return res.status(403).json({
        success: false,
        message: "Admin cannot block themselves"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User blocked successfully",
      user: {
        id: user._id,
        emailId: user.emailId,
        isBlocked: user.isBlocked
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to block user"
    });
  }
});

adminRouter.patch("/unblock/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User unblocked successfully",
      user: {
        id: user._id,
        emailId: user.emailId,
        isBlocked: user.isBlocked
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to unblock user"
    });
  }
});

adminRouter.patch("/role/:userId", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    // Prevent admin from changing their own role
    if (req.user._id.toString() === req.params.userId) {
      return res.status(403).json({
        success: false,
        message: "Admin cannot change their own role"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Role updated successfully",
      user: {
        id: user._id,
        emailId: user.emailId,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update role"
    });
  }
});

adminRouter.get("/connections", async (req, res) => {
  try {
    const requests = await ConnectionRequest.find()
      .populate("fromUserId", "emailId firstName")
      .populate("toUserId", "emailId firstName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch connection requests"
    });
  }
});

adminRouter.patch("/connections/:id/reject", async (req, res) => {
  try {
    const request = await ConnectionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found"
      });
    }

    request.status = "rejected";
    request.rejectedByAdmin = true;
    await request.save();

    res.json({
      success: true,
      message: "Connection rejected by admin"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to reject connection"
    });
  }
});

adminRouter.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      blockedUsers,
      totalRequests,
      acceptedConnections,
      rejectedByUsers,
      rejectedByAdmin,
      pendingRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isBlocked: true }),

      // All connection requests
      ConnectionRequest.countDocuments(),

      // Accepted connections
      ConnectionRequest.countDocuments({ status: "accepted" }),

      // Rejected by users (NOT admin)
      ConnectionRequest.countDocuments({
        status: "rejected",
        rejectedByAdmin: false
      }),

      // Rejected by admin
      ConnectionRequest.countDocuments({
        status: "rejected",
        rejectedByAdmin: true
      }),

      // Pending (ignored + interested)
      ConnectionRequest.countDocuments({
        status: { $in: ["ignored", "interested"] }
      })
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          totalUsers,
          totalAdmins,
          blockedUsers
        },
        connections: {
          totalRequests,
          acceptedConnections,
          rejectedByUsers,
          rejectedByAdmin,
          pendingRequests
        }
      }
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});



module.exports = adminRouter;
