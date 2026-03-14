const Booking = require("../models/Booking");
const Inventory = require("../models/Inventory");
const jwt = require("jsonwebtoken");

module.exports = function(app){

app.get("/api/booking/clientbooking", async(req,res)=>{

try{

const token = req.headers.authorization?.split(" ")[1];

if(!token){
return res.status(401).json({message:"No token"});
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);

const clientId = decoded.id;

/* client की cars निकालो */

const cars = await Inventory.find({ user: clientId });

const carIds = cars.map(car=>car._id);

/* उन्हीं cars की bookings */

const bookings = await Booking.find({
carId: { $in: carIds }
}).sort({ createdAt:-1 });

res.json(bookings);

}catch(err){

console.log("Booking fetch error:",err);

res.status(500).json({message:"Server error"});

}

});

};