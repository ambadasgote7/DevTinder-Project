const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
         required : true,
    },
    status : {
        type :String,
        required : true,
        enum : {
            values : ["ignored", "interested", "accepted", "rejected"],
            message : `{value} is incorrect status type`
        },
    },
   rejectedByAdmin: {
  type: Boolean,
  default: false
},
moderationReason: {
  type: String
}

}, {timestamps : true});

connectionRequestSchema.index({fromUserId : 1, toUserId : 1});

connectionRequestSchema.pre("save", function (next) {
    const connctionRequest = this;
    if(connctionRequest.fromUserId.equals(connctionRequest.toUserId)) {
        throw new Error("Cannot send connection request to yourself");
    }
    next();
});

const ConnectionRequest = new  mongoose.model('ConnectionRequest', connectionRequestSchema)

module.exports = {
    ConnectionRequest
}