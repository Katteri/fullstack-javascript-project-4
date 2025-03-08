import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import downloadPage, { getFilename, downloadImgs } from '../src/index.js';

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const normalizeHtml = (html) => cheerio.load(html).html();
const url = 'https://ru.hexlet.io/courses';
const filename = 'ru-hexlet-io-courses';
const imgName = 'ru-hexlet-io-assets-professions-nodejs.png';
const imgPath = path.join(getFixturePath('assets-professions-nodejs.png'));
const tmpPath = path.join(os.tmpdir(), 'page-loader-');

let sourceHTML;
let sourceHTMLwithoutImg;
let resultHTML;
let img;
let pageScope;
let imgScope;

nock.disableNetConnect();

beforeAll(async () => {
  sourceHTML = await fsp.readFile(path.join(getFixturePath('index.html')), 'utf-8');
  sourceHTMLwithoutImg = await fsp.readFile(path.join(getFixturePath('index-without-img.html')), 'utf-8');
  resultHTML = await fsp.readFile(path.join(getFixturePath('result.html')), 'utf-8');
  img = await fsp.readFile(imgPath);
});

beforeEach(async () => {
  await fsp.mkdtemp(tmpPath);
  nock.cleanAll();

  imgScope = nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, img);
});

test('getFilename', () => {
  expect(getFilename(url)).toEqual(filename);
});

test('downloadImgs', async () => {
  pageScope = nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, sourceHTML);
  let result;

  await fsp.mkdtemp(path.join(tmpPath, filename.concat('_files')));
  await downloadImgs(sourceHTML, url, path.join(tmpPath, filename.concat('_files')))
    .then((html) => {
      result = html;
    });

  expect(imgScope.isDone()).toBeTruthy();
  expect(normalizeHtml(result)).toEqual(normalizeHtml(resultHTML));

  const dirName = filename.concat('_files');
  const images = await fsp.readdir(path.join(tmpPath, dirName));

  expect(images).toContain(imgName);

  const resultImg = await fsp.readFile(path.join(tmpPath, dirName, imgName));
  expect(resultImg).toEqual(img);
});

test('downloadPage: html with images', async () => {
  pageScope = nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, sourceHTML);

  await downloadPage(url, tmpPath);

  const files = await fsp.readdir(tmpPath);
  const dirName = filename.concat('_files');
  const fullFileName = filename.concat('.html');

  expect(pageScope.isDone()).toBeTruthy();
  expect(imgScope.isDone()).toBeTruthy();
  expect(files).toContain(dirName);
  expect(files).toContain(fullFileName);

  const result = await fsp.readFile(path.join(tmpPath, fullFileName), 'utf-8');
  expect(normalizeHtml(result)).toEqual(normalizeHtml(resultHTML));
});

test('downloadPage: html without images', async () => {
  pageScope = nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, sourceHTMLwithoutImg);

  const files = await fsp.readdir(tmpPath);
  const fullFileName = filename.concat('.html');

  await downloadPage(url, tmpPath);
  expect(pageScope.isDone()).toBeTruthy();
  expect(imgScope.isDone()).toBeFalsy();
  expect(files).toContain(fullFileName);

  const result = await fsp.readFile(path.join(tmpPath, fullFileName), 'utf-8');
  expect(normalizeHtml(result)).toEqual(normalizeHtml(sourceHTMLwithoutImg));
});
