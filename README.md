# ✨ Sync Video Audio

A Next.js application that demonstrates seamless video and audio synchronization capabilities.

## 🎬 Features

- **Synchronized Video and Audio**: Play separate video and audio files in perfect sync
- **Video Queue Without Latency**: Play multiple videos in sequence with no loading gaps between clips
- **Sample Videos**: Includes scripts to download sample videos for testing

## 🚀 Getting Started

First, download the sample videos:

```bash
# Using shell script
./download-videos.sh

# OR using Node.js
node download-sample-videos.js
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🧩 Project Structure

- **Synchronized Video & Audio**: `/sync-video-audio` - Plays a video with separate audio track in sync
- **Video Queue**: `/video-queue` - Plays multiple videos in sequence without loading gaps
- **Sample Media**: Located in the `/public/videos` directory after running the download script

## 🔧 How It Works

### Synchronized Video & Audio
- The video element is muted to prevent its original audio from playing
- A separate hidden audio element plays the audio track
- JavaScript event listeners ensure perfect synchronization
- When the video plays or pauses, the audio follows automatically
- Audio volume can be controlled independently

### Video Queue
- All videos are preloaded in memory
- Canvas is used to display the current video frame
- Seamless transitions between videos without loading time
- Global playback controls for the entire queue

## 📚 Technologies

- [Next.js](https://nextjs.org) - React framework
- [React](https://react.dev) - UI library
- Modern HTML5 video and audio APIs
- Canvas API for video rendering
