import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('sitemap.xml', 'dist/sitemap.xml');
await cp('robots.txt', 'dist/robots.txt');
await cp('styles.css', 'dist/styles.css');
await cp('some-time-later.otf', 'dist/some-time-later.otf');
await cp('script.js', 'dist/script.js');
await cp('favicon.svg', 'dist/favicon.svg');
await cp('instagram-logo.svg', 'dist/instagram-logo.svg');
await cp('project-icon.png', 'dist/project-icon.png');
await cp('hero-portrait.jpeg', 'dist/hero-portrait.jpeg');
await cp('team-card-a.jpeg', 'dist/team-card-a.jpeg');
await cp('team-card-b.jpeg', 'dist/team-card-b.jpeg');
await cp('team-card-c.jpeg', 'dist/team-card-c.jpeg');
await cp('manus-routes.json', 'dist/manus-routes.json');
console.log('Built static site into dist/');
