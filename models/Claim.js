const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({

  bookingId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Booking",
    required:true
  },

  carId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Inventory"
  },

  carName:{
    type:String,
    trim:true
  },

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true
  },

  customerName:{
    type:String,
    trim:true
  },

  reason:{
    type:String,
    trim:true,
    required:true
  },

  description:{
    type:String,
    trim:true
  },

  amount:{
    type:Number,
    default:0,
    min:0
  },

  images:{
    type:[String],
    default:[]
  },

  status:{
    type:String,
    enum:["pending","approved","rejected","paid"],
    default:"pending"
  },

  approvedAt:Date,
  rejectedAt:Date,
  paidAt:Date,

  
},{
  timestamps:true
});

module.exports = mongoose.model("Claim",claimSchema);