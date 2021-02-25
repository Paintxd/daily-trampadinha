import fs from 'fs';
import path from 'path';

const filePath = '../data.json';

export const getData = () => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', filePath)).toString(),
  );
};

export const updateData = (row: number, overtime: number) => {
  fs.writeFileSync(
    path.join(__dirname, '..', filePath),
    JSON.stringify({ row, overtime }),
  );
};
