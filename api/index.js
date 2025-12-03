// Vercel serverless handler
// This wraps the Express app for Vercel's serverless environment

const serverless = require('serverless-http');
const { app, startApp } = require('../app');

// Ensure app is started when this handler is invoked
let appStarted = false;

const handler = async (req, res) => {
  // Start the app once if not already started
  if (!appStarted) {
    try {
      await startApp();
      appStarted = true;
    } catch (err) {
      console.error('Failed to start app:', err);
      res.status(500).json({ error: 'Failed to initialize application' });
      return;
    }
  }

  // Delegate to Express via serverless-http
  const serverlessHandler = serverless(app);
  return serverlessHandler(req, res);
};

module.exports = handler;
