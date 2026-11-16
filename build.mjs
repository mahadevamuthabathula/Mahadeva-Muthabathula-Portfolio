import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('edit-grade.html', 'dist/edit-grade.html');
await cp('material-surface.html', 'dist/material-surface.html');
await cp('environment-study.html', 'dist/environment-study.html');
await cp('object-texture.html', 'dist/object-texture.html');
await cp('photography.html', 'dist/photography.html');
await cp('sitemap.xml', 'dist/sitemap.xml');
await cp('robots.txt', 'dist/robots.txt');
await cp('css', 'dist/css', { recursive: true });
await cp('js', 'dist/js', { recursive: true });
await cp('assets', 'dist/assets', { recursive: true });
await cp('manus-routes.json', 'dist/manus-routes.json');
console.log('Built static site into dist/');
