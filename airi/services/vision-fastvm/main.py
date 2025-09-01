import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, Any, List
from PIL import Image
import json
import time
from datetime import datetime

from config import settings
from capture import ScreenCapture
from vision import FastVLMVision
from engagement import EngagementEngine

# Initialize FastAPI app
app = FastAPI(
    title="FastVLM Vision Service",
    description="Real-time screen companion with FastVLM-7B",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
screen_capture = ScreenCapture()
vision_model = FastVLMVision()
engagement_engine = EngagementEngine()

# WebSocket connections
active_connections: List[WebSocket] = []

# Service state
service_state = {
    "is_running": False,
    "model_loaded": False,
    "capture_active": False,
    "last_analysis": None,
    "personality_mood": "cheerful"
}

@app.on_event("startup")
async def startup_event():
    """Initialize the service on startup"""
    print("Starting FastVLM Vision Service...")
    
    # Load the vision model
    await vision_model.load_model()
    service_state["model_loaded"] = vision_model.is_loaded
    
    # Start the capture loop
    asyncio.create_task(capture_and_analyze_loop())
    
    service_state["is_running"] = True
    print("Service started successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    print("Shutting down FastVLM Vision Service...")
    screen_capture.stop_capture()
    service_state["is_running"] = False

async def capture_and_analyze_loop():
    """Main loop for capturing and analyzing screens"""
    while service_state["is_running"]:
        try:
            if not service_state["capture_active"]:
                await asyncio.sleep(1)
                continue
            
            # Capture screen
            screenshot = await screen_capture.capture_screen()
            
            if screenshot:
                # Detect user state
                user_state = screen_capture.detect_user_state()
                engagement_engine.update_user_state(user_state)
                
                # Analyze with FastVLM
                analysis = await vision_model.analyze_screenshot(screenshot)
                service_state["last_analysis"] = analysis
                
                # Add to activity buffer
                engagement_engine.add_activity(analysis)
                
                # Check if should engage
                if engagement_engine.should_engage(analysis, user_state):
                    # Generate comment
                    comment = engagement_engine.generate_comment(
                        analysis,
                        service_state.get("personality_mood", "cheerful")
                    )
                    
                    # Record engagement
                    engagement_engine.record_engagement()
                    
                    # Send to all connected clients
                    await broadcast_comment({
                        "type": "companion_comment",
                        "comment": comment,
                        "context": {
                            "activity": analysis.get("activity"),
                            "user_state": user_state,
                            "timestamp": time.time()
                        }
                    })
            
            # Wait for next capture
            await asyncio.sleep(settings.capture_interval)
            
        except Exception as e:
            print(f"Error in capture loop: {e}")
            await asyncio.sleep(settings.capture_interval)

async def broadcast_comment(message: Dict[str, Any]):
    """Broadcast a comment to all connected WebSocket clients"""
    if not active_connections:
        return
    
    message_json = json.dumps(message)
    disconnected = []
    
    for connection in active_connections:
        try:
            await connection.send_text(message_json)
        except:
            disconnected.append(connection)
    
    # Remove disconnected clients
    for conn in disconnected:
        if conn in active_connections:
            active_connections.remove(conn)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "FastVLM Vision Service",
        "status": "running" if service_state["is_running"] else "stopped",
        "model_loaded": service_state["model_loaded"],
        "capture_active": service_state["capture_active"]
    }

@app.get("/stats")
async def get_stats():
    """Get service statistics"""
    return {
        "service": service_state,
        "capture": screen_capture.get_stats(),
        "engagement": engagement_engine.get_engagement_stats(),
        "vision": {
            "model_loaded": vision_model.is_loaded,
            "context_summary": vision_model.get_context_summary()
        }
    }

@app.post("/capture/start")
async def start_capture():
    """Start screen capture"""
    service_state["capture_active"] = True
    return {"status": "capture started"}

@app.post("/capture/stop")
async def stop_capture():
    """Stop screen capture"""
    service_state["capture_active"] = False
    screen_capture.stop_capture()
    return {"status": "capture stopped"}

@app.post("/personality/mood")
async def set_personality_mood(mood: str):
    """Set the personality mood"""
    valid_moods = ["cheerful", "playful", "thoughtful", "curious", "calm", "affectionate"]
    
    if mood not in valid_moods:
        raise HTTPException(status_code=400, detail=f"Invalid mood. Must be one of: {valid_moods}")
    
    service_state["personality_mood"] = mood
    return {"status": "mood updated", "mood": mood}

@app.get("/privacy/settings")
async def get_privacy_settings():
    """Get privacy settings"""
    return {
        "blacklisted_apps": settings.blacklisted_apps,
        "privacy_zones": settings.privacy_zones,
        "capture_quality": settings.capture_quality
    }

@app.post("/privacy/blacklist")
async def update_blacklist(apps: List[str]):
    """Update blacklisted applications"""
    settings.blacklisted_apps = apps
    return {"status": "blacklist updated", "apps": apps}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "service_state": service_state
        })
        
        # Keep connection alive
        while True:
            # Receive messages from client
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message.get("type") == "get_state":
                    await websocket.send_json({
                        "type": "state",
                        "data": service_state
                    })
                elif message.get("type") == "manual_capture":
                    # Trigger manual capture
                    screenshot = await screen_capture.capture_screen()
                    if screenshot:
                        analysis = await vision_model.analyze_screenshot(screenshot)
                        await websocket.send_json({
                            "type": "analysis",
                            "data": analysis
                        })
                        
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON"
                })
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
                
    except WebSocketDisconnect:
        pass
    finally:
        # Clean up connection
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.get("/test/mock-comment")
async def test_mock_comment():
    """Test endpoint to trigger a mock comment"""
    comment = {
        "type": "companion_comment",
        "comment": "Testing! I can see what you're doing 👀",
        "context": {
            "activity": "testing",
            "user_state": "casual",
            "timestamp": time.time()
        }
    }
    
    await broadcast_comment(comment)
    return {"status": "comment sent", "comment": comment}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info"
    )