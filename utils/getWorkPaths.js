import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const filename = fileURLToPath(import.meta.url);
const myDirname = dirname(filename);

/**
 * Correct join paths for fixtures
 * @param  {...String} filenameFile Name fixture in files
 * @returns Path to fixture
*/
const getFixturePath = (...filenameFile) => path.join(path.resolve(), '__fixtures__', ...filenameFile);

const getPathWorkDir = () => myDirname;

export { getFixturePath, getPathWorkDir };
