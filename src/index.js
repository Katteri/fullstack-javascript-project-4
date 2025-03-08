import fsp from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

export function getFilename(url) {
  const sourceURL = new URL(url);
  const { protocol } = sourceURL;
  const clearURL = sourceURL.toString().replace(`${protocol}//`, '');
  const filename = clearURL.replace(/\W|_/g, '-');
  return filename;
}

export function downloadImgs(html, url, dirPath) {
  const relativDir = path.basename(dirPath);
  const $ = cheerio.load(html);

  const downloadPromise = $('img').map((_, element) => {
    const src = $(element).attr('src');
    if (src && src.match(/\.jpg|\.png$/gi)) {
      const link = new URL(src, url).href;
      const extension = path.extname(link);
      const imgName = getFilename(link.replace(extension, '')) + extension;
      const relativPath = path.join(relativDir, imgName);
      const absolutePath = path.join(dirPath, imgName);

      $(element).attr('src', path.join(relativPath));

      return axios.get(link, { responseType: 'arraybuffer' })
        .then((img) => fsp.writeFile(absolutePath, img.data));
    }
    return null;
  }).get().filter(Boolean);

  return Promise.all(downloadPromise)
    .then(() => $.html());
}

function downloadPage(url, dir = process.cwd()) {
  const filename = getFilename(url);
  const filePath = path.join(dir, filename.concat('.html'));
  const dirPath = path.join(dir, filename.concat('_files'));
  return fsp.access(dir)
    .catch(() => fsp.mkdir(dir, { recursive: true }))
    .then(() => axios.get(url)
      .then(({ data }) => {
        if (cheerio.load(data)('img').length === 0) {
          return fsp.writeFile(filePath, data, 'utf-8')
            .then(() => filePath);
        }
        const mkdirPromise = fsp.mkdir(dirPath, { recursive: true });
        const downloadPromise = downloadImgs(data, url, dirPath)
          .then((html) => {
            fsp.writeFile(filePath, html, 'utf-8');
          });
        return Promise.all([mkdirPromise, downloadPromise])
          .then(() => filePath);
      }));
}

export default downloadPage;
