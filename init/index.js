const mongoose = require("mongoose");
const Listing = require("../model/listing.js");

const initData = require("./data.js");

// Use ATLAS_URL if provided, otherwise fall back to local MongoDB
const MONGO_URL = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

async function initDB(){
    try{
        await Listing.deleteMany({});

        // Optionally set owner via env var SEED_OWNER (24-char hex user id)
        let dataToInsert = initData.data;
        if (process.env.SEED_OWNER) {
            dataToInsert = initData.data.map((obj) => ({ ...obj, owner: process.env.SEED_OWNER }));
        }

        await Listing.insertMany(dataToInsert);
        console.log("data was inserted");
    } catch(err){
        console.error('Error while seeding data:', err);
        throw err;
    }
}

main()
  .then(() => initDB())
  .then(async () => {
    await mongoose.connection.close();
    console.log('Seeding finished and DB connection closed');
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Failed to connect to DB for seeding:', err);
    try { await mongoose.connection.close(); } catch(e){}
    process.exit(1);
  });