const mongoose = require("mongoose");
const Help = require("../models/Help");
const helpData = require("../data/helpData");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
.then(async()=>{

console.log("MongoDB Connected");

await Help.deleteMany();

await Help.insertMany(helpData);

console.log("Help data inserted");

process.exit();

})
.catch(err=>{
console.log(err);
});