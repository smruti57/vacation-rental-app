const mongoose = require("mongoose");
const review = require("./review");
const { required } = require("joi");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
            ref:"User",
    },
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    category: {
        type: String,
        enum: [
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Mountains",
            "Amazing Pools",
            "Beach",
            "Camping",
            "Farms",
            "Arctic",
            "Dome",
            "Boats"
        ],
        required: true,
    },
});

const Listing = mongoose.model("listing",ListingSchema);
module.exports=Listing;