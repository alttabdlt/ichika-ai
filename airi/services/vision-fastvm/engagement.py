import time
from typing import Dict, Any, Optional, List
from collections import deque
from datetime import datetime, timedelta
import random

from config import settings

class EngagementEngine:
    def __init__(self):
        self.last_comment_time = 0
        self.comments_this_hour = deque(maxlen=settings.max_comments_per_hour)
        self.activity_buffer = deque(maxlen=10)  # Last 10 activities
        self.last_user_state = "casual"
        self.focus_start_time = None
        self.struggle_start_time = None
        
    def should_engage(self, analysis: Dict[str, Any], user_state: str) -> bool:
        """Determine if should make a comment"""
        current_time = time.time()
        
        # Check basic constraints
        if not self._check_time_constraints(current_time):
            return False
        
        # Check user state
        if user_state == "focused" and not self._should_interrupt_focus(analysis):
            return False
        
        # Always comment on achievements
        if analysis.get('user_state') == 'celebrating':
            return True
        
        # Check struggle duration
        if user_state == "struggling" and self._should_help_with_struggle():
            return True
        
        # Check relevance threshold
        if analysis.get('relevance_score', 0) >= settings.relevance_threshold:
            return True
        
        # Activity-specific engagement
        if self._should_engage_with_activity(analysis):
            return True
        
        return False
    
    def _check_time_constraints(self, current_time: float) -> bool:
        """Check if enough time has passed and rate limits"""
        # Minimum time between comments
        if current_time - self.last_comment_time < settings.min_time_between_comments:
            return False
        
        # Rate limiting per hour
        hour_ago = current_time - 3600
        recent_comments = [t for t in self.comments_this_hour if t > hour_ago]
        
        if len(recent_comments) >= settings.max_comments_per_hour:
            return False
        
        return True
    
    def _should_interrupt_focus(self, analysis: Dict[str, Any]) -> bool:
        """Determine if should interrupt focus mode"""
        # Only interrupt for critical things
        critical_states = ['error', 'crash', 'failure']
        
        description = analysis.get('description', '').lower()
        for state in critical_states:
            if state in description:
                return True
        
        # Check if focus has been too long (offer break)
        if self.focus_start_time:
            focus_duration = time.time() - self.focus_start_time
            if focus_duration > 7200:  # 2 hours
                return random.random() < 0.1  # 10% chance to suggest break
        
        return False
    
    def _should_help_with_struggle(self) -> bool:
        """Check if user has been struggling long enough to offer help"""
        if not self.struggle_start_time:
            return False
        
        struggle_duration = time.time() - self.struggle_start_time
        return struggle_duration > settings.struggl

_offer_help_after
    
    def _should_engage_with_activity(self, analysis: Dict[str, Any]) -> bool:
        """Activity-specific engagement logic"""
        activity = analysis.get('activity', '')
        
        # Gaming - comment on notable moments
        if activity == 'gaming':
            elements = analysis.get('notable_elements', [])
            if any(elem in elements for elem in ['victory', 'defeat', 'achievement']):
                return True
        
        # Coding - offer help or encouragement
        elif activity == 'coding':
            elements = analysis.get('notable_elements', [])
            if 'error' in elements and random.random() < 0.3:  # 30% chance on errors
                return True
            if 'success' in elements:
                return True
        
        # Browsing - occasional comments on interesting content
        elif activity == 'browsing':
            if random.random() < 0.05:  # 5% chance
                return True
        
        return False
    
    def generate_comment(self, analysis: Dict[str, Any], personality_mood: str = "cheerful") -> str:
        """Generate an appropriate comment based on analysis"""
        activity = analysis.get('activity', 'browsing')
        user_state = analysis.get('user_state', 'casual')
        description = analysis.get('description', '')
        
        # Activity-specific comments
        comments = self._get_activity_comments(activity, user_state, personality_mood)
        
        # Add context from description
        if 'error' in description.lower():
            comments.extend([
                "Oof, that error looks annoying",
                "Need help with that?",
                "Debugging time I see..."
            ])
        elif 'success' in description.lower() or 'working' in description.lower():
            comments.extend([
                "Nice! You got it working!",
                "Look at you go!",
                "That's what I'm talking about!"
            ])
        
        # Select comment based on mood
        comment = random.choice(comments) if comments else "Watching you work is interesting"
        
        # Add mood modifiers
        comment = self._apply_mood_modifiers(comment, personality_mood)
        
        return comment
    
    def _get_activity_comments(self, activity: str, user_state: str, mood: str) -> List[str]:
        """Get activity-specific comments"""
        comments_map = {
            'gaming': {
                'celebrating': [
                    "YESSS! That was amazing!",
                    "You crushed it!",
                    "GG! That was sick!"
                ],
                'struggling': [
                    "This part is tough...",
                    "You've got this!",
                    "Almost had it!"
                ],
                'casual': [
                    "This game looks fun",
                    "Nice moves!",
                    "You're getting better at this"
                ]
            },
            'coding': {
                'focused': [
                    "You're in the zone!",
                    "Look at you being all productive",
                    "That's some clean code"
                ],
                'struggling': [
                    "Debugging can be so frustrating",
                    "Want fresh eyes on that?",
                    "Maybe try a different approach?"
                ],
                'celebrating': [
                    "Finally! It works!",
                    "That's a clever solution",
                    "You figured it out!"
                ]
            },
            'browsing': {
                'casual': [
                    "That's interesting!",
                    "Oh what's this?",
                    "Found something cool?"
                ]
            }
        }
        
        activity_comments = comments_map.get(activity, {})
        state_comments = activity_comments.get(user_state, [])
        
        if not state_comments:
            # Fallback comments
            return [
                "What are you up to?",
                "Looks interesting",
                "I'm here watching with you"
            ]
        
        return state_comments
    
    def _apply_mood_modifiers(self, comment: str, mood: str) -> str:
        """Apply personality mood modifiers to comment"""
        mood_modifiers = {
            'cheerful': lambda c: c + " 😊",
            'playful': lambda c: c + " hehe",
            'thoughtful': lambda c: "Hmm... " + c,
            'excited': lambda c: c + "!!",
            'affectionate': lambda c: c + " 💕",
            'curious': lambda c: c + "... tell me more?",
            'calm': lambda c: c,
            'sleepy': lambda c: c + " *yawn*"
        }
        
        modifier = mood_modifiers.get(mood, lambda c: c)
        return modifier(comment)
    
    def record_engagement(self, timestamp: Optional[float] = None):
        """Record that an engagement happened"""
        engage_time = timestamp or time.time()
        self.last_comment_time = engage_time
        self.comments_this_hour.append(engage_time)
    
    def update_user_state(self, state: str):
        """Update tracked user state"""
        current_time = time.time()
        
        # Track state transitions
        if state != self.last_user_state:
            if state == "focused" and self.last_user_state != "focused":
                self.focus_start_time = current_time
            elif state != "focused":
                self.focus_start_time = None
            
            if state == "struggling" and self.last_user_state != "struggling":
                self.struggle_start_time = current_time
            elif state != "struggling":
                self.struggle_start_time = None
        
        self.last_user_state = state
    
    def add_activity(self, activity: Dict[str, Any]):
        """Add activity to buffer for pattern detection"""
        self.activity_buffer.append({
            'timestamp': time.time(),
            'activity': activity
        })
    
    def get_engagement_stats(self) -> Dict[str, Any]:
        """Get engagement statistics"""
        current_time = time.time()
        hour_ago = current_time - 3600
        recent_comments = [t for t in self.comments_this_hour if t > hour_ago]
        
        return {
            'last_comment': self.last_comment_time,
            'comments_this_hour': len(recent_comments),
            'current_user_state': self.last_user_state,
            'focus_duration': (current_time - self.focus_start_time) if self.focus_start_time else 0,
            'struggle_duration': (current_time - self.struggle_start_time) if self.struggle_start_time else 0
        }