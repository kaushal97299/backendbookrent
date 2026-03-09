const Claim = require("../models/Claim");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userAuth = require("../middleware/auth");

module.exports = (app)=>{

/* UPLOAD DIR */

const uploadDir = path.join(__dirname,"../uploads/claims");

if(!fs.existsSync(uploadDir)){
fs.mkdirSync(uploadDir,{recursive:true});
}

/* MULTER */

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,uploadDir);
},

filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname);
}

});

const upload = multer({storage});

/* ================= CREATE CLAIM ================= */

app.post(
"/api/claims/create",
userAuth,
upload.array("images",5),

async(req,res)=>{

try{

const files =
req.files?.map(
f=>`/uploads/claims/${f.filename}`
) || [];

const claim = await Claim.create({

bookingId:req.body.bookingId,
carId:req.body.carId,
carName:req.body.carName,

userId:req.user.id,   // ✅ token se userId

customerName:req.body.customerName,

reason:req.body.reason,
description:req.body.description,

amount:req.body.amount,

images:files

});

res.json(claim);

}catch(err){

console.log("Claim create error",err);

res.status(500).json({
message:"Claim failed"
});

}

}

/* ================= GET ALL CLAIMS ================= */

);

app.get("/api/claims",async(req,res)=>{

try{

const claims = await Claim.find()
.sort({createdAt:-1});

res.json(claims);

}catch(err){

res.status(500).json({
message:"Fetch failed"
});

}

});

/* ================= GET USER CLAIMS ================= */

app.get(
"/api/claims/my",
userAuth,
async(req,res)=>{

try{

const claims = await Claim.find({
userId:req.user.id
}).sort({createdAt:-1});

res.json(claims);

}catch(err){

res.status(500).json({
message:"Fetch failed"
});

}

}

);

};