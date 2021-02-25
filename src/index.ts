import {
  GoogleSpreadsheet,
  GoogleSpreadsheetCell,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import inquirer from 'inquirer';
import { LastDayInfo } from './models/interfaces/lastDayInfo';
import * as FileManagement from './utils/fileManagement';
import * as TerminalSetup from './utils/terminal';
import * as SheetCells from './models/sheetCells';
// import * as Colors from './models/colors';

// sample code for full overtime days
// leave.backgroundColor = Colors.PURPLE;
// leave.textFormat = { foregroundColor: Colors.WHITE }

const init = async (doc: GoogleSpreadsheet) => {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[new Date(Date.now()).getFullYear()];
  const { row, overtime }: LastDayInfo = FileManagement.getData();

  const startOption = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'start_option',
        message: 'Selecione opção do dia - ${}',
        choices: ['Lançar horario', 'Folga', 'Hora Extra'],
        filter: (val: string) => {
          return val.toLowerCase().replace(' ', '_');
        },
      },
    ])
    .then(async (res) => {
      return res.start_option;
    });
  const fullOvertime = startOption === 'hora_extra';
  const todayRow = await loadTodayRow(sheet, row, fullOvertime);
  const cells = SheetCells.instantiateCells(sheet, todayRow);
  sheet.saveUpdatedCells();

  const updatedOvertime = calculateOvertime(
    cells.dayOvertime,
    overtime,
    fullOvertime,
  );
  FileManagement.updateData(todayRow, updatedOvertime);
};

const calculateOvertime = (
  dayOvertime: GoogleSpreadsheetCell,
  overtime: number,
  fullOvertime: boolean,
) => {
  const [hourOvertime, minutesOvertime] = dayOvertime.formattedValue
    .split(':')
    .map((val: string) => Number(val));

  if (dayOvertime.backgroundColor.red === 1 && !fullOvertime)
    return overtime - hourOvertime * 60 - minutesOvertime;

  return overtime + hourOvertime * 60 + minutesOvertime;
};

const loadTodayRow = async (
  sheet: GoogleSpreadsheetWorksheet,
  lastRow: number,
  fullOvertime: boolean,
) => {
  let todayRow: number = lastRow + 1;

  while (true) {
    await sheet.loadCells(`A${todayRow}:J${todayRow}`);
    const workedTime = sheet.getCellByA1(`G${todayRow}`);
    const date = sheet.getCellByA1(`A${todayRow}`);

    if (workedTime.formattedValue || (date && fullOvertime)) return todayRow;

    todayRow++;
  }
};

(async () => {
  TerminalSetup.clearAndPrint();
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  init(doc);
})();
