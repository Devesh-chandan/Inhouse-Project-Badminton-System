const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.warn('Redis: Max reconnect attempts reached. Live-score caching will be skipped.');
        return false; // Stop retrying
      }
      return Math.min(retries * 500, 3000); // Exponential back-off up to 3s
    },
  },
});

redisClient.on('error',   (err) => console.error('Redis error:', err.message));
redisClient.on('connect', ()    => console.log('Redis connected'));
redisClient.on('reconnecting', () => console.log('Redis reconnecting…'));

// Connect asynchronously — don't block server startup
redisClient.connect().catch((err) => {
  console.warn('Redis initial connect failed:', err.message);
});

module.exports = redisClient;
