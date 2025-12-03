// Vercel serverless handler
// This wraps the Express app for Vercel's serverless environment

// Set production environment before importing app
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const serverless = require('serverless-http');
const { app, startApp } = require('../app');

// Ensure app is started when this handler is invoked
let appStarted = false;
let appStartPromise = null;

const handler = async (req, res) => {
  // Start the app once if not already started
  if (!appStarted) {
    if (!appStartPromise) {
      appStartPromise = (async () => {
        try {
          await startApp();
          appStarted = true;
        } catch (err) {
          console.error('Failed to start app:', err);
          throw err;
        }
      })();
    }
    try {
      await appStartPromise;
    } catch (err) {
      return res.status(500).json({ error: 'Failed to initialize application', details: err.message });
    }
  }

  // Delegate to Express via serverless-http
  const serverlessHandler = serverless(app);
  return serverlessHandler(req, res);
};

module.exports = handler;
