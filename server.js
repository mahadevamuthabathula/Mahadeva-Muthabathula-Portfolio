import 'dotenv/config';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';
const maxRequestBytes = 10 * 1024;
const recipient = 'mahadevamuthabathula@gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && Number.isInteger(smtpPort) && smtpPort > 0 && smtpPort <= 65535);
const mailer = smtpReady
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;
  let tooLarge = false;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxRequestBytes) {
      tooLarge = true;
      continue;
    }
    chunks.push(chunk);
  }

  if (tooLarge) {
    const error = new Error('Request body is too large.');
    error.statusCode = 413;
    throw error;
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function handleEnquiry(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Method not allowed.' });
    return;
  }

  if (!request.headers['content-type']?.startsWith('application/json')) {
    sendJson(response, 415, { error: 'Expected a JSON request.' });
    return;
  }

  let data;
  try {
    data = JSON.parse(await readRequestBody(request));
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.statusCode ? error.message : 'Invalid request body.' });
    return;
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    sendJson(response, 400, { error: 'Invalid enquiry details.' });
    return;
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || name.length > 120 || /[\r\n]/.test(name) || !validEmail || email.length > 254 || !message || message.length > 5000) {
    sendJson(response, 400, { error: 'Please provide a valid name, email address, and message.' });
    return;
  }

  if (!mailer) {
    console.error('Cannot send enquiry: SMTP environment variables are not configured.');
    sendJson(response, 503, { error: 'Enquiry email is not configured yet. Please email mahadevamuthabathula@gmail.com directly.' });
    return;
  }

  try {
    await mailer.sendMail({
      from: process.env.SMTP_USER,
      to: recipient,
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
    sendJson(response, 200, { message: 'Your enquiry has been sent. Thank you!' });
  } catch (error) {
    console.error('Unable to deliver portfolio enquiry:', error.message);
    sendJson(response, 502, { error: 'Your enquiry could not be sent right now. Please try again or email mahadevamuthabathula@gmail.com directly.' });
  }
}

function safePath(urlPath) {
  let cleanPath;
  try {
    cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }
  const requested = cleanPath === '/' ? '/index.html' : cleanPath;
  const resolved = path.resolve(root, `.${requested}`);
  const relativePath = path.relative(root, resolved);
  return relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)
    ? null
    : resolved;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (requestUrl.pathname === '/api/enquiry') {
    await handleEnquiry(request, response);
    return;
  }

  const filePath = safePath(request.url || '/');
  if (!filePath) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  try {
    const file = await stat(filePath);
    if (!file.isFile()) throw new Error('Not a file');
    const content = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': mime[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' || extension === '.json' ? 'no-cache' : 'public, max-age=3600'
    });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Mahadeva portfolio listening on http://${host}:${port}`);
});
