// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      gameStart: `${API_BASE_URL}/api/game/start`,
      gameEnd: `${API_BASE_URL}/api/game/end`,
      gameEvent: `${API_BASE_URL}/api/game/event`,
      generateStoryCard: `${API_BASE_URL}/api/generate-story-card`,
      shareCard: `${API_BASE_URL}/api/share-card`,
      downloadClientImage: `${API_BASE_URL}/api/download-client-image`,
      globalStats: `${API_BASE_URL}/api/stats/global`,
      ping: `${API_BASE_URL}/api/ping`
    }
  }
};

export default config;