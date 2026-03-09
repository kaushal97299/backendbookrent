const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({

/* USER */

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
default:null
},

name:{
type:String,
required:true
},

email:{
type:String,
required:true
},

/* ISSUE CATEGORY */

category:{
type:String,
enum:[
"booking",
"payment",
"availability",
"complaint",
"other"
],
default:"other"
},

/* MESSAGE  by*/

message:{
type:String,
required:true
},

/* ATTACHMENT (optional screenshot) */

attachment:{
type:String,
default:""
},

/* ADMIN REPLY */

adminReply:{
type:String,
default:""
},

/* INTERNAL ADMIN NOTE */

adminNote:{
type:String,
default:""
},

/* PRIORITY */

priority:{
type:String,
enum:["low","normal","high","urgent"],
default:"normal"
},

/* STATUS */

status:{
type:String,
enum:[
"new",
"seen",
"in-progress",
"replied",
"closed"
],
default:"new"
},

/* ADMIN REPLY TIME */

repliedAt:{
type:Date,
default:null
},

/* CREATED */

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Contact",ContactSchema);