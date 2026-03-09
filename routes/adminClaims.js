const Claim = require("../models/Claim");
const adminProtect = require("../middleware/admin");

module.exports = (app)=>{

/* ================= GET ALL CLAIMS ================= */

app.get("/api/admin/claims",adminProtect,async(req,res)=>{

try{

const claims = await Claim.find()
.populate("bookingId")
.populate("userId","name email")
.sort({createdAt:-1});

res.json(claims);

}catch(err){

console.log(err);

res.status(500).json({
message:"Fetch failed"
});

}

});


/* ================= APPROVE CLAIM ================= */

app.patch(
"/api/admin/claims/approve/:id",
adminProtect,
async(req,res)=>{

try{

const claim = await Claim.findByIdAndUpdate(
req.params.id,
{
status:"approved",
approvedAt:new Date()
},
{new:true}
);

res.json(claim);

}catch(err){

res.status(500).json({
message:"Approve failed"
});

}

});


/* ================= REJECT CLAIM ================= */

app.patch(
"/api/admin/claims/reject/:id",
adminProtect,
async(req,res)=>{

try{

const claim = await Claim.findByIdAndUpdate(
req.params.id,
{
status:"rejected",
rejectedAt:new Date()
},
{new:true}
);

res.json(claim);

}catch(err){

res.status(500).json({
message:"Reject failed"
});

}

});


/* ================= MARK PAID ================= */

app.patch(
"/api/admin/claims/pay/:id",
adminProtect,
async(req,res)=>{

try{

const claim = await Claim.findByIdAndUpdate(
req.params.id,
{
status:"paid",
paidAt:new Date()
},
{new:true}
);

res.json(claim);

}catch(err){

res.status(500).json({
message:"Payment failed"
});

}

});

};