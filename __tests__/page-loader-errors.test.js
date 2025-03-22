import nock from 'nock';
import {
  mkdtemp, rmdir,
} from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import {
  afterEach, beforeEach, expect, test,
} from '@jest/globals';
import pageLoader from '../src/page-loader.js';

nock.disableNetConnect();

let pathToTempFolder;

beforeEach(async () => {
  pathToTempFolder = `${await mkdtemp(path.join(tmpdir(), 'test-files-page-loader-'))}`;
});
// Тест на выброс ошибки "страница отсутствует"
test('Network error', async () => {
  expect.assertions(1);
  const scope = nock('https://ru.hexlet.io').get('/courses').reply(404, 'Page not found');
  await expect(() => pageLoader('https://ru.hexlet.io/courses', pathToTempFolder)).rejects.toThrow('AxiosError: Request failed with status code 404');
  scope.isDone();
});

test('Permissions ERROR in folder', async () => {
  const scope = nock('https://ru.hexlet.io').get('/courses').reply(200, 'Some page');
  await expect(() => pageLoader('https://ru.hexlet.io/courses', '/sys')).rejects.toThrow('Not enough permissions in this folder.');
  scope.isDone();
});

afterEach(async () => {
  await rmdir(pathToTempFolder, { recursive: true });
});
