import fs from 'fs';
import path from 'path';

const filePath = '../data.json';

export class FileManagement {
  static getData() {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', filePath)).toString(),
    );
  }

  static updateData(row: number, overtime: number) {
    fs.writeFileSync(
      path.join(__dirname, '..', filePath),
      JSON.stringify({ row, overtime }),
    );
  }
}
