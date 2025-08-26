const mongoose = require("mongoose");
const Listing = require("../model/listing.js");

const initData = require("./data.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"68921546cb7324563acf5594"}));
    await Listing.insertMany(initData.data);
    console.log("data was inserted");
}

initDB();