const bcrypt = require("bcryptjs");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

const User = require("../models/user");
const generateToken = require("../utils/jwt");
const userAuth = require("../middleware/userauth");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = function (app) {

/* ================= GOOGLE LOGIN ================= */

app.post("/api/google-login", async (req, res) => {

  try {

    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {

      user = await User.create({
        name,
        email,
        password: "google-auth",
        provider: "google",
        role: "user",
        isVerified: true
      });

    }

    const jwtToken = generateToken(user,"user");

    res.json({
      msg: "Google login success",
      token: jwtToken,
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        role:"user"
      }
    });

  } catch(err){

    console.error(err);
    res.status(500).json({msg:"Google authentication failed"});

  }

});


/* ================= REGISTER ================= */

app.post("/api/register", async (req,res)=>{

try{

const {name,email,password}=req.body;

if(!name || !email || !password){
return res.status(400).json({msg:"All fields required"});
}

const exist=await User.findOne({email});

if(exist){
return res.status(400).json({msg:"User already exists"});
}

const hash=await bcrypt.hash(password,10);

const user=await User.create({
name,
email,
password:hash,
role:"user"
});

const token=generateToken(user,"user");

res.status(201).json({
msg:"Registered successfully",
token,
user:{
id:user._id,
name:user.name,
email:user.email,
role:"user"
}
});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

});


/* ================= LOGIN ================= */

app.post("/api/login", async(req,res)=>{

try{

const {email,password}=req.body;

const user=await User.findOne({email});

if(!user){
return res.status(404).json({msg:"User not found"});
}

const match=await bcrypt.compare(password,user.password);

if(!match){
return res.status(400).json({msg:"Wrong password"});
}

const token=generateToken(user,"user");

res.json({
msg:"Login success",
token,
user:{
id:user._id,
name:user.name,
email:user.email,
role:"user"
}
});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

});


/* ================= FORGOT PASSWORD ================= */

app.post("/api/forgot-password", async(req,res)=>{

try{

const {email}=req.body;
console.log("Forgot password request for email:", email);

const user=await User.findOne({email});
console.log("User found:", user);

if(!user){
return res.status(404).json({msg:"User not found"});
}

const token=crypto.randomBytes(32).toString("hex");

user.resetToken=token;
user.resetTokenExpire=new Date(Date.now()+1000*60*15);

await user.save();

const resetLink=`${process.env.FRONTEND_URL}/reset-password/${token}`;
console.log("sending reset email to:", user.email);

/* SEND EMAIL USING SENDGRID */

await sgMail.send({
  to: user.email,
  from: "kaushalsharma97299@gmail.com",
  subject: "Reset Password",

  text: `Reset your password using this link: ${resetLink}`,

  html: `
  <h3>Password Reset</h3>
  <p>Click below to reset your password</p>
  <a href="${resetLink}">${resetLink}</a>
  `
});

res.json({
success:true,
msg:"Reset password link sent to email"
});

}catch(err){
  console.log("sendgrid error:");
  console.log(err.response?.body || err);
res.status(500).json({error:"Server error"});

}

});


/* ================= RESET PASSWORD ================= */

app.post("/api/reset-password/:token", async(req,res)=>{

try{

const {token}=req.params;
const {password}=req.body;

const user=await User.findOne({
resetToken:token,
resetTokenExpire:{ $gt: Date.now() }
});

if(!user){
return res.status(400).json({msg:"Invalid or expired token"});
}

const hash=await bcrypt.hash(password,10);

user.password=hash;
user.resetToken=undefined;
user.resetTokenExpire=undefined;

await user.save();

res.json({
success:true,
msg:"Password reset successful"
});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

});


/* ================= GET PROFILE ================= */

app.get("/api/profile",userAuth,async(req,res)=>{

try{

const user=await User.findById(req.user.id).select("-password");

if(!user){
return res.status(404).json({msg:"User not found"});
}

res.json({
success:true,
user
});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

});


/* ================= UPDATE PROFILE ================= */

app.put("/api/profile",userAuth,async(req,res)=>{

try{

const {
name,
phone,
bio,
emergency,
village,
district,
state,
pincode,
avatar,
dob,
gender,
address
}=req.body;

const updated=await User.findByIdAndUpdate(

req.user.id,
{
name,
phone,
bio,
emergency,
village,
district,
state,
pincode,
avatar,
dob,
gender,
address
},
{new:true}

).select("-password");

res.json({
success:true,
msg:"Profile updated successfully",
user:updated
});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

});


/* ================= PINCODE LOOKUP ================= */

app.get("/api/pincode/:pin",userAuth,async(req,res)=>{

try{

const {pin}=req.params;

if(!/^[0-9]{6}$/.test(pin)){
return res.status(400).json({msg:"Invalid pincode"});
}

const response=await axios.get(
`https://api.postalpincode.in/pincode/${pin}`
);

const data=response.data;

if(!data || data[0].Status!=="Success" || !data[0].PostOffice?.length){
return res.status(404).json({msg:"Pincode not found"});
}

const addressList=data[0].PostOffice.map(post=>({
village:post.Name,
district:post.District,
state:post.State,
block:post.Block,
country:post.Country
}));

res.json({
success:true,
addressList
});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

});

};