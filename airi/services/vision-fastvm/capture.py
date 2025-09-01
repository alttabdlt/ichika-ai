import asyncio
import time
from typing import Optional, Tuple
from PIL import Image
import mss
import numpy as np
from io import BytesIO
import platform
import subprocess

from config import settings

class ScreenCapture:
    def __init__(self):
        self.sct = mss.mss()
        self.last_capture_time = 0
        self.capture_count = 0
        self.is_capturing = False
        self.last_activity_time = time.time()
        
    async def capture_screen(self) -> Optional[Image.Image]:
        """Capture the current screen"""
        try:
            # Check capture interval
            current_time = time.time()
            if current_time - self.last_capture_time < settings.capture_interval:
                return None
                
            # Get primary monitor
            monitor = self.sct.monitors[1]  # Primary monitor
            
            # Check for privacy zones
            if self._is_private_app_active():
                return None
                
            # Capture screen
            screenshot = self.sct.grab(monitor)
            
            # Convert to PIL Image
            img = Image.frombytes(
                'RGB',
                (screenshot.width, screenshot.height),
                screenshot.rgb
            )
            
            # Resize if needed
            img = self._resize_image(img)
            
            # Apply privacy filters
            img = self._apply_privacy_filters(img)
            
            self.last_capture_time = current_time
            self.capture_count += 1
            
            return img
            
        except Exception as e:
            print(f"Error capturing screen: {e}")
            return None
    
    def _resize_image(self, img: Image.Image) -> Image.Image:
        """Resize image if it exceeds max resolution"""
        max_width, max_height = settings.max_resolution
        
        if img.width > max_width or img.height > max_height:
            # Calculate aspect ratio
            aspect = img.width / img.height
            
            if img.width > img.height:
                new_width = max_width
                new_height = int(max_width / aspect)
            else:
                new_height = max_height
                new_width = int(max_height * aspect)
                
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
        return img
    
    def _apply_privacy_filters(self, img: Image.Image) -> Image.Image:
        """Apply privacy filters to sensitive regions"""
        # Convert to numpy array for processing
        img_array = np.array(img)
        
        # Apply privacy zones (blur regions)
        for zone in settings.privacy_zones:
            x1, y1, x2, y2 = zone.get('coords', [0, 0, 0, 0])
            if x2 > x1 and y2 > y1:
                # Simple blur by downsampling and upsampling
                region = img_array[y1:y2, x1:x2]
                small = Image.fromarray(region).resize(
                    (max(1, (x2-x1)//10), max(1, (y2-y1)//10)),
                    Image.Resampling.BILINEAR
                )
                blurred = small.resize((x2-x1, y2-y1), Image.Resampling.BILINEAR)
                img_array[y1:y2, x1:x2] = np.array(blurred)
        
        return Image.fromarray(img_array)
    
    def _is_private_app_active(self) -> bool:
        """Check if a blacklisted app is currently active"""
        try:
            active_window = self._get_active_window_title()
            if active_window:
                for app in settings.blacklisted_apps:
                    if app.lower() in active_window.lower():
                        return True
        except:
            pass
        return False
    
    def _get_active_window_title(self) -> Optional[str]:
        """Get the title of the currently active window"""
        system = platform.system()
        
        try:
            if system == "Darwin":  # macOS
                script = '''
                tell application "System Events"
                    set frontApp to name of first application process whose frontmost is true
                end tell
                '''
                result = subprocess.run(
                    ['osascript', '-e', script],
                    capture_output=True,
                    text=True,
                    timeout=1
                )
                return result.stdout.strip()
                
            elif system == "Windows":
                import win32gui
                window = win32gui.GetForegroundWindow()
                return win32gui.GetWindowText(window)
                
            elif system == "Linux":
                result = subprocess.run(
                    ['xdotool', 'getactivewindow', 'getwindowname'],
                    capture_output=True,
                    text=True,
                    timeout=1
                )
                return result.stdout.strip()
                
        except Exception as e:
            print(f"Could not get active window: {e}")
            
        return None
    
    def detect_user_state(self) -> str:
        """Detect user's current state based on activity"""
        current_time = time.time()
        time_since_activity = current_time - self.last_activity_time
        
        # Check for focus mode (no activity for X minutes)
        if time_since_activity > settings.focus_detection_minutes * 60:
            return "focused"
        
        # TODO: Add more sophisticated state detection
        # - Mouse movement patterns
        # - Window switching frequency
        # - Time of day
        # - Application type
        
        return "casual"
    
    def update_activity(self):
        """Update last activity time"""
        self.last_activity_time = time.time()
    
    async def start_capture_loop(self, callback):
        """Start continuous screen capture loop"""
        self.is_capturing = True
        
        while self.is_capturing:
            try:
                # Capture screen
                screenshot = await self.capture_screen()
                
                if screenshot:
                    # Detect user state
                    user_state = self.detect_user_state()
                    
                    # Send to callback for processing
                    await callback(screenshot, user_state)
                
                # Wait for next capture
                await asyncio.sleep(settings.capture_interval)
                
            except Exception as e:
                print(f"Error in capture loop: {e}")
                await asyncio.sleep(settings.capture_interval)
    
    def stop_capture(self):
        """Stop the capture loop"""
        self.is_capturing = False
    
    def get_stats(self) -> dict:
        """Get capture statistics"""
        return {
            "capture_count": self.capture_count,
            "last_capture": self.last_capture_time,
            "is_capturing": self.is_capturing,
            "user_state": self.detect_user_state()
        }