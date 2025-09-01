import torch
from transformers import AutoProcessor, AutoModelForVision2Seq
from PIL import Image
import asyncio
from typing import Optional, Dict, Any
from collections import deque
import time

from config import settings

class FastVLMVision:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = settings.device
        self.dtype = torch.float16 if settings.dtype == "float16" else torch.float32
        self.context_buffer = deque(maxlen=settings.max_context_buffer)
        self.is_loaded = False
        
    async def load_model(self):
        """Load the FastVLM model"""
        try:
            print(f"Loading FastVLM-7B on {self.device}...")
            
            # Load processor and model
            self.processor = AutoProcessor.from_pretrained(
                settings.model_name,
                trust_remote_code=True
            )
            
            self.model = AutoModelForVision2Seq.from_pretrained(
                settings.model_name,
                trust_remote_code=True,
                torch_dtype=self.dtype,
                device_map="auto" if self.device == "cuda" else None
            )
            
            if self.device != "cuda":
                self.model = self.model.to(self.device)
            
            # Set to evaluation mode
            self.model.eval()
            
            self.is_loaded = True
            print("FastVLM-7B loaded successfully!")
            
        except Exception as e:
            print(f"Error loading FastVLM model: {e}")
            print("Falling back to mock mode for development")
            self.is_loaded = False
    
    async def analyze_screenshot(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze a screenshot and return understanding"""
        start_time = time.time()
        
        try:
            if not self.is_loaded:
                # Mock response for development
                return self._mock_analysis(image)
            
            # Prepare the prompt for scene understanding
            prompt = """Describe what the user is doing on their screen. Include:
            - What application or website they're using
            - What specific activity they're engaged in
            - Any notable content or elements visible
            - The user's apparent state (focused, struggling, browsing, etc.)
            Be concise and natural, as if you're a companion watching alongside them."""
            
            # Process image and prompt
            inputs = self.processor(
                images=image,
                text=prompt,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=150,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9
                )
            
            # Decode response
            response = self.processor.decode(outputs[0], skip_special_tokens=True)
            
            # Extract the generated text (remove the prompt)
            if prompt in response:
                response = response.replace(prompt, "").strip()
            
            inference_time = time.time() - start_time
            
            # Parse the response into structured data
            analysis = self._parse_analysis(response)
            analysis['inference_time'] = inference_time
            
            # Add to context buffer
            self.context_buffer.append({
                'timestamp': time.time(),
                'analysis': analysis
            })
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing screenshot: {e}")
            return self._mock_analysis(image)
    
    def _parse_analysis(self, response: str) -> Dict[str, Any]:
        """Parse the model's response into structured data"""
        # Simple parsing - in production, use more sophisticated NLP
        analysis = {
            'description': response,
            'application': self._extract_application(response),
            'activity': self._extract_activity(response),
            'user_state': self._extract_user_state(response),
            'notable_elements': self._extract_elements(response),
            'relevance_score': self._calculate_relevance(response)
        }
        
        return analysis
    
    def _extract_application(self, text: str) -> Optional[str]:
        """Extract application name from response"""
        apps = ['VSCode', 'Chrome', 'Firefox', 'Terminal', 'Discord', 'Slack', 'YouTube', 'Reddit']
        text_lower = text.lower()
        
        for app in apps:
            if app.lower() in text_lower:
                return app
        
        if 'browser' in text_lower or 'web' in text_lower:
            return 'Browser'
        elif 'code' in text_lower or 'programming' in text_lower:
            return 'IDE'
        elif 'game' in text_lower or 'gaming' in text_lower:
            return 'Game'
            
        return 'Unknown'
    
    def _extract_activity(self, text: str) -> str:
        """Extract activity type from response"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['coding', 'programming', 'debugging', 'error']):
            return 'coding'
        elif any(word in text_lower for word in ['gaming', 'playing', 'game']):
            return 'gaming'
        elif any(word in text_lower for word in ['watching', 'video', 'youtube']):
            return 'watching'
        elif any(word in text_lower for word in ['reading', 'article', 'documentation']):
            return 'reading'
        elif any(word in text_lower for word in ['chatting', 'messaging', 'discord']):
            return 'chatting'
        else:
            return 'browsing'
    
    def _extract_user_state(self, text: str) -> str:
        """Extract user state from response"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['struggling', 'error', 'problem', 'stuck']):
            return 'struggling'
        elif any(word in text_lower for word in ['focused', 'working', 'productive']):
            return 'focused'
        elif any(word in text_lower for word in ['success', 'victory', 'win', 'achieved']):
            return 'celebrating'
        else:
            return 'casual'
    
    def _extract_elements(self, text: str) -> list:
        """Extract notable elements from response"""
        elements = []
        
        # Simple keyword extraction
        keywords = ['error', 'success', 'notification', 'message', 'button', 'form', 'video']
        text_lower = text.lower()
        
        for keyword in keywords:
            if keyword in text_lower:
                elements.append(keyword)
        
        return elements
    
    def _calculate_relevance(self, text: str) -> float:
        """Calculate relevance score for engagement decision"""
        # Higher relevance for certain keywords
        high_relevance = ['error', 'success', 'victory', 'achievement', 'stuck', 'help']
        medium_relevance = ['interesting', 'new', 'learning', 'watching']
        
        text_lower = text.lower()
        score = 0.5  # Base score
        
        for word in high_relevance:
            if word in text_lower:
                score += 0.3
        
        for word in medium_relevance:
            if word in text_lower:
                score += 0.1
        
        return min(1.0, score)
    
    def _mock_analysis(self, image: Image.Image) -> Dict[str, Any]:
        """Mock analysis for development without model"""
        import random
        
        activities = [
            {
                'description': 'User is coding in VSCode, working on a Python file',
                'application': 'VSCode',
                'activity': 'coding',
                'user_state': 'focused',
                'notable_elements': ['code', 'python'],
                'relevance_score': 0.6
            },
            {
                'description': 'User is browsing Reddit, looking at memes',
                'application': 'Browser',
                'activity': 'browsing',
                'user_state': 'casual',
                'notable_elements': ['reddit', 'memes'],
                'relevance_score': 0.4
            },
            {
                'description': 'User encountered an error in their code',
                'application': 'IDE',
                'activity': 'coding',
                'user_state': 'struggling',
                'notable_elements': ['error', 'debugging'],
                'relevance_score': 0.9
            }
        ]
        
        analysis = random.choice(activities)
        analysis['inference_time'] = random.uniform(0.3, 0.5)
        
        return analysis
    
    def get_context_summary(self) -> str:
        """Get a summary of recent context"""
        if not self.context_buffer:
            return "No recent activity"
        
        # Get last few activities
        recent = list(self.context_buffer)[-3:]
        activities = [item['analysis']['activity'] for item in recent]
        
        # Create summary
        if len(set(activities)) == 1:
            return f"User has been {activities[0]} for a while"
        else:
            return f"User switched from {activities[0]} to {activities[-1]}"
    
    def should_comment(self, analysis: Dict[str, Any]) -> bool:
        """Decide if should make a comment based on analysis"""
        # High relevance always triggers comment
        if analysis['relevance_score'] > settings.relevance_threshold:
            return True
        
        # Check user state
        if analysis['user_state'] in ['struggling', 'celebrating']:
            return True
        
        # Random chance for casual comments
        if analysis['user_state'] == 'casual':
            return random.random() < 0.1  # 10% chance
        
        return False