const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const videosDir = path.join('public', 'videos');
const trimmedDir = path.join('public', 'videos', 'trimmed');

if (!fs.existsSync(trimmedDir)) {
  fs.mkdirSync(trimmedDir, { recursive: true });
}

try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
  console.log('FFmpeg is installed. Proceeding with video trimming...');
} catch (error) {
  console.error('Error: FFmpeg is not installed. Please install FFmpeg first.');
  console.log('You can install it via:');
  console.log('  - macOS: brew install ffmpeg');
  console.log('  - Ubuntu/Debian: sudo apt-get install ffmpeg');
  console.log('  - Windows: Download from https://ffmpeg.org/download.html');
  process.exit(1);
}

const videosToTrim = [
  { 
    input: path.join(videosDir, 'clip1.mp4'), 
    output: path.join(trimmedDir, 'clip1.mp4'),
    start: '00:00:02',
    duration: '00:00:06' 
  },
  { 
    input: path.join(videosDir, 'clip2.mp4'), 
    output: path.join(trimmedDir, 'clip2.mp4'),
    start: '00:00:04',
    duration: '00:00:07' 
  },
  { 
    input: path.join(videosDir, 'clip3.mp4'), 
    output: path.join(trimmedDir, 'clip3.mp4'),
    start: '00:00:10',
    duration: '00:00:08' 
  },
  { 
    input: path.join(videosDir, 'clip4.mp4'), 
    output: path.join(trimmedDir, 'clip4.mp4'),
    start: '00:00:06',
    duration: '00:00:05' 
  },
  { 
    input: path.join(videosDir, 'fallback1.mp4'), 
    output: path.join(trimmedDir, 'fallback1.mp4'),
    start: '00:00:01',
    duration: '00:00:05' 
  },
  { 
    input: path.join(videosDir, 'fallback2.mp4'), 
    output: path.join(trimmedDir, 'fallback2.mp4'),
    start: '00:00:03',
    duration: '00:00:06' 
  },
  { 
    input: path.join(videosDir, 'fallback3.mp4'), 
    output: path.join(trimmedDir, 'fallback3.mp4'),
    start: '00:00:05',
    duration: '00:00:07' 
  },
  { 
    input: path.join(videosDir, 'fallback4.mp4'), 
    output: path.join(trimmedDir, 'fallback4.mp4'),
    start: '00:00:08',
    duration: '00:00:05' 
  }
];

function trimVideo(video) {
  const { input, output, start, duration } = video;
  
  console.log(`Trimming ${path.basename(input)}...`);
  
  try {
    execSync(
      `ffmpeg -i "${input}" -ss ${start} -t ${duration} -c:v copy -c:a copy "${output}"`,
      { stdio: 'inherit' }
    );
    console.log(`Trimmed ${path.basename(input)} successfully!`);
    return true;
  } catch (error) {
    console.error(`Error trimming ${path.basename(input)}:`, error.message);
    return false;
  }
}

let successCount = 0;
for (const video of videosToTrim) {
  if (trimVideo(video)) {
    successCount++;
  }
}

console.log(`\nTrimming complete: ${successCount}/${videosToTrim.length} videos trimmed successfully.`);

console.log('\nCopying trimmed videos to main videos directory...');
fs.readdirSync(trimmedDir).forEach(file => {
  if (file.endsWith('.mp4')) {
    fs.copyFileSync(
      path.join(trimmedDir, file),
      path.join(videosDir, file)
    );
    console.log(`Copied ${file} to main videos directory.`);
  }
});

console.log('\nTrimmed video files:');
fs.readdirSync(videosDir)
  .filter(file => file.endsWith('.mp4') && !file.includes('original'))
  .forEach(file => {
    const stats = fs.statSync(path.join(videosDir, file));
    console.log(`${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  });