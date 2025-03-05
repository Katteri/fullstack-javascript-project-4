import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';
import downloadPage, { getFilename } from '../src/index.js';

const url = 'https://ru.hexlet.io/courses';
const expected = 'ru-hexlet-io-courses.html';
const tempPath = path.join(os.tmpdir(), 'page-loader-');
nock.disableNetConnect();

beforeEach(async () => {
  await fsp.mkdtemp(tempPath);
});

test('getFilename', () => {
  expect(getFilename(url)).toEqual(expected);
});

test('downloadPage', async () => {
  const scope = nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, 'html');

  await downloadPage(url, tempPath);
  expect(scope.isDone).toBeTruthy();
  const files = await fsp.readdir(tempPath);
  expect(files).toContain(expected);
});
