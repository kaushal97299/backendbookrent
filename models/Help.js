const mongoose = require("mongoose");

const HelpSchema = new mongoose.Schema({

type:{
type:String,
enum:["article","faq"],
default:"article"
},

/* ARTICLE */

title:{
type:String
},

slug:{
type:String,
default:""
},

content:{
type:String
},

/* FAQ */

question:{
type:String,
default:""
},

answer:{
type:String,
default:""
},

category:{
type:String,
default:"general"
},

order:{
type:Number,
default:0
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Help",HelpSchema);