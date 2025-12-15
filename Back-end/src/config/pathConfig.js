import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const ROOT_DIR = join(__dirname, '..', '..');
export const SRC_DIR = join(ROOT_DIR, 'src');
export const DATA_DIR = join(SRC_DIR, 'data');
export const TEMPLATE_DIR = join(SRC_DIR, 'templates');

export const DATA_PATHS = {
    mockData: DATA_DIR,
    templates: TEMPLATE_DIR,
    bank: join(DATA_DIR, 'bank.json'),
    lokasi: join(DATA_DIR, 'lokasi.json'),
    sebab: join(DATA_DIR, 'sebab.json'),
    mainData: join(DATA_DIR, 'data.json'),
};






