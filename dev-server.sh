#!/bin/bash

# Development Server Management Script for Reeled AI

case "$1" in
  "start")
    echo "🚀 Starting development server..."
    npm run dev &
    echo "✅ Development server started in background"
    ;;
  "stop")
    echo "🛑 Stopping all development processes..."
    pkill -f "npm run dev" 2>/dev/null && echo "   ✅ Killed npm processes"
    pkill -f "next dev" 2>/dev/null && echo "   ✅ Killed next dev processes"
    pkill -f "next-server" 2>/dev/null && echo "   ✅ Killed next-server processes"
    pkill -f "telemetry/detached-flush.js" 2>/dev/null && echo "   ✅ Killed telemetry processes"
    sleep 3
    echo "🔍 Checking for remaining processes..."
    if ps aux | grep -E "(npm.*dev|next)" | grep -v grep | grep -q .; then
      echo "   ⚠️  Some processes may still be running:"
      ps aux | grep -E "(npm.*dev|next)" | grep -v grep
    else
      echo "   ✅ All development processes stopped"
    fi
    ;;
  "restart")
    echo "🔄 Restarting development server..."
    $0 stop
    sleep 3
    $0 start
    ;;
  "status")
    echo "📊 Development server status:"
    if ps aux | grep -E "(npm.*dev|next)" | grep -v grep | grep -q .; then
      echo "   🟢 Development server is running:"
      ps aux | grep -E "(npm.*dev|next)" | grep -v grep | awk '{printf "   PID %s: %s\n", $2, substr($0, index($0, $11))}'
    else
      echo "   🔴 Development server is not running"
    fi
    ;;
  "test")
    echo "🧪 Testing API endpoint..."
    $0 status
    if ps aux | grep -E "(npm.*dev|next)" | grep -v grep | grep -q .; then
      echo "🌐 Testing connection to localhost:3000..."
      if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null; then
        echo "   ✅ Server is responding"
        echo "🧪 Testing story-bible API..."
        curl -X POST http://localhost:3000/api/generate/story-bible \
          -H "Content-Type: application/json" \
          -d '{"synopsis": "Quick test", "theme": "Justice"}' \
          --max-time 30 \
          | jq -r 'if .storyBible then "✅ API Test SUCCESS - Episodes: \(.storyBible.totalEpisodes), Engines: \(.storyBible.murphyPillarStats.enginesActivated | length)" else "❌ API Test FAILED" end' 2>/dev/null || echo "❌ API Test FAILED - Invalid response"
      else
        echo "   ❌ Server is not responding"
      fi
    else
      echo "   ❌ Server is not running"
    fi
    ;;
  *)
    echo "🎬 Reeled AI Development Server Manager"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|test}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the development server"
    echo "  stop    - Stop all development processes"  
    echo "  restart - Stop and start the server"
    echo "  status  - Show current server status"
    echo "  test    - Test server and API endpoints"
    echo ""
    ;;
esac