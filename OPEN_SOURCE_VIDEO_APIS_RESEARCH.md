# 🔍 OPEN SOURCE VIDEO EDITING APIs - RESEARCH

This document provides a comprehensive research of open-source APIs and libraries for video editing, organized by use case and integration approach.

---

## 📊 QUICK COMPARISON TABLE

| Solution | Type | Language | License | Best For | Integration Difficulty |
|----------|------|----------|---------|----------|------------------------|
| **FFmpeg** | CLI Tool | C | LGPL/GPL | Server-side processing | ⭐ Easy |
| **fluent-ffmpeg** | Node.js Wrapper | JavaScript | MIT | Node.js servers | ⭐⭐ Very Easy |
| **libopenshot** | Library | C++/Python | LGPL-3.0 | Desktop apps | ⭐⭐⭐ Moderate |
| **OpenShot Cloud API** | REST API | Any | LGPL-3.0 | Cloud services | ⭐⭐ Easy |
| **Omniclip** | Web App | TypeScript | MIT | Browser-based | ⭐⭐ Easy |
| **Remotion** | React Library | TypeScript | MIT | Programmatic videos | ⭐⭐⭐ Moderate |
| **MLT Framework** | Framework | C/Python | GPL/LGPL | Professional editing | ⭐⭐⭐⭐ Hard |
| **ffmpeg.wasm** | WebAssembly | JavaScript | LGPL | Browser processing | ⭐⭐ Easy |

---

## 🎯 RECOMMENDED SOLUTIONS BY USE CASE

### **1. Server-Side Video Processing (Node.js/Next.js)**

#### **Option A: FFmpeg + fluent-ffmpeg** ⭐⭐⭐⭐⭐ **BEST CHOICE**

**What it is:**
- FFmpeg: Industry-standard command-line video processing tool
- fluent-ffmpeg: Node.js wrapper that makes FFmpeg easy to use

**Pros:**
- ✅ Most powerful and flexible
- ✅ Supports all video formats and codecs
- ✅ Excellent documentation
- ✅ Large community
- ✅ Free and open source
- ✅ Can do everything: cutting, color grading, transitions, effects
- ✅ Works great with your Next.js backend

**Cons:**
- ❌ Requires FFmpeg installed on server
- ❌ Can be resource-intensive
- ❌ Learning curve for complex operations

**Installation:**
```bash
# Install FFmpeg on server (varies by OS)
# Ubuntu/Debian:
sudo apt-get install ffmpeg

# macOS:
brew install ffmpeg

# Then install Node.js wrapper:
npm install fluent-ffmpeg
npm install @types/fluent-ffmpeg --save-dev
```

**Example Usage:**
```typescript
// src/services/video-processor.ts
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath);

export async function trimVideo(
  inputPath: string,
  startTime: number,
  endTime: number,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

export async function applyColorGrade(
  inputPath: string,
  adjustments: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
  },
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);
    
    // Build filter string
    const filters: string[] = [];
    if (adjustments.brightness) {
      filters.push(`eq=brightness=${adjustments.brightness / 100}`);
    }
    if (adjustments.contrast) {
      filters.push(`eq=contrast=${adjustments.contrast / 100}`);
    }
    if (adjustments.saturation) {
      filters.push(`eq=saturation=${adjustments.saturation / 100}`);
    }
    
    command
      .videoFilters(filters.join(','))
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

export async function concatenateClips(
  clips: Array<{ path: string; start: number; end: number }>,
  outputPath: string
): Promise<string> {
  // Create concat file
  const concatFile = clips.map((clip, i) => 
    `file '${clip.path}'\ninpoint ${clip.start}\noutpoint ${clip.end}`
  ).join('\n');
  
  // Write concat file
  const concatFilePath = `/tmp/concat_${Date.now()}.txt`;
  await fs.writeFile(concatFilePath, concatFile);
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFilePath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .output(outputPath)
      .on('end', () => {
        fs.unlink(concatFilePath);
        resolve(outputPath);
      })
      .on('error', reject)
      .run();
  });
}
```

**API Endpoint Example:**
```typescript
// src/app/api/video/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { trimVideo, applyColorGrade } from '@/services/video-processor';

export async function POST(request: NextRequest) {
  const { operation, inputPath, outputPath, params } = await request.json();
  
  try {
    let result: string;
    
    switch (operation) {
      case 'trim':
        result = await trimVideo(inputPath, params.start, params.end, outputPath);
        break;
      case 'color-grade':
        result = await applyColorGrade(inputPath, params.adjustments, outputPath);
        break;
      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, outputPath: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**GitHub:** https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
**License:** MIT
**Verdict:** ⭐⭐⭐⭐⭐ **Highly Recommended** - Best for server-side processing

---

#### **Option B: OpenShot Cloud API** ⭐⭐⭐⭐

**What it is:**
- RESTful API for cloud-based video editing
- Built on libopenshot (C++ library)

**Pros:**
- ✅ REST API - easy to integrate
- ✅ Full video editing features
- ✅ Supports templates
- ✅ Scalable
- ✅ Can deploy on AWS/Azure/GCP

**Cons:**
- ❌ Requires setting up the API server
- ❌ Less flexible than direct FFmpeg
- ❌ More complex setup

**Documentation:** https://www.openshot.org/cloud-api/
**License:** LGPL-3.0
**Verdict:** ⭐⭐⭐⭐ Good if you want a ready-made API server

---

### **2. Browser-Based Video Processing**

#### **Option A: ffmpeg.wasm** ⭐⭐⭐⭐

**What it is:**
- FFmpeg compiled to WebAssembly
- Runs entirely in the browser

**Pros:**
- ✅ No server needed
- ✅ Works offline
- ✅ Privacy-friendly (processing in browser)
- ✅ Full FFmpeg capabilities

**Cons:**
- ❌ Large file size (~30MB+)
- ❌ Slower than native FFmpeg
- ❌ Memory intensive
- ❌ Can't handle very large videos
- ❌ Limited browser support

**Installation:**
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

**Example Usage:**
```typescript
// src/services/browser-video-processor.ts
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

export async function initFFmpeg() {
  await ffmpeg.load();
}

export async function trimVideoInBrowser(
  videoFile: File,
  startTime: number,
  endTime: number
): Promise<Blob> {
  // Write input file
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  
  // Run FFmpeg command
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-ss', startTime.toString(),
    '-t', (endTime - startTime).toString(),
    '-c', 'copy',
    'output.mp4'
  ]);
  
  // Read output
  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data], { type: 'video/mp4' });
}
```

**GitHub:** https://github.com/ffmpegwasm/ffmpeg.wasm
**License:** LGPL-3.0
**Verdict:** ⭐⭐⭐⭐ Good for small videos and privacy-focused apps

---

#### **Option B: Omniclip** ⭐⭐⭐⭐

**What it is:**
- Open-source web-based video editor
- Runs entirely in browser using WebCodecs API

**Pros:**
- ✅ Modern browser APIs (WebCodecs)
- ✅ High performance
- ✅ Full editing UI components
- ✅ Can be embedded
- ✅ TypeScript support

**Cons:**
- ❌ Requires modern browsers
- ❌ Less control than FFmpeg
- ❌ May need to adapt their components

**GitHub:** https://github.com/omni-media/omniclip
**License:** MIT
**Verdict:** ⭐⭐⭐⭐ Good if you want to use/adapt their UI components

---

### **3. Programmatic Video Generation**

#### **Remotion** ⭐⭐⭐⭐⭐

**What it is:**
- React-based library for programmatic video creation
- Write videos as React components

**Pros:**
- ✅ React/TypeScript native
- ✅ Component-based (fits your stack)
- ✅ Great for templated videos
- ✅ Excellent documentation
- ✅ Can render to video files

**Cons:**
- ❌ Not for editing existing videos
- ❌ Better for generating new content
- ❌ Requires rendering step

**Use Case:** Great if you want to generate videos from templates or create videos programmatically

**Installation:**
```bash
npm install remotion
```

**Example:**
```typescript
// src/components/video/MyVideo.tsx
import { Composition } from 'remotion';
import { MyScene } from './MyScene';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyScene}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

**GitHub:** https://github.com/remotion-dev/remotion
**License:** MIT
**Verdict:** ⭐⭐⭐⭐⭐ Excellent for programmatic video generation (not editing)

---

### **4. Professional Video Editing Frameworks**

#### **MLT Framework** ⭐⭐⭐

**What it is:**
- Multimedia framework used by Kdenlive, Shotcut
- C library with Python bindings

**Pros:**
- ✅ Very powerful
- ✅ Professional-grade
- ✅ Used by major editors

**Cons:**
- ❌ Complex to integrate
- ❌ Primarily C/Python
- ❌ Steep learning curve
- ❌ Overkill for most use cases

**Verdict:** ⭐⭐⭐ Only if you need professional NLE features

---

## 🎯 RECOMMENDED ARCHITECTURE FOR YOUR PROJECT

### **Hybrid Approach (Best of Both Worlds)**

```
┌─────────────────────────────────────┐
│  Client (Next.js Frontend)          │
│  - File organization UI              │
│  - Timeline editor (UI only)        │
│  - Color grading preview (CSS)      │
│  - Edit Decision List (EDL)         │
│  - AI analysis & suggestions        │
└──────────────┬──────────────────────┘
               │
               │ Sends EDL (JSON)
               │
               ▼
┌─────────────────────────────────────┐
│  Server (Next.js API Routes)         │
│  - fluent-ffmpeg wrapper             │
│  - Process videos based on EDL       │
│  - Export final videos              │
│  - Background job processing        │
└─────────────────────────────────────┘
```

### **Implementation Steps:**

1. **Phase 1: Client-Side (Now)**
   - Build file organization
   - Create timeline UI
   - Implement color preview
   - Store EDL in Firestore

2. **Phase 2: Server-Side (Later)**
   - Install FFmpeg on server
   - Add fluent-ffmpeg
   - Create API endpoints
   - Process videos from EDL

---

## 📦 INSTALLATION GUIDE

### **For Server-Side (Recommended)**

```bash
# 1. Install FFmpeg (varies by OS)
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install ffmpeg

# macOS:
brew install ffmpeg

# Windows (using Chocolatey):
choco install ffmpeg

# 2. Install Node.js wrapper
npm install fluent-ffmpeg
npm install @types/fluent-ffmpeg --save-dev

# 3. Optional: FFmpeg path helper
npm install @ffmpeg-installer/ffmpeg
```

### **For Browser-Side (Alternative)**

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

---

## 🔧 EXAMPLE: COMPLETE IMPLEMENTATION

### **1. Edit Decision List (EDL) Structure**

```typescript
// src/types/edit-decision-list.ts
export interface EditDecisionList {
  version: string;
  projectId: string;
  clips: Array<{
    id: string;
    sourceVideo: string;      // Firebase Storage URL
    inPoint: number;           // Start time in source (seconds)
    outPoint: number;          // End time in source (seconds)
    timelineStart: number;     // Position in timeline (seconds)
    track: number;
    colorGrade?: {
      brightness: number;
      contrast: number;
      saturation: number;
      hue: number;
      exposure: number;
    };
    speed?: number;
    transitions?: {
      type: 'cut' | 'dissolve' | 'fade' | 'wipe';
      duration: number;
    };
  }>;
  audio: Array<{
    clipId: string;
    volume: number;
    fadeIn?: number;
    fadeOut?: number;
  }>;
}
```

### **2. Server-Side Video Processor**

```typescript
// src/services/video-processor.ts
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { EditDecisionList } from '@/types/edit-decision-list';
import { storage } from '@/lib/firebase-admin';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath(ffmpegPath);

export class VideoProcessor {
  /**
   * Process video based on Edit Decision List
   */
  async processEDL(edl: EditDecisionList): Promise<string> {
    // Download source videos
    const processedClips: string[] = [];
    
    for (const clip of edl.clips) {
      // Download from Firebase Storage
      const sourcePath = await this.downloadVideo(clip.sourceVideo);
      
      // Process clip
      const processedPath = await this.processClip(clip, sourcePath);
      processedClips.push(processedPath);
    }
    
    // Concatenate clips
    const finalVideo = await this.concatenateClips(processedClips, edl);
    
    // Upload to Firebase Storage
    const finalUrl = await this.uploadVideo(finalVideo);
    
    return finalUrl;
  }
  
  private async processClip(clip: EditDecisionList['clips'][0], sourcePath: string): Promise<string> {
    const outputPath = `/tmp/clip_${clip.id}_${Date.now()}.mp4`;
    
    return new Promise((resolve, reject) => {
      let command = ffmpeg(sourcePath)
        .setStartTime(clip.inPoint)
        .setDuration(clip.outPoint - clip.inPoint);
      
      // Apply color grading
      if (clip.colorGrade) {
        const filters: string[] = [];
        if (clip.colorGrade.brightness !== undefined) {
          filters.push(`eq=brightness=${clip.colorGrade.brightness / 100}`);
        }
        if (clip.colorGrade.contrast !== undefined) {
          filters.push(`eq=contrast=${clip.colorGrade.contrast / 100}`);
        }
        if (clip.colorGrade.saturation !== undefined) {
          filters.push(`eq=saturation=${clip.colorGrade.saturation / 100}`);
        }
        if (filters.length > 0) {
          command.videoFilters(filters.join(','));
        }
      }
      
      // Apply speed change
      if (clip.speed && clip.speed !== 1) {
        command.videoFilters(`setpts=${1 / clip.speed}*PTS`);
        command.audioFilters(`atempo=${clip.speed}`);
      }
      
      command
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }
  
  private async concatenateClips(
    clipPaths: string[],
    edl: EditDecisionList
  ): Promise<string> {
    const outputPath = `/tmp/final_${Date.now()}.mp4`;
    
    // Create concat file
    const concatContent = clipPaths.map(path => `file '${path}'`).join('\n');
    const concatFile = `/tmp/concat_${Date.now()}.txt`;
    await fs.writeFile(concatFile, concatContent);
    
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy']) // Fast copy, no re-encoding
        .output(outputPath)
        .on('end', () => {
          // Cleanup
          fs.unlink(concatFile);
          clipPaths.forEach(path => fs.unlink(path));
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }
  
  private async downloadVideo(url: string): Promise<string> {
    // Download from Firebase Storage to temp file
    const tempPath = `/tmp/video_${Date.now()}.mp4`;
    // Implementation depends on your storage setup
    return tempPath;
  }
  
  private async uploadVideo(filePath: string): Promise<string> {
    // Upload to Firebase Storage
    // Return public URL
    return 'https://...';
  }
}
```

### **3. API Endpoint**

```typescript
// src/app/api/video/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VideoProcessor } from '@/services/video-processor';
import { EditDecisionList } from '@/types/edit-decision-list';

export async function POST(request: NextRequest) {
  try {
    const edl: EditDecisionList = await request.json();
    
    const processor = new VideoProcessor();
    const videoUrl = await processor.processEDL(edl);
    
    return NextResponse.json({ 
      success: true, 
      videoUrl 
    });
  } catch (error) {
    console.error('Video export error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### **4. Client-Side Usage**

```typescript
// src/components/postproduction/VideoExport.tsx
export function VideoExport({ edl }: { edl: EditDecisionList }) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/video/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edl)
      });
      
      const { videoUrl } = await response.json();
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : 'Export Video'}
    </button>
  );
}
```

---

## 📚 ADDITIONAL RESOURCES

### **FFmpeg Documentation**
- Official: https://ffmpeg.org/documentation.html
- fluent-ffmpeg: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg

### **Tutorials**
- FFmpeg Basics: https://ffmpeg.org/ffmpeg.html
- Video Filters: https://ffmpeg.org/ffmpeg-filters.html

### **Community**
- FFmpeg Discord
- Stack Overflow (tagged: ffmpeg, fluent-ffmpeg)

---

## ✅ RECOMMENDATION SUMMARY

**For your Next.js project, I recommend:**

1. **Primary:** `fluent-ffmpeg` for server-side processing
   - Most flexible and powerful
   - Great documentation
   - Perfect for your stack

2. **Alternative:** `ffmpeg.wasm` for browser processing
   - Only if you need client-side processing
   - Good for small videos
   - Privacy-friendly

3. **Future:** Consider `Remotion` for programmatic video generation
   - If you want to generate videos from templates
   - Great React integration

**Start with fluent-ffmpeg on the server** - it's the most practical solution for your use case!

