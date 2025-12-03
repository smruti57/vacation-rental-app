if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer = null; // In-memory MongoDB instance (for dev)

const dbUrl=process.env.ATLAS_URL;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const seedData = require("./init/data.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());


const PORT = process.env.PORT || 8080;

async function startApp() {
  let connected = false;
  let mongoUrl = dbUrl;

  console.log('Starting app initialization...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('ATLAS_URL set:', !!dbUrl);

  try {
    if (!dbUrl) {
      throw new Error('ATLAS_URL environment variable not set');
    }
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    connected = true;
    console.log("✓ connected to Atlas MongoDB");
  } catch (err) {
    console.error("✗ Failed to connect to MongoDB:", err && err.message ? err.message : err);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ PRODUCTION ERROR: Cannot connect to Atlas MongoDB');
      console.error('Error details:', err.message);
      console.error('Check: 1) ATLAS_URL is correct, 2) MongoDB cluster allows Vercel IP, 3) IP whitelist is 0.0.0.0/0');
      throw err;
    }
    
    // Fallback: use in-memory MongoDB for development
    console.warn('\n📦 Starting in-memory MongoDB for local development...');
    try {
      mongoServer = await MongoMemoryServer.create();
      mongoUrl = mongoServer.getUri();
      await mongoose.connect(mongoUrl);
      connected = true;
      console.log("✓ Using in-memory MongoDB (data will be lost on restart)\n");
    } catch (memErr) {
      console.error("✗ Failed to start in-memory MongoDB:", memErr);
      console.warn('Continuing without DB (some features may not work)');
    }
  }

  // session options (store added only if DB connected)
  const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'thisshouldbechanged',
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  };

  if (connected) {
    try {
      // Use clientPromise from mongoose's underlying MongoClient for connect-mongo.
      // This is more robust in serverless environments than relying on mongoUrl alone.
      let clientPromise;
      try {
        const client = mongoose.connection.getClient && mongoose.connection.getClient();
        if (client) {
          clientPromise = Promise.resolve(client);
        }
      } catch (e) {
        clientPromise = undefined;
      }

      if (clientPromise) {
        const store = MongoStore.create({
          clientPromise,
          touchAfter: 24 * 3600,
        });
        store.on('error', (err) => {
          console.error('ERROR in MONGO SESSION STORE', err);
        });
        sessionOptions.store = store;
      } else if (mongoUrl) {
        // Fallback to using the mongoUrl if clientPromise isn't available
        const store = MongoStore.create({
          mongoUrl: mongoUrl,
          touchAfter: 24 * 3600,
        });
        store.on('error', (err) => {
          console.error('ERROR in MONGO SESSION STORE', err);
        });
        sessionOptions.store = store;
      } else {
        console.warn('⚠ No mongo client available for session store — using memory store (not for production)');
      }
    } catch (storeErr) {
      console.error('Failed to create Mongo session store:', storeErr);
    }
  } else {
    console.warn('⚠ Using default (memory) session store — not for production');
  }

  app.use(session(sessionOptions));
  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.CurrUser = req.user;
    next();
  });

  // Register routes after session/passport setup
  app.use('/listings', listingRouter);
  app.use('/listings/:id/reviews', reviewRouter);
  app.use('/', userRouter);

  // If using in-memory MongoDB, seed sample data so listings appear
  try {
    if (mongoServer) {
      const Listing = require('./model/listing');
      const count = await Listing.countDocuments();
      if (count === 0 && seedData && Array.isArray(seedData.data)) {
        await Listing.insertMany(seedData.data);
        console.log('✓ Seeded in-memory DB with sample listings');
      }
    }
  } catch (seedErr) {
    console.error('Failed to seed in-memory DB:', seedErr);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Server listening on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop\n');
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  if (mongoServer) {
    await mongoServer.stop();
    console.log('In-memory MongoDB stopped');
  }
  process.exit(0);
});

// Export app for serverless and direct execution
module.exports = { app, startApp };

// Only call startApp if this file is run directly (not imported for serverless)
if (require.main === module) {
  startApp();
}

// Error handler (must be after routes)
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{message});
});