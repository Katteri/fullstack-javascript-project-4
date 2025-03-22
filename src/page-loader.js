import axios from 'axios';
import { writeFile } from 'fs/promises';
import path from 'path';
import downloadAsset from './downloadAsset.js';
import checkAccess from './checkAccess.js';

const errors = {
  EACCES: 'Not enough permissions in this folder.',
  EEXISTassets: 'Folder with assets already exists.',
  EEXISThtml: 'HTML file already exists.',
};

const pageLoader = (strToSite, pathToSave = '') => {
  const pathToSaveFile = path.resolve(process.cwd(), pathToSave);
  let url;
  try {
    url = new URL(strToSite);
  } catch (err) {
    throw new Error('It is wrong URL string');
  }
  const stylizedURL = url.href
    .split('//')[1]
    .replace(/[^\w]/g, '-')
    .replace(/-(?!.)/g, '');
  const savePath = path.join(
    pathToSaveFile,
    stylizedURL
      .concat('.html'),
  );

  return checkAccess(savePath, path.join(
    pathToSaveFile,
    stylizedURL
      .concat('_files'),
  ))
    .catch((err) => { throw new Error(errors[err.code] ?? `${err.name}: ${err.message}`); })
    .then(() => axios.get(strToSite))
    .then(({ data }) => downloadAsset(data, url, pathToSaveFile))
    .then((htmlData) => writeFile(savePath, htmlData))
    .then(() => savePath)
    .catch((err) => { throw new Error(errors[err.code] ?? `${err.name}: ${err.message}`); });
};

export default pageLoader;
