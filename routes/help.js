const Help = require("../models/Help");

module.exports = function(app){

/* ================= GET ARTICLES ================= */

app.get("/api/help/articles", async(req,res)=>{

try{

const articles = await Help.find({
type:"article"
}).sort({createdAt:-1});

res.json(articles);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});


/* ================= GET FAQ ================= */

app.get("/api/help/faq", async(req,res)=>{

try{

const faqs = await Help.find({
type:"faq"
}).sort({order:1});

res.json(faqs);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});


/* ================= GET SINGLE ARTICLE ================= */

app.get("/api/help/:slug", async(req,res)=>{

try{

const article = await Help.findOne({
slug:req.params.slug,
type:"article"
});

if(!article){
return res.status(404).json({message:"Article not found"});
}

res.json(article);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});

};