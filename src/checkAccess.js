import { access } from 'fs/promises';
import log from './utils/debugEl.js';

export default (path, assetsPath) => {
  const logTool = log.extend('checkAccess');
  return access(path)
  // Checks html file
  // and if exists throw error
    .then(() => {
      logTool('Check access: ', `${path}`);
      const userErr = { code: 'EEXISThtml' };
      throw userErr;
    })
    .catch((err) => {
      console.log('first');
      logTool('Error access HTML: ', `${path}, err.code: ${err.code}`);
      if (err.code === 'ENOENT') return;
      throw err;
    })
    .then(() => access(assetsPath)
    // Checks folder with assets
    // and if exists throw error
      .then(() => {
        logTool('Check access: ', `${path}`);
        const userErr = { code: 'EEXISTassets' };
        throw userErr;
      })
      .catch((err) => {
        console.log('second');
        if (err.code === 'ENOENT') return;
        throw err;
      }));
};
