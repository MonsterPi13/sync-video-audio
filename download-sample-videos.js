const fs = require('fs');
const https = require('https');
const path = require('path');

const videosDir = path.join('public', 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const videos = [
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/car-detection.mp4',
    filename: 'clip1.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/face-demographics-walking.mp4',
    filename: 'clip2.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/face-demographics-walking-and-pause.mp4',
    filename: 'clip3.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/head-pose-face-detection-female.mp4',
    filename: 'clip4.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bottle-detection.mp4',
    filename: 'fallback1.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/people-detection.mp4',
    filename: 'fallback2.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/head-pose-face-detection-male.mp4',
    filename: 'fallback3.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/face-demographics-walking-and-pause.mp4',
    filename: 'fallback4.mp4'
  }
];

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${filename}...`);
    const filePath = path.join(videosDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: HTTP status code ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); 
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(filePath, () => {}); 
      reject(err);
    });
  });
}

async function downloadAllVideos() {
  console.log('Starting downloads...');
  try {
    fs.readdirSync(videosDir)
      .filter(file => file.endsWith('.mp4'))
      .forEach(file => fs.unlinkSync(path.join(videosDir, file)));
    
    for (const video of videos) {
      await downloadFile(video.url, video.filename);
    }
    
    console.log('All videos downloaded successfully!');
    
    const files = fs.readdirSync(videosDir);
    console.log('File sizes:');
    files.forEach(file => {
      const stats = fs.statSync(path.join(videosDir, file));
      console.log(`${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    });
    
  } catch (error) {
    console.error('Error downloading videos:', error);
  }
}

downloadAllVideos();