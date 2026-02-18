const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const {  isAuthenticated } = require("../middlewares/auth");
const  {ConnectionRequest}  = require("../models/connectionRequest");

requestRouter.post('/send/:status/:toUserId', isAuthenticated, async (req, res) => {
    
    try {

        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        
        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({message : "Invalid status type : " + status});
        }

        const toUser = await User.findById(toUserId);
        if(!toUser) {
            return res.status(400).json({message : "User not found"});
        }

        const existingConnctionRequest = await ConnectionRequest.findOne({
            $or : [
                {fromUserId, toUserId},
                {fromUserId : toUserId, toUserId : fromUserId}
            ],
        });
        if(existingConnctionRequest) {
            return res.status(400).send("Connection request already exists");
        }

        const connctionRequest = new ConnectionRequest({
            fromUserId, toUserId,status
        });

        const data = await connctionRequest.save();
        res.json({
            message: req.user.firstName + " is " + status + " in " + toUser.firstName,
        });

    } catch (err) {
        res.status(400).send("Error : " + err);
    }
    
});

requestRouter.post('/review/:status/:requestId', isAuthenticated, async (req, res) => {
    try {

        const loggedInUser = req.user;
        const { status, requestId } = req.params; 

        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({
                message : "Status not allowed !"
            })
        }

        const connctionRequest = await ConnectionRequest.findOne({
            _id : requestId,
            toUserId : loggedInUser._id,
            status : "interested",
        });

        if(!connctionRequest) {
            return res.status(400).json({
                message : "Connection request not found",
            })
        }

        connctionRequest.status = status;

        const data = await connctionRequest.save();

        res.json({
            message : "Connection request " + status, 
            data
        });

    } catch (err) {
        res.status(400).send("Error : " + err.message);
    }
});

module.exports = requestRouter;