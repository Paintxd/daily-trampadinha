import { GoogleSpreadsheet } from 'google-spreadsheet';
import { FileManagement } from './utils/fileManagement';

interface LastDayData {
  row: number;
  overtime: number;
}

const init = async (doc: GoogleSpreadsheet) => {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['teste'];
  await sheet.loadCells('A60:J61');
  const a1 = sheet.getCellByA1('A61');
  const a2 = sheet.getCellByA1('A60');
  const a3 = sheet.getCellByA1('G61');
  console.log(sheet.cellStats.loaded);
  console.log(a1.formattedValue);
  console.log(a2.formattedValue);
  console.log(a3.formattedValue);
  console.log(a3.backgroundColor);
};

(async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  init(doc);
})();
