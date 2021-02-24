import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { LastDayInfo } from './models/lastDayInfo';
import { FileManagement } from './utils/fileManagement';
//import * as Colors from './models/colors';

// sample code for full overtime days
// leave.backgroundColor = Colors.PURPLE;
// leave.textFormat = { foregroundColor: Colors.WHITE }


const init = async (doc: GoogleSpreadsheet) => {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['teste'];

  const { row, overtime }: LastDayInfo = FileManagement.getData();
  const todayRow = await loadTodayRow(sheet, row);

  const incoming = sheet.getCellByA1(`B${todayRow}`);
  const lunchBreak = sheet.getCellByA1(`C${todayRow}`);
  const lunchReturn = sheet.getCellByA1(`D${todayRow}`);
  const leave = sheet.getCellByA1(`E${todayRow}`);
  const dayTasks = sheet.getCellByA1(`H${todayRow}`);

  incoming.value = '=TIME(08;30;0)';
  lunchBreak.value = '=TIME(12;30;0)';
  lunchReturn.value = '=TIME(13;30;0)';
  leave.value = '=TIME(18;20;0)';
  dayTasks.value = 'fiz nada nao cara na moral pqp ta foda';
  sheet.saveUpdatedCells();

  const updatedOvertime = calculateOvertime(sheet, todayRow, overtime);
  FileManagement.updateData(todayRow, updatedOvertime);

};

const calculateOvertime = (sheet: GoogleSpreadsheetWorksheet, todayRow: number, overtime: number) => {
  const dayOvertime = sheet.getCellByA1(`G${todayRow}`);
  const [hourOvertime, minutesOvertime] = dayOvertime.formattedValue.split(':').map((val: string) => Number(val));

  if (dayOvertime.backgroundColor.red === 1)
    return overtime - hourOvertime * 60 - minutesOvertime;

  return overtime + hourOvertime * 60 + minutesOvertime;
}

const loadTodayRow = async (sheet: GoogleSpreadsheetWorksheet, lastRow: number) => {
  let todayCell: number = lastRow + 1;

  while (true) {
    await sheet.loadCells(`A${todayCell}:J${todayCell}`);
    const a1 = sheet.getCellByA1(`G${todayCell}`);

    if (a1.formattedValue) return todayCell;

    todayCell++;
  }
};

(async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  init(doc);
})();
