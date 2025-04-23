"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function VideoQueue() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [allVideosLoaded, setAllVideosLoaded] = useState(false);
  const [videoElements, setVideoElements] = useState<HTMLVideoElement[]>([]);
  
  const globalTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  const localVideos = [
    "/videos/clip1.mp4",
    "/videos/clip2.mp4",
    "/videos/clip3.mp4",
    "/videos/clip4.mp4"
  ];

  const [videoQueue, setVideoQueue] = useState<string[]>(localVideos);

  useEffect(() => {
    setError(null);
    
    const loadAllVideos = async () => {
      setIsBuffering(true);
      const videoElems: HTMLVideoElement[] = [];
      
      try {
        for (const videoSrc of videoQueue) {
          const videoElement = document.createElement('video');
          videoElement.src = videoSrc;
          videoElement.preload = 'auto';
          
          await new Promise<void>((resolve, reject) => {
            videoElement.onloadeddata = () => resolve();
            videoElement.onerror = (e) => reject(new Error(`Failed to load video: ${videoSrc}`));
            
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout loading video: ${videoSrc}`));
            }, 10000);
            
            videoElement.onloadeddata = () => {
              clearTimeout(timeout);
              resolve();
            };
          });
          
          videoElems.push(videoElement);
        }
        
        const totalDuration = videoElems.reduce((total, video) => total + video.duration, 0);
        setVideoDuration(totalDuration);
        
        setVideoElements(videoElems);
        setAllVideosLoaded(true);
        setIsBuffering(false);
        
        console.log(`All ${videoElems.length} videos preloaded successfully`);
      } catch (err: any) {
        console.error('Error preloading videos:', err);
        setError(`Error preloading videos: ${err.message}`);
        setIsBuffering(false);
      }
    };
    
    loadAllVideos();
    
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      
      canvas.width = 640;
      canvas.height = 360;
    };
    
    setupCanvas();
    
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      videoElements.forEach(video => {
        video.pause();
        video.src = '';
        video.load();
      });
    };
  }, [videoQueue]);

  const videoEndTimesRef = useRef<number[]>([]);
  useEffect(() => {
    if (videoElements.length > 0) {
      videoEndTimesRef.current = videoElements.reduce((times, video, index) => {
        const previousEndTime = index > 0 ? times[index - 1] : 0;
        times.push(previousEndTime + video.duration);
        return times;
      }, [] as number[]);
    }
  }, [videoElements]);
  
  const drawCurrentFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas || videoElements.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let currentVideoIdx = 0;
    const currentTime = globalTimeRef.current;
    
    for (let i = 0; i < videoEndTimesRef.current.length; i++) {
      if (currentTime < videoEndTimesRef.current[i]) {
        currentVideoIdx = i;
        break;
      }
    }
    
    if (currentVideoIdx !== currentVideoIndex) {
      setCurrentVideoIndex(currentVideoIdx);
    }
    
    const startTime = currentVideoIdx > 0 ? videoEndTimesRef.current[currentVideoIdx - 1] : 0;
    const timeInVideo = currentTime - startTime;
    
    if (Math.abs(videoElements[currentVideoIdx].currentTime - timeInVideo) > 0.1) {
      videoElements[currentVideoIdx].currentTime = timeInVideo;
    }
    
    ctx.drawImage(videoElements[currentVideoIdx], 0, 0, canvas.width, canvas.height);
    
    setVideoCurrentTime(currentTime);
    setProgress((currentTime / videoDuration) * 100);
  };

  useEffect(() => {
    if (!allVideosLoaded || videoElements.length === 0) return;

    const render = () => {
      if (!isPlaying) return;
      
      let currentVideoIdx = 0;
      for (let i = 0; i < videoEndTimesRef.current.length; i++) {
        if (globalTimeRef.current < videoEndTimesRef.current[i]) {
          currentVideoIdx = i;
          break;
        }
      }
      
      if (globalTimeRef.current >= videoDuration) {
        globalTimeRef.current = 0;
        currentVideoIdx = 0;
      }
      
      if (currentVideoIdx !== currentVideoIndex) {
        setCurrentVideoIndex(currentVideoIdx);
        
        videoElements.forEach(v => v.pause());
        
        const startTime = currentVideoIdx > 0 ? videoEndTimesRef.current[currentVideoIdx - 1] : 0;
        const timeInVideo = globalTimeRef.current - startTime;
        
        videoElements[currentVideoIdx].currentTime = timeInVideo;
        videoElements[currentVideoIdx].play();
      }
      
      drawCurrentFrame();
      
      globalTimeRef.current += 1/60;
      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    
    if (isPlaying) {
      const currentVideoIdx = currentVideoIndex;
      const currentVideo = videoElements[currentVideoIdx];
      
      const startTime = currentVideoIdx > 0 ? videoEndTimesRef.current[currentVideoIdx - 1] : 0;
      const timeInVideo = globalTimeRef.current - startTime;
      
      currentVideo.currentTime = timeInVideo;
      currentVideo.play();
      
      animationFrameIdRef.current = requestAnimationFrame(render);
    } else {
      drawCurrentFrame();
      
      videoElements.forEach(v => v.pause());
      
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }
    
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isPlaying, allVideosLoaded, videoElements, videoDuration, currentVideoIndex]);

  const handlePlayPause = () => {
    if (!allVideosLoaded) return;
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allVideosLoaded || videoElements.length === 0) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentClicked = clickX / rect.width;
    
    const newTime = percentClicked * videoDuration;
    globalTimeRef.current = newTime;
    
    setVideoCurrentTime(newTime);
    setProgress(percentClicked * 100);
    
    drawCurrentFrame();
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-4">Seamless Video Queue</h1>
          <p className="mb-4">
            This demo combines multiple videos into one seamless experience without loading between clips
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Note: All videos are preloaded for smooth playback
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold mb-1">Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        <div className="mb-6 relative">
          {/* Hidden actual video element for preloading */}
          <video 
            ref={videoRef}
            className="hidden"
            playsInline
          />
          
          {/* Canvas for rendering the video frames */}
          <canvas 
            ref={canvasRef}
            className="w-full h-auto border rounded bg-black"
          />
          
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                <p>Loading videos...</p>
              </div>
            </div>
          )}
          
          {/* Custom video controls */}
          <div className="mt-2 bg-gray-200 p-2 rounded flex flex-col">
            {/* Progress bar */}
            <div 
              className="w-full bg-gray-300 h-2 rounded-full mb-2 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Control buttons and time */}
            <div className="flex justify-between items-center">
              <button 
                onClick={handlePlayPause}
                disabled={!allVideosLoaded}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              
              <div className="text-sm">
                {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Video Queue:</h3>
          <ul className="border rounded divide-y">
            {videoQueue.map((url, index) => (
              <li key={index} className={`p-3 flex justify-between ${index === currentVideoIndex ? 'bg-blue-100' : ''}`}>
                <span>Video {index + 1}</span>
                <span className="text-sm text-gray-500">{
                  index < currentVideoIndex ? "Played" :
                  index === currentVideoIndex ? "Current" : "Queued"
                }</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Preloads all videos at the beginning to avoid loading states</li>
            <li>Uses HTML Canvas to render video frames for seamless transitions</li>
            <li>Manages video playback timing to create one continuous stream</li>
            <li>Provides custom playback controls and progress tracking</li>
            <li>Shows which clip is currently playing in the queue</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 