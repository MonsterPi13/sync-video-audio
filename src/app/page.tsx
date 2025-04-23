"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Video Audio Sync POC</h1>
      
      <div className="grid grid-cols-1 gap-8 w-full max-w-5xl">
        <Link 
          href="/sync-video-audio" 
          className="p-6 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">1. Synchronized Video and Audio</h2>
          <p>Play video and audio simultaneously with precise synchronization</p>
        </Link>
        
        <Link 
          href="/video-queue" 
          className="p-6 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">2. Video Queue Without Latency</h2>
          <p>Sync multiple videos and play them one by one without interruption</p>
        </Link>
      </div>
    </main>
  );
}
