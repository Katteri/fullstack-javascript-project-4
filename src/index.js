import fsp from 'fs/promises';
import path from 'path';
import axios from 'axios';

export function getFilename(url) {
  const sourceURL = new URL(url);
  const { protocol } = sourceURL;
  const clearURL = sourceURL.toString().replace(`${protocol}//`, '');
  const filename = clearURL.replace(/\W/g, '-');
  return filename.concat('.html');
}

function downloadPage(url, dir = process.cwd()) {
  const filePath = path.join(dir, getFilename(url));
  return fsp.access(dir)
    .catch(() => fsp.mkdir(dir, { recursive: true }))
    .then(() => axios.get(url).then(({ data }) => {
      console.log(filePath);
      fsp.writeFile(filePath, data, 'utf8');
    }));
}

export default downloadPage;
