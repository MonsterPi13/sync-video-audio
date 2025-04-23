"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SyncVideoAudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string>("music");

  const videoUrl = "/media/sample.mp4";
  const audioOptions = {
    music: {
      name: "Music Track 1",
      url: "/media/song.mp3"
    },
    music2: {
      name: "Music Track 2",
      url: "/media/song2.mp3"
    }
  };
  
  const audioUrl = audioOptions[selectedAudio as keyof typeof audioOptions].url;

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    
    if (!video || !audio) return;
    
    audio.src = audioUrl;
    audio.load();
    
    if (isPlaying) {
      const wasPlaying = !video.paused;
      if (wasPlaying) {
        audio.volume = volume;
        audio.addEventListener('canplaythrough', function onCanPlay() {
          audio.play();
          audio.removeEventListener('canplaythrough', onCanPlay);
        });
      }
    }
    
    const handleVideoPlay = () => {
      if (audio.paused) {
        audio.currentTime = 0;
        audio.volume = volume;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            setError(`Audio playback error: ${err.message}`);
          });
        }
      }
    };
    
    const handleVideoPause = () => {
      if (!audio.paused) {
        audio.pause();
      }
    };
    
    const handleVideoEnded = () => {
      audio.pause();
      setIsPlaying(false);
    };
    
    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('ended', handleVideoEnded);
    
    video.addEventListener('error', () => {
      setError(`Video error: ${video.error?.message || 'Could not load video'}`);
    });
    
    audio.addEventListener('error', () => {
      setError(`Audio error: ${audio.error?.message || 'Could not load audio'}`);
    });
    
    return () => {
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [volume, audioUrl, isPlaying]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setError(null);
    
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(err => {
          setError(`Video playback error: ${err.message}`);
        });
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleAudioChange = (audioKey: string) => {
    if (audioOptions[audioKey as keyof typeof audioOptions]) {
      setSelectedAudio(audioKey);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-4">Synchronized Video and Audio</h1>
          <p className="mb-4">
            This demo plays a video and separate audio file in sync
          </p>
        </div>
        
        <div className="mb-6">
          <video
            ref={videoRef}
            className="w-full h-auto border rounded"
            src={videoUrl}
            playsInline
            muted
            controls
          />
          
          <audio ref={audioRef} src={audioUrl} preload="auto"></audio>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold mb-1">Error:</h3>
            <p>{error}</p>
            <p className="text-sm mt-2">
              Note: Some browsers restrict audio/video playback without user interaction
              or on cross-origin resources. Try clicking the video controls directly.
            </p>
          </div>
        )}
        
        <div className="flex gap-4 items-center mb-6">
          <button 
            onClick={handlePlayPause}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          
          <div className="flex items-center gap-2">
            <span>Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-32"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Select Audio Track:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(audioOptions).map(([key, audio]) => (
              <button
                key={key}
                onClick={() => handleAudioChange(key)}
                className={`px-3 py-1 rounded border ${
                  selectedAudio === key
                    ? "bg-blue-100 border-blue-500"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {audio.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded border">
          <h3 className="text-lg font-medium mb-2">How This Works:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>The video element is <strong>muted</strong> to prevent its original audio from playing</li>
            <li>A separate hidden audio element plays the audio track</li>
            <li>JavaScript event listeners ensure playback synchronization</li>
            <li>When the video plays or pauses, the audio follows automatically</li>
            <li>Audio volume can be controlled independently from the video</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 