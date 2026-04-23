"""
Throttle classes for the public Chatbot endpoint.

Layers:
  1. ChatbotBurstThrottle   — max 5 requests/minute per IP  (short burst)
  2. ChatbotSustainedThrottle — max 30 requests/hour per IP (sustained)
  3. ChatbotDailyThrottle   — max 100 requests/day per IP  (daily cap)

All three are applied simultaneously in ChatbotView.throttle_classes.
If any one is exceeded Django returns HTTP 429 Too Many Requests.

Override rates in settings.py:
  REST_FRAMEWORK = {
      'DEFAULT_THROTTLE_RATES': {
          'chatbot_burst':     '5/min',
          'chatbot_sustained': '30/hour',
          'chatbot_daily':     '100/day',
      }
  }
"""
from rest_framework.throttling import AnonRateThrottle


class ChatbotBurstThrottle(AnonRateThrottle):
    """5 requests per minute per IP — blocks rapid-fire spamming."""
    scope = 'chatbot_burst'


class ChatbotSustainedThrottle(AnonRateThrottle):
    """30 requests per hour per IP — prevents automated scraping."""
    scope = 'chatbot_sustained'


class ChatbotDailyThrottle(AnonRateThrottle):
    """100 requests per day per IP — absolute daily cap."""
    scope = 'chatbot_daily'
