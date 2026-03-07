const Contact = require("../models/Contact");
const userAuth = require("../middleware/userauth");
const { Resend } = require("resend");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= AUTO CREATE UPLOAD FOLDER ================= */

const uploadDir = path.join(__dirname, "../uploads/contact");

if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================= FILE UPLOAD ================= */

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null, uploadDir);
},

filename:(req,file,cb)=>{
cb(null, Date.now() + path.extname(file.originalname));
}

});

const upload = multer({storage});

module.exports = function(app){

/* ================= CREATE CONTACT ================= */

app.post("/api/contact", userAuth, upload.single("attachment"), async(req,res)=>{

try{

const {name,email,message,category} = req.body;
const user = req.user;

let attachmentFile = "";

if(req.file && req.file.filename){
attachmentFile = req.file.filename;
}

/* SAVE MESSAGE */

const contact = await Contact.create({

userId:user.id,
name,
email,
message,
category:category || "other",
attachment:attachmentFile,
priority:"normal",
status:"new"

});

/* SEND EMAIL TO ADMIN */

await resend.emails.send({

from:"onboarding@resend.dev",
to:process.env.ADMIN_EMAIL,

subject:"New Contact Message",

html:`

<h2>New Contact Message</h2>

<p><b>User ID:</b> ${user.id}</p>
<p><b>Name:</b> ${name}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Category:</b> ${category || "other"}</p>
<p><b>Message:</b> ${message}</p>

`

});

res.json({
message:"Message sent successfully. Our car dealer will contact you shortly."
});

}catch(err){

console.log("CONTACT ERROR:",err);
res.status(500).json({message:"Server error"});

}

});


/* ================= USER CONTACT MESSAGES ================= */

app.get("/api/contact/my", userAuth, async(req,res)=>{

try{

const messages = await Contact.find({
userId:req.user.id
}).sort({createdAt:-1});

res.json(messages);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});


/* ================= ADMIN CONTACT LIST ================= */

app.get("/api/admin/contact", async(req,res)=>{

try{

const contacts = await Contact.find()
.sort({createdAt:-1});

res.json(contacts);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});


/* ================= ADMIN REPLY ================= */

app.put("/api/admin/contact/reply/:id", async(req,res)=>{

try{

const {reply,adminNote,status,priority} = req.body;

const contact = await Contact.findByIdAndUpdate(

req.params.id,

{
adminReply:reply,
adminNote:adminNote || "",
status: status || "replied",
priority: priority || "normal",
repliedAt:new Date()
},

{new:true}

);

/* SEND EMAIL TO USER */

await resend.emails.send({

from:"onboarding@resend.dev",
to:contact.email,

subject:"Support Reply",

html:`

<h2>Support Reply</h2>

<p>${reply}</p>

<p>Our car dealer will contact you shortly if required.</p>

`

});

res.json(contact);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});


/* ================= DELETE CONTACT ================= */

app.delete("/api/admin/contact/:id", async(req,res)=>{

try{

await Contact.findByIdAndDelete(req.params.id);

res.json({message:"Deleted successfully"});

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});

};