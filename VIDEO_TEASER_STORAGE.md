# Series Teaser Video Storage & Firestore Path

Where the teaser video lives:
- **Storage:** The generated video file stays at the VEO download URI, consumed via the proxy endpoint `/api/veo3-video-proxy?uri=...`.
- **Firestore document:** `users/{userId}/storyBibles/{storyBibleId}`
- **Field path:** `marketing.visualAssets.seriesTeaser.videoUrl`
- **Shape saved:**
  ```json
  {
    "marketing": {
      "visualAssets": {
        "seriesTeaser": {
          "videoUrl": "/api/veo3-video-proxy?uri=https://generativelanguage.googleapis.com/v1beta/files/{fileId}:download?alt=media",
          "prompt": "...full teaser prompt...",
          "generatedAt": "2025-12-06T16:07:53.205Z",
          "duration": 8,
          "aspectRatio": "9:16",
          "source": "veo3",
          "creditsUsed": 1,
          "cost": {
            "amount": 0.8,
            "currency": "USD",
            "mode": "fast",
            "hasAudio": false
          },
          "metadata": {
            "charactersFeatured": ["..."],
            "marketingHooksUsed": ["..."],
            "genre": "..."
          }
        }
      }
    }
  }
  ```

Where it is written:
- File: `src/app/api/generate/series-teaser/route.ts`
- Logic: After generation, the API uses the **Admin SDK** (`getStoryBibleServer` / `saveStoryBibleServer`) to upsert `marketing.visualAssets.seriesTeaser` with the new `videoUrl` and metadata. This runs server-side, so Firestore security rules do not block it.

How to read it (client or server):
- Fetch the story bible document for the user and read `marketing.visualAssets.seriesTeaser.videoUrl`.
- The UI player already consumes this field in `src/components/story-bible/MarketingSection.tsx`.

Notes:
- The stored URL is the proxy form; it points to the real VEO download URL under the hood.
- Regeneration is currently allowed (debug). Each regenerate overwrites `marketing.visualAssets.seriesTeaser` with the newest video.
























