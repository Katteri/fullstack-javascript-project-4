import nock from 'nock';

import path from 'path';
import {
  mkdtemp, readFile, readdir, rmdir,
} from 'fs/promises';
import { tmpdir } from 'os';
import pageLoader from '../src/page-loader.js';
import { getFixturePath } from '../utils/getWorkPaths.js';

nock.disableNetConnect();
/**
 * Этот флаг для выбора, сохранять ли тестовые файлы в папке tmp
 * true = сохранять;
 * false = не сохранять
 */
const saveTempFiles = false;

let pathToTempFolder;
let scope;
let pathToNewFile;

beforeEach(async () => {
  const responseAnswer = await readFile(getFixturePath('./preparing/siteData'), 'utf-8');
  // Можно ли сделать не так громоздко?
  scope = nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, responseAnswer)
    .get('/assets/professions/nodejs.png')
    .replyWithFile(200, getFixturePath('testAssets/image_nodejs.png'))
    .get('/assets/application.css')
    .replyWithFile(200, getFixturePath('testAssets/application.css'))
    .get('/courses')
    .replyWithFile(200, getFixturePath('testAssets/ru-hexlet-io-courses.html'))
    .get('/packs/js/runtime.js')
    .replyWithFile(200, getFixturePath('testAssets/ru-hexlet-io-packs-js-runtime.js'))
    .get('/assets/application2.css')
    .replyWithFile(200, getFixturePath('testAssets/application2.css'));

  pathToTempFolder = `${await mkdtemp(path.join(tmpdir(), 'test-files-page-loader-'))}`;
  pathToNewFile = path.join(pathToTempFolder, '/ru-hexlet-io-courses.html');
});

test('Return path test', async () => {
  const result = await pageLoader('https://ru.hexlet.io/courses', pathToTempFolder);
  // Программа должна вывести путь до сохранённого файла
  expect(result).toBe(pathToNewFile);
});

test('Correct result', async () => {
  await pageLoader('https://ru.hexlet.io/courses', pathToTempFolder);
  // Программа должна создать новый файл с скачанной страницей
  const fixtureResult = await readFile(getFixturePath('result'), 'utf-8');
  const newFileContent = await readFile(pathToNewFile, 'utf-8');
  expect(newFileContent).toStrictEqual(fixtureResult);
});

test('Downloading imgs', async () => {
  await pageLoader('https://ru.hexlet.io/courses', pathToTempFolder);
  const dataImg = (await readFile(path.join(pathToTempFolder, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png'), 'utf-8')).toString();
  const dataFixtureImg = (await readFile(getFixturePath('testAssets/image_nodejs.png'), 'utf-8')).toString();
  expect(dataImg).toStrictEqual(dataFixtureImg);
});

test('Downloading links', async () => {
  await pageLoader('https://ru.hexlet.io/courses', pathToTempFolder);
  const dataLink = (await readFile(path.join(pathToTempFolder, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css'))).toString();
  const dataFixtureLink = (await readFile(getFixturePath('testAssets/application.css'))).toString();
  expect(dataLink).toStrictEqual(dataFixtureLink);
});

test('Downloading Additional Assets', async () => {
  await pageLoader('https://ru.hexlet.io/courses', pathToTempFolder);
  const arrNeededFiles = ((await readFile(getFixturePath('listLinks&Scripts'), 'utf-8')).split('\n')).sort();
  const arrFilesInFolder = (await readdir(path.join(pathToTempFolder, 'ru-hexlet-io-courses_files'))).sort();
  expect(arrFilesInFolder).toEqual(arrNeededFiles);
});

afterEach(async () => {
  scope.done();
  if (!saveTempFiles) await rmdir(pathToTempFolder, { recursive: true });
});
