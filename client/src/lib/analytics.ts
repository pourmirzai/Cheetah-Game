export interface AnalyticsEvent {
  type: string;
  data: any;
  timestamp?: number;
}

export function trackEvent(eventType: string, eventData: any) {
  const event: AnalyticsEvent = {
    type: eventType,
    data: eventData,
    timestamp: Date.now()
  };

  // Send to backend
  fetch('/api/game/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: eventData.sessionId,
      eventType,
      eventData
    })
  }).catch(error => {
    console.error('Failed to track event:', error);
  });

  // Log locally for debugging
  console.log('Analytics event:', event);
}

export function trackGameStart(sessionId: string, deviceType: string) {
  trackEvent('game_start', { sessionId, deviceType });
}

export function trackGameEnd(sessionId: string, results: any) {
  trackEvent('game_end', { sessionId, ...results });
}

export function trackLaneChange(sessionId: string, newLane: number, month: number) {
  trackEvent('lane_change', { sessionId, newLane, month });
}

export function trackCollision(sessionId: string, obstacleType: string, month: number) {
  trackEvent('collision', { sessionId, obstacleType, month });
}

export function trackPickup(sessionId: string, resourceType: string, month: number) {
  trackEvent('pickup', { sessionId, resourceType, month });
}

export function trackSpeedBurst(sessionId: string, month: number) {
  trackEvent('speed_burst', { sessionId, month });
}
