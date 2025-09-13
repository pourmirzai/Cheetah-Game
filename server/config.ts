// Server configuration for different environments
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://game.sarvinwildlife.com',
      /\.vercel\.app$/,
      /\.railway\.app$/,
      /\.render\.com$/
    ]
  },
  database: {
    url: process.env.DATABASE_URL,
    // Add other database config as needed
  }
};

export default config;