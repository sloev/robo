const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// 1. Create a minimal HTTP server using only built-in modules
const STATIC_DIR = path.join(__dirname, '..', 'static');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/index.html') {
    reqPath = '/index.html';
  }

  // Map API endpoint requests to mock responses so the page displays connected state and active motors
  if (reqPath === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      motors: {
        A: { current: 1250, target: 1250, moving: false, speed_delay: 2 },
        B: { current: -840, target: -840, moving: false, speed_delay: 2 }
      },
      sensors: {
        vision: "none",
        sound: "none",
        button_a: "pressed",
        button_b: "released",
        potentiometer: 42
      }
    }));
    return;
  }

  const filePath = path.join(STATIC_DIR, reqPath);
  const ext = path.extname(filePath);

  let contentType = 'text/plain';
  if (ext === '.html') contentType = 'text/html';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = 8080;
server.listen(PORT, async () => {
  console.log(`Temp server running on port ${PORT}`);

  try {
    // 2. Launch Puppeteer browser
    console.log('Launching headless browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850 });
    
    console.log('Navigating to dashboard...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });
    
    // Wait for dynamic elements (e.g. status poll) to run
    console.log('Waiting for UI to stabilize...');
    await new Promise(r => setTimeout(r, 2000));

    // Ensure the screenshots directory exists
    const ssDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(ssDir)) {
      fs.mkdirSync(ssDir, { recursive: true });
    }

    // Capture View 1: Coding Mode (Active by default)
    console.log('Taking screenshot of Coding Mode...');
    await page.screenshot({
      path: path.join(ssDir, 'view-coding.jpg'),
      type: 'jpeg',
      quality: 90
    });

    // Capture View 2: Manual Drive
    console.log('Switching to Manual Drive Mode...');
    await page.click('.tab-btn[data-target="view-manual"]');
    await new Promise(r => setTimeout(r, 800)); // wait for active transition
    console.log('Taking screenshot of Manual Drive...');
    await page.screenshot({
      path: path.join(ssDir, 'view-manual.jpg'),
      type: 'jpeg',
      quality: 90
    });

    // Capture View 3: AI Explorer
    console.log('Switching to AI Explorer Mode...');
    await page.click('.tab-btn[data-target="view-ai"]');
    await new Promise(r => setTimeout(r, 800)); // wait for active transition
    console.log('Taking screenshot of AI Explorer...');
    await page.screenshot({
      path: path.join(ssDir, 'view-ai.jpg'),
      type: 'jpeg',
      quality: 90
    });

    // Capture View 4: Car Mapper
    console.log('Switching to Car Mapper Mode...');
    await page.click('.tab-btn[data-target="view-car"]');
    await new Promise(r => setTimeout(r, 800)); // wait for active transition
    console.log('Taking screenshot of Car Mapper...');
    await page.screenshot({
      path: path.join(ssDir, 'view-car.jpg'),
      type: 'jpeg',
      quality: 90
    });

    // For backwards compatibility/header, copy view-coding.jpg to dashboard.jpg
    fs.copyFileSync(path.join(ssDir, 'view-coding.jpg'), path.join(ssDir, 'dashboard.jpg'));
    console.log('All screenshots generated successfully!');

    await browser.close();
  } catch (error) {
    console.error('Error generating screenshots:', error);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      console.log('Temp server closed.');
      process.exit();
    });
  }
});
