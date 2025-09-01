import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Model configuration
    model_name: str = "apple/FastVLM-7B"
    device: str = "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "mps" if os.uname().sysname == "Darwin" else "cpu"
    dtype: str = "float16"  # Use float16 for faster inference
    
    # Screen capture settings
    capture_interval: float = 1.0  # Capture every 1 second
    capture_quality: int = 85  # JPEG quality for captures
    max_resolution: tuple[int, int] = (1920, 1080)  # Max resolution to process
    
    # Engagement settings
    min_time_between_comments: int = 60  # Minimum 60 seconds between comments
    max_comments_per_hour: int = 20
    relevance_threshold: float = 0.7
    focus_detection_minutes: int = 10  # Minutes without activity = focus mode
    
    # Privacy settings
    privacy_zones: list[dict] = []  # Regions to exclude from capture
    blacklisted_apps: list[str] = [
        "1Password",
        "Bitwarden", 
        "KeePass",
        "Banking",
        "Terminal",  # Can be removed if user wants
        "Private",
        "Incognito"
    ]
    
    # API settings
    host: str = "127.0.0.1"
    port: int = 8100
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]
    
    # WebSocket settings
    ws_heartbeat_interval: int = 30  # Seconds
    ws_max_connections: int = 10
    
    # Performance settings
    max_context_buffer: int = 10  # Keep last 10 captures in memory
    batch_size: int = 1  # Process one image at a time for real-time
    num_workers: int = 2
    
    # Paths
    cache_dir: str = "./cache"
    screenshot_dir: str = "./screenshots"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()