import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetCell,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import inquirer from 'inquirer';
import { LastDayInfo } from './models/interfaces/lastDayInfo';
import { WorkedDayInputs } from './models/interfaces/workedDayInputs';
import * as SheetCells from './models/sheetCells';
import * as FileManagement from './utils/fileManagement';
import * as TerminalSetup from './utils/terminal';

const init = async (doc: GoogleSpreadsheet) => {
  await doc.loadInfo();
  const today = new Date(Date.now());
  const sheet = doc.sheetsByTitle[today.getFullYear()];
  const { row, overtime }: LastDayInfo = FileManagement.getData();

  const startOption = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'start_option',
        message: `Selecione opção do dia - ${format(today, 'dd/MM', {
          locale: ptBR,
        })}`,
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
  const dayOff = startOption === 'folga';
  const todayRow = await loadTodayRow(sheet, row, fullOvertime);
  const cells = SheetCells.instantiateCells(sheet, todayRow);

  switch (startOption) {
    case 'lançar_horario':
      await inquirer.prompt(SheetCells.inputs).then((res) => {
        const inputs: WorkedDayInputs = { ...res };
        SheetCells.setWorkedDay(cells, inputs);
      });
      break;

    case 'folga':
      SheetCells.setDayOff(cells);
      break;

    case 'hora_extra':
      await inquirer.prompt(SheetCells.inputs).then((res) => {
        const inputs: WorkedDayInputs = { ...res };
        SheetCells.setWorkedDay(cells, inputs);
        SheetCells.setOvertimeDay(cells);
      });
      break;
  }
  await sheet.saveUpdatedCells();
  const dayOvertime = await SheetCells.dayOvertime(sheet, todayRow);

  const updatedOvertime = dayOff
    ? overtime
    : calculateOvertime(dayOvertime, overtime, fullOvertime);

  FileManagement.updateData(todayRow, updatedOvertime);
};

const calculateOvertime = (
  dayOvertime: GoogleSpreadsheetCell,
  overtime: number,
  fullOvertime: boolean,
) => {
  if (fullOvertime) return overtime;
  const [hourOvertime, minutesOvertime] = dayOvertime.formattedValue
    .split(':')
    .map((val: string) => Number(val));

  if (dayOvertime.backgroundColor.red === 1)
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

    sheet.resetLocalCache(false);
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
