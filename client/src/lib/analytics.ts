// Type declarations for Google Analytics
declare global {
  function gtag(...args: any[]): void;
  interface Window {
    dataLayer: any[];
  }
}

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

  // Send to Google Analytics
  sendToGoogleAnalytics(eventType, eventData);

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

// Send event to Google Analytics
function sendToGoogleAnalytics(eventType: string, eventData: any) {
  // Check if gtag is available
  if (typeof gtag !== 'function') {
    console.warn('Google Analytics gtag not available');
    return;
  }

  try {
    // Push to dataLayer for custom data
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventType,
        sessionId: eventData.sessionId,
        ...eventData
      });
    }

    // Send GA4 event based on event type
    switch (eventType) {
      case 'game_start':
        gtag('event', 'game_start', {
          session_id: eventData.sessionId,
          device_type: eventData.deviceType
        });
        break;

      case 'game_end':
        gtag('event', 'game_end', {
          session_id: eventData.sessionId,
          cubs_survived: eventData.cubsSurvived,
          months_completed: eventData.monthsCompleted,
          final_score: eventData.finalScore,
          death_cause: eventData.deathCause,
          achievements: eventData.achievements?.join(',') || ''
        });
        break;

      case 'collision':
        gtag('event', 'collision', {
          session_id: eventData.sessionId,
          collision_type: eventData.type,
          obstacle_type: eventData.obstacleType,
          month: eventData.month,
          health_reduction: eventData.healthReduction || 0
        });
        break;

      case 'pickup':
        gtag('event', 'pickup', {
          session_id: eventData.sessionId,
          resource_type: eventData.resourceType,
          month: eventData.month
        });
        break;

      case 'lane_change':
        gtag('event', 'lane_change', {
          session_id: eventData.sessionId,
          new_lane: eventData.newLane,
          month: eventData.month
        });
        break;

      case 'month_reached':
        gtag('event', 'month_reached', {
          session_id: eventData.sessionId,
          month: eventData.month
        });
        break;

      case 'speed_burst':
        gtag('event', 'speed_burst', {
          session_id: eventData.sessionId,
          month: eventData.month
        });
        break;

      case 'educational_visit':
        gtag('event', 'educational_visit', {
          visit_id: eventData.visitId,
          device_type: eventData.deviceType,
          session_id: eventData.sessionId // Use placeholder sessionId
        });
        break;

      default:
        // Generic event for any other type
        gtag('event', eventType, {
          session_id: eventData.sessionId,
          ...eventData
        });
    }
  } catch (error) {
    console.error('Failed to send event to Google Analytics:', error);
  }
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

export function trackEducationalVisit(deviceType: string) {
  const visitId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  // For educational visits, we don't have a game session, so we use a placeholder
  trackEvent('educational_visit', { visitId, deviceType, sessionId: 'educational' });
}
