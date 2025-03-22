/* eslint-disable no-param-reassign */
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Listr from 'listr';
import log from './utils/debugEl.js';

export default (siteData, mainUrl, mainPathFile) => {
  const $ = cheerio.load(siteData);
  const needs = {
    img: 'src',
    link: 'href',
    script: 'src',
  };
  const promisesObj = {
    img: [],
    link: [],
    script: [],
  };
  const regExpNonLetters = /[^\w]/g;
  const regExpForLastChar = /-(?!.)/g;
  const pathToFolder = mainUrl.href.split('//')[1]
    .replace(regExpNonLetters, '-')
    .replace(regExpForLastChar, '')
    .concat('_files');

  const makeStrSiteWithoutDirs = (attr) => {
    const { host } = mainUrl;
    if (attr.search(/\/(?<=^.)/g) === -1) {
      const assetUrl = new URL(attr);
      if (host !== assetUrl.host) return false;
      return attr;
    }
    return `${mainUrl.origin}${attr}`;
  };

  const removeSymbols = (str) => {
    const words = str.replace(/.{1,}\/\//g, '').split(regExpNonLetters);
    const ext = words.pop();
    return words.join('-').concat(`.${ext}`);
  };
  const removeSymbolsAndExt = (str) => {
    const words = str.replace(/.{1,}\/\//g, '').split(regExpNonLetters);
    return words.join('-');
  };

  const makePath = (url, ext) => path.join(
    mainPathFile,
    pathToFolder,
    ext ? removeSymbolsAndExt(url).concat(ext) : removeSymbols(url),
  );

  const makePathHTML = (url, ext) => path
    .join(pathToFolder, ext ? removeSymbolsAndExt(url).concat(ext) : removeSymbols(url));

  Object.keys(needs).forEach((nameAsset) => {
    const listItems = $(nameAsset);
    listItems.each((i, { attribs }) => {
      const map = {
        img: () => makeStrSiteWithoutDirs(attribs.src),
        link: () => makeStrSiteWithoutDirs(attribs.href),
        // if (attribs.href.search(/\/(?<=^.)/g) === -1) return false;,
        script: () => {
          if (!attribs.src) return false;
          return makeStrSiteWithoutDirs(attribs.src);
        },
      };
      const urlForAsset = map[nameAsset]();

      if (urlForAsset) {
        const makingFile = (dataAsset) => {
          let pathToAsset;
          if (nameAsset === 'link') {
            if (attribs.rel === 'canonical' || (attribs.rel === 'alternate' && attribs.type !== 'application/rss+xml')) {
              pathToAsset = makePath(urlForAsset, '.html');
            } else {
              pathToAsset = makePath(urlForAsset);
            }
          } else {
            pathToAsset = makePath(urlForAsset);
          }
          return writeFile(pathToAsset, dataAsset);
        };

        const logTool = log.extend(nameAsset);
        const downloadProcess = axios.get(urlForAsset, { responseType: 'arraybuffer' })
          .then((response) => {
            logTool(`GET ${nameAsset}:`, urlForAsset);
            return makingFile(response.data);
          })
          .catch((e) => {
            logTool(`Error GET ${nameAsset}:`, e.message);
            // eslint-disable-next-line no-console
            return console.error(`${e.name}: ${e.message} in asset '${nameAsset}': ${urlForAsset}`);
          });

        promisesObj[nameAsset].push(downloadProcess);
        if (nameAsset === 'link') {
          if (attribs.rel === 'canonical') attribs.href = makePathHTML(urlForAsset, '.html');
          else attribs.href = makePathHTML(urlForAsset);
        } else {
          attribs.src = makePathHTML(urlForAsset);
        }
      }
    });
  });

  const pathToFolderAssets = path.join(
    mainPathFile,
    pathToFolder,
  );
  const tasks = Object.keys(promisesObj).map((key) => {
    const title = key;
    const task = () => Promise.all(promisesObj[key]);
    return {
      title,
      task,
    };
  });

  const ListrTasks = new Listr(tasks, { concurrent: true });

  return mkdir(pathToFolderAssets, { recursive: true })
    .then(() => ListrTasks.run())
    .then(() => $.html());
};
