const Listing = require("../model/listing");
const fs = require('fs');
const path = require('path');
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
        // Ensure owner exists to avoid template crashes when owner was not populated or missing
        if (!listing.owner) listing.owner = { username: 'Unknown', _id: null };
        // Ensure reviews is an array
        if (!Array.isArray(listing.reviews)) listing.reviews = [];
        // Ensure price exists
        if (typeof listing.price === 'undefined' || listing.price === null) listing.price = 0;

        // If image URL points to a local upload but the file is missing (ephemeral FS on Render),
        // replace it with a placeholder so server doesn't try to open a nonexistent file.
        try {
            if (listing.image && listing.image.url && listing.image.url.startsWith('/uploads/')) {
                const localPath = path.join(__dirname, '..', 'public', listing.image.url.replace(/^\//, ''));
                if (!fs.existsSync(localPath)) {
                    listing.image.url = '/images/placeholder.svg';
                }
            }
        } catch (e) {
            console.warn('Error checking local upload file existence:', e && e.message);
            listing.image.url = '/images/placeholder.svg';
        }

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

        let geojsonPoint = { type: "Point", coordinates: [77.2090, 28.6139] }; // Default: Delhi
        
        // Try to geocode the location if TomTom API key is available
        if (process.env.TOMTOM_API_KEY) {
            try {
                const address = req.body.listing.location;
                const response = await axios.get(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json`, {
                    params: {
                        key: process.env.TOMTOM_API_KEY,
                        timeout: 5000,
                        limit: 1
                    }
                });
                
                if (response.data.results && response.data.results.length > 0) {
                    const position = response.data.results[0].position;
                    geojsonPoint = {
                        type: "Point",
                        coordinates: [position.lon, position.lat] 
                    };
                } else {
                    console.warn('TomTom geocoding returned no results for:', address);
                }
            } catch (geoErr) {
                console.warn('Geocoding error (using default coordinates):', geoErr.message);
            }
        } else {
            console.warn('TOMTOM_API_KEY not set - using default coordinates for new listing');
        }

        let filename = req.file.filename;
        // If Cloudinary is configured we get a remote path in req.file.path; otherwise use local uploads
        let url;
        if (process.env.CLOUD_NAME) {
            url = req.file.path; // cloudinary or storage provided path
        } else {
            // local disk storage: serve from /uploads
            url = `/uploads/${filename}`;
        }
        
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = geojsonPoint;
        newListing.category = req.body.listing.category;
        
        let savedListing = await newListing.save();
        console.log('New listing created:', savedListing._id);
        req.flash("success", "New Listing Created!");
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
                 let filename = req.file.filename;
                 let url;
                 if (process.env.CLOUD_NAME) {
                     url = req.file.path;
                 } else {
                     url = `/uploads/${filename}`;
                 }
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