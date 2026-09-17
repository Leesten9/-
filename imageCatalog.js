import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const brands = [
  ['01', ['HURMEVKOR', '华美科']],
  ['02', ['DR.WOSSEN', '沃森博士']],
  ['03', ['INSDCDOCTOR', '因斯博士']],
];
export async function scanImages(root) {
  const result = Object.fromEntries(brands.map(([id]) => [id, { 主图: [], 详情: [], 场景: [] }]));
  async function walk(parts = []) {
    let entries;
    try { entries = await readdir(path.join(root, ...parts), { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const next = [...parts, entry.name];
      if (entry.isDirectory()) { await walk(next); continue; }
      if (!entry.isFile() || !/\.(png|jpe?g|webp|avif|gif)$/i.test(entry.name)) continue;
      const brand = brands.find(([, aliases]) => parts.some(part => aliases.some(alias => part.toLowerCase() === alias.toLowerCase())));
      const category = parts.find(part => ['主图', '详情', '场景'].includes(part));
      if (!brand || !category) continue;
      try {
        const info = await stat(path.join(root, ...next));
        result[brand[0]][category].push({
          name: entry.name,
          src: `/images/${next.map(encodeURIComponent).join('/')}?v=${info.mtimeMs}-${info.size}`,
        });
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  await walk();
  for (const tabs of Object.values(result)) for (const images of Object.values(tabs)) {
    images.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
  }
  return result;
}

export function imageCatalog() {
  let root;
  const middleware = (req, res, next) => {
    if (req.url?.split('?')[0] !== '/brand-images.json') return next();
    scanImages(root).then(data => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(data));
    }).catch(() => { res.statusCode = 500; res.end('Image scan failed'); });
  };
  return {
    name: 'brand-image-catalog',
    configResolved(config) { root = path.join(config.publicDir, 'images'); },
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
    async generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'brand-images.json', source: JSON.stringify(await scanImages(root)) });
    },
  };
}
