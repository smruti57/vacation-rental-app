# 🏨 Wanderlust - Listing & Review Platform

[![Node.js](https://img.shields.io/badge/Node.js->=18-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.16.1-green)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-ISC-blue)](#license)

A full-stack web application for listing vacation properties and sharing reviews, similar to Airbnb. Users can create accounts, post listings with images, write reviews, and explore properties worldwide.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **User Authentication**: Secure signup/login with Passport.js
- **Create Listings**: Post property listings with images and detailed descriptions
- **Image Uploads**: Cloudinary integration for seamless image hosting
- **Reviews & Ratings**: Leave reviews and ratings for listings
- **Map Integration**: View listings location on interactive maps
- **Search & Filter**: Find listings by category, price, and location
- **Responsive Design**: Mobile-friendly UI with Bootstrap
- **Admin Controls**: Manage listings and reviews
- **Flash Messages**: Real-time notifications for user actions
- **Session Management**: Secure user sessions with MongoDB store

---

## 🛠️ Tech Stack

### Frontend
- **HTML/EJS** - Templating engine
- **CSS/Bootstrap** - Responsive styling
- **JavaScript** - Client-side interactions

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Authentication & File Upload
- **Passport.js** - Authentication middleware
- **Cloudinary** - Cloud image storage
- **Multer** - File upload handler

### Additional Tools
- **Joi** - Schema validation
- **Dotenv** - Environment variable management
- **EJS-Mate** - Template inheritance
- **Method-Override** - HTTP method override

---

## 📁 Project Structure

```
majorProject/
├── api/                      # API routes
│   └── index.js
├── controllers/              # Request handlers
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
├── models/                   # Database schemas
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── routes/                   # Route definitions
│   ├── listings.js
│   ├── reviews.js
│   ├── user.js
│   └── admin.js
├── views/                    # EJS templates
│   ├── layouts/
│   ├── includes/
│   ├── listings/
│   └── users/
├── public/                   # Static files
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── utils/                    # Utility functions
│   ├── ExpressError.js
│   └── wrapAsync.js
├── init/                     # Database seeding
│   ├── data.js
│   └── index.js
├── middleware.js             # Custom middleware
├── schema.js                 # Joi validation schemas
├── app.js                    # Main application file
├── cloudConfig.js            # Cloudinary configuration
├── package.json
├── .env                      # Environment variables (not in repo)
├── Procfile                  # Heroku deployment config
├── vercel.json               # Vercel deployment config
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas)
- **Cloudinary Account** - [Sign up free](https://cloudinary.com)
- **TomTom API Key** - [Get free key](https://developer.tomtom.com)

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/wanderlust.git
cd wanderlust
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables File

Create a `.env` file in the root directory:

```bash
# Database
ATLAS_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wanderlust?retryWrites=true&w=majority

# Session
SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# TomTom Maps
TOMTOM_API_KEY=your_tomtom_api_key_here

# Environment
NODE_ENV=development
PORT=3000
```

### 4. Seed Sample Data (Optional)

```bash
npm run seed
```

This will populate your database with sample listings and data for testing.

### 5. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000`

---

## 🚀 Usage

### Creating a Listing

1. Sign up or log in to your account
2. Navigate to "New Listing"
3. Fill in the form with:
   - Title
   - Description
   - Category (e.g., Beach, Mountain, City)
   - Price
   - Location
   - Country
   - Upload listing image
4. Click "Add" - you'll be redirected to your new listing page

### Writing a Review

1. Visit any listing
2. Scroll to the "Reviews" section
3. Fill in your comment and rating (1-5 stars)
4. Click "Submit Review"

### Searching & Filtering

- Use the search bar to find listings by title
- Filter by category dropdown in the listings page
- Sort by price range

---

## 🔌 API Endpoints

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/listings` | Get all listings |
| POST | `/listings` | Create new listing |
| GET | `/listings/:id` | Get single listing |
| PUT | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Delete listing |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/listings/:id/reviews` | Create review |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete review |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login user |
| GET | `/logout` | Logout user |

---

## 📸 Screenshots

### Home Page
![Home Page Placeholder]
*Listings grid view with search and filter options*

### Listing Details
![Listing Details Placeholder]
*Full listing information with map and reviews section*

### Add New Listing
![Add Listing Placeholder]
*Form to create new listing with image upload*

### User Reviews
![Reviews Placeholder]
*User reviews and ratings for listings*

---

## 🌐 Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and sign up
3. Create a new Web Service
4. Connect your GitHub repository
5. Set environment variables:
   - `ATLAS_URL`
   - `SESSION_SECRET`
   - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`
   - `TOMTOM_API_KEY`
   - `NODE_ENV=production`
6. Deploy!

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set ATLAS_URL="your_mongodb_url"
heroku config:set SESSION_SECRET="your_secret"
heroku config:set CLOUD_NAME="your_cloudinary_name"
heroku config:set CLOUD_API_KEY="your_api_key"
heroku config:set CLOUD_API_SECRET="your_api_secret"
heroku config:set TOMTOM_API_KEY="your_tomtom_key"

# Push to Heroku
git push heroku main

# Open app
heroku open
```

### Deploy to Vercel (Serverless)

Note: Requires refactoring to use serverless functions. For simpler deployment, use Render or Heroku.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/wanderlust.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Guidelines
- Write clear commit messages
- Test your changes locally before pushing
- Follow the existing code style
- Update documentation as needed

---

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 📧 Support & Questions

- **Issues**: [GitHub Issues](https://github.com/yourusername/wanderlust/issues)
- **Email**: support@example.com
- **Documentation**: Check the [Wiki](https://github.com/yourusername/wanderlust/wiki)

---

## 🎯 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Wishlist functionality
- [ ] Advanced filtering and search
- [ ] User profile management
- [ ] Email notifications
- [ ] Real-time chat between users
- [ ] Message/Inbox system
- [ ] Admin dashboard analytics

---

## ✅ Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=3001 npm run dev
```

### MongoDB Connection Error
- Verify `ATLAS_URL` is correct in `.env`
- Check MongoDB Atlas network access is enabled
- Ensure credentials are URL-encoded

### Cloudinary Upload Fails
- Verify API credentials in `.env`
- Check file size limits
- Ensure cloud storage has available space

### Map Not Loading
- Verify `TOMTOM_API_KEY` is valid
- Check browser console for specific errors
- Ensure API key has map permissions enabled

---

<div align="center">

Made with ❤️ by [Your Name](https://github.com/yourusername)

[⬆ Back to Top](#-wanderlust---listing--review-platform)

</div>