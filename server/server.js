require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Enhanced Middleware Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(bodyParser.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(bodyParser.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 10000
}));

// Database Connection with Advanced Configuration
const connectDB = async () => {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,  // Increased to 10 seconds
    socketTimeoutMS: 60000,
    maxPoolSize: 15,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
    heartbeatFrequencyMS: 10000,
    appName: 'portfolio-backend'
  };

  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', 
      connectionOptions
    );

    // Real-time connection monitoring
    mongoose.connection.on('connected', () => {
      console.log(`[${new Date().toISOString()}] MongoDB connected to ${conn.connection.host}/${conn.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[${new Date().toISOString()}] MongoDB connection error:`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[${new Date().toISOString()}] MongoDB disconnected`);
    });

    // Initial connection diagnostics
    console.log('MongoDB Connection State:', mongoose.STATES[mongoose.connection.readyState]);
    console.log('MongoDB Driver Version:', mongoose.version);
    
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    console.log('Connection Pool Size:', conn.connections.length);

    return conn;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] MongoDB initial connection failed:`, err.message);
    console.error('Connection URI used:', process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
    console.error('Full error:', err);
    
    // Implement retry logic or fail fast based on environment
    if (process.env.NODE_ENV === 'production') {
      setTimeout(connectDB, 5000); // Retry after 5 seconds in production
    } else {
      process.exit(1); // Exit immediately in development
    }
  }
};

// Route Imports
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const contactRoutes = require('./routes/contact');

// Mount Routes with Versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/contact', contactRoutes);

// Enhanced Health Check with More Metrics
app.get('/api/v1/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    database: {
      state: mongoose.STATES[mongoose.connection.readyState],
      stats: null,
      collections: null,
      poolSize: mongoose.connections.length
    },
    system: {
      cpuUsage: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  };

  try {
    if (mongoose.connection.readyState === 1) {
      healthCheck.database.stats = await mongoose.connection.db.command({ dbStats: 1, scale: 1024 });
      healthCheck.database.collections = await mongoose.connection.db.listCollections().toArray();
    }
    res.status(200).json(healthCheck);
  } catch (err) {
    healthCheck.status = 'degraded';
    healthCheck.error = err.message;
    res.status(503).json(healthCheck);
  }
});

// Advanced Database Test Endpoint
app.get('/api/v1/test-db', async (req, res) => {
  const testReport = {
    success: false,
    timestamp: new Date().toISOString(),
    connectionState: mongoose.STATES[mongoose.connection.readyState],
    operation: 'write-read-verify',
    results: {}
  };

  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const testCollection = mongoose.connection.db.collection('diagnostic_tests');
    const testDoc = {
      timestamp: new Date(),
      testType: 'connection_validation',
      metadata: {
        clientIP: req.ip,
        userAgent: req.get('User-Agent'),
        randomValue: Math.random()
      }
    };

    // Test write operation
    const writeStart = process.hrtime();
    const insertResult = await testCollection.insertOne(testDoc);
    const writeDuration = process.hrtime(writeStart);
    
    // Test read operation
    const readStart = process.hrtime();
    const docs = await testCollection.find({ _id: insertResult.insertedId }).toArray();
    const readDuration = process.hrtime(readStart);

    // Test aggregation
    const aggStart = process.hrtime();
    const count = await testCollection.countDocuments();
    const aggDuration = process.hrtime(aggStart);

    testReport.success = true;
    testReport.results = {
      writeOperation: {
        duration: `${writeDuration[0]}s ${writeDuration[1] / 1000000}ms`,
        insertedId: insertResult.insertedId
      },
      readOperation: {
        duration: `${readDuration[0]}s ${readDuration[1] / 1000000}ms`,
        documentsFound: docs.length
      },
      aggregationOperation: {
        duration: `${aggDuration[0]}s ${aggDuration[1] / 1000000}ms`,
        totalDocuments: count
      },
      collectionStats: await testCollection.stats()
    };

    res.json(testReport);
  } catch (err) {
    testReport.error = {
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    };
    res.status(500).json(testReport);
  }
});

// Enhanced Error Handling Middleware
app.use((err, req, res, next) => {
  const errorId = Math.random().toString(36).substring(2, 10);
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] [ErrorID:${errorId}]`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    headers: req.headers,
    error: err.stack || err.message,
    body: req.body
  });

  const statusCode = err.statusCode || 500;
  const response = {
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp,
    requestId: errorId,
    path: req.path,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
});

// Server Startup with Advanced Port Handling
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting server initialization...`);
    
    const conn = await connectDB();
    if (!conn) throw new Error('Database connection failed');

    const server = app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
      console.log('Available Endpoints:');
      console.log(`- Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`- DB Test: http://localhost:${PORT}/api/v1/test-db`);
      console.log(`- Auth: http://localhost:${PORT}/api/v1/auth`);
      console.log(`- Content: http://localhost:${PORT}/api/v1/content`);
      console.log(`- Contact: http://localhost:${PORT}/api/v1/contact`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Node Version: ${process.version}`);
      console.log(`Mongoose Version: ${mongoose.version}`);
    });

    // Enhanced error handling for server
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.warn(`Port ${PORT} is in use, trying alternative ports...`);
        findAvailablePort(PORT).then(port => {
          server.listen(port, () => {
            console.log(`Server running on alternative port ${port}`);
          });
        });
      } else {
        console.error('Critical server error:', e);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      console.log(`\n[${new Date().toISOString()}] ${signal} received. Shutting down gracefully...`);
      
      try {
        await new Promise(resolve => server.close(resolve));
        await mongoose.connection.close(false);
        console.log('Server and database connections closed.');
        process.exit(0);
      } catch (err) {
        console.error('Graceful shutdown failed:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });

  } catch (err) {
    console.error('Server initialization failed:', err);
    process.exit(1);
  }
};

// Helper function to find available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  const checkPort = (port) => new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(port));
      server.close();
    });
    server.on('error', () => resolve(null));
  });

  for (let port = startPort; port < startPort + 100; port++) {
    const availablePort = await checkPort(port);
    if (availablePort) return availablePort;
  }
  throw new Error('No available ports found');
};

// Start the server
startServer();