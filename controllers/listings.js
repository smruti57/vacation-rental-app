const Listing = require("../model/listing");
const axios = require('axios');

module.exports.index = async(req,res)=>{
    const { category,country  } = req.query;
    
    let allListings;
    if (category) {
    allListings = await Listing.find({ category });
    }else if(country){
    
     allListings = await Listing.find({
      $or: [
        { country: { $regex: country, $options: "i" } },  // search in country
        { title: { $regex: country, $options: "i" } },    // search in title
        { location: { $regex: country, $options: "i" } }, // search in location
      ],
    });
    }else {
    allListings = await Listing.find({});
    }
    res.render("listings/index.ejs",{allListings,category,country});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res,next)=>{
    try {
        const { id } = req.params;
        if (!id) {
            req.flash('error', 'Invalid listing id');
            return res.redirect('/listings');
        }
        const listing = await Listing.findById(id)
            .populate({ path: 'reviews', populate: { path: 'author' } })
            .populate('owner');

        if (!listing) {
            req.flash('error','Listing you requested for does not exist!');
            return res.redirect('/listings');
        }

        // Defensive: ensure fields exist before rendering
        if (!listing.image) listing.image = { url: '', filename: '' };
        if (!listing.geometry) listing.geometry = { type: 'Point', coordinates: [0,0] };

        res.render('listings/show.ejs', { listing, currUser: req.user });
    } catch (err) {
        console.error('Error in showListing:', err);
        req.flash('error', 'Unable to load the listing.');
        return res.redirect('/listings');
    }
};

module.exports.renderEditForm = async(req,res,next)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    // Defensive checks in case image is missing
    let originalImageUrl = '';
    if (listing.image && listing.image.url) {
        try {
            originalImageUrl = listing.image.url.replace('/upload','/upload/w_250');
        } catch (e) {
            originalImageUrl = listing.image.url;
        }
    }
    res.render('listings/edit.ejs',{ listing, originalImageUrl });
};

module.exports.createListing = async(req,res,next)=>{
    try {
        // Check if file was uploaded
        if (!req.file) {
            req.flash("error", "Please upload an image!");
            return res.redirect("/listings/new");
        }

        const address = req.body.listing.location;
        const response = await axios.get(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json`, {
            params: {
                key: process.env.TOMTOM_API_KEY,
                limit: 1
            }
        });
        
        if (!response.data.results || response.data.results.length === 0) {
            req.flash("error", "Location not found. Please enter a valid location!");
            return res.redirect("/listings/new");
        }

        const position = response.data.results[0].position;
        const geojsonPoint = {
         type: "Point",
          coordinates: [position.lon, position.lat] 
        };
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing= new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        newListing.geometry=geojsonPoint;
        newListing.category=req.body.listing.category
        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error creating listing:", err);
        req.flash("error", `Error: ${err.message}`);
        res.redirect("/listings/new");
    }
};

module.exports.updateListing = async(req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
         let url = req.file.path;
         let filename = req.file.filename;
         listing.image={url,filename};
         await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res,next)=>{
     let {id}=req.params;
    let deleteListing= await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};