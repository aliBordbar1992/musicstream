import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Node.js to trust our certificates
process.env.NODE_EXTRA_CA_CERTS = path.join(__dirname, 'certs', 'ca.crt');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ 
  dev,
  hostname,
  port,
  // Enable turbopack for faster development
  experimental: {
    turbo: true
  }
});
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'client.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'client.crt')),
  ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca.crt')),
  // Allow self-signed certificates
  rejectUnauthorized: false
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
  });
}); 