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
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
          try {
            await startApp();
            appStarted = true;
            console.log('✓ App started successfully');
            return;
          } catch (err) {
            retries++;
            console.error(`Attempt ${retries} failed:`, err.message);
            if (retries < maxRetries) {
              console.log(`Retrying in 2 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              throw err;
            }
          }
        }
      })();
    }
    try {
      await appStartPromise;
    } catch (err) {
      console.error('Failed to start app after retries:', err);
      return res.status(500).json({ 
        error: 'Failed to initialize application', 
        details: err.message 
      });
    }
  }

  // Delegate to Express via serverless-http
  const serverlessHandler = serverless(app);
  return serverlessHandler(req, res);
};

module.exports = handler;
