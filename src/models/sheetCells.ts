import {
  GoogleSpreadsheetCell,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import inquirer from 'inquirer';
import * as Colors from './colors';
import { WorkedDayInputs } from './interfaces/workedDayInputs';

const filter = (val: string) => {
  return val.replace(':', ';');
};

export const inputs: inquirer.Question[] = [
  {
    type: 'input',
    name: 'incoming',
    message: 'Horario entrada',
    filter,
  },
  {
    type: 'input',
    name: 'lunchBreak',
    message: 'Horario almoço',
    filter,
  },
  {
    type: 'input',
    name: 'lunchReturn',
    message: 'Horario retorno',
    filter,
  },
  {
    type: 'input',
    name: 'leave',
    message: 'Saida',
    filter,
  },
  {
    type: 'input',
    name: 'tasks',
    message: 'Tarefas do dia',
  },
];

export interface WorkingCells {
  incoming: GoogleSpreadsheetCell;
  lunchBreak: GoogleSpreadsheetCell;
  lunchReturn: GoogleSpreadsheetCell;
  leave: GoogleSpreadsheetCell;
  calculatedWorkedTime: GoogleSpreadsheetCell;
  dayTasks: GoogleSpreadsheetCell;
}

export const instantiateCells = (
  sheet: GoogleSpreadsheetWorksheet,
  todayRow: number,
): WorkingCells => {
  return {
    incoming: sheet.getCellByA1(`B${todayRow}`),
    lunchBreak: sheet.getCellByA1(`C${todayRow}`),
    lunchReturn: sheet.getCellByA1(`D${todayRow}`),
    leave: sheet.getCellByA1(`E${todayRow}`),
    calculatedWorkedTime: sheet.getCellByA1(`F${todayRow}`),
    dayTasks: sheet.getCellByA1(`H${todayRow}`),
  };
};

export const dayOvertime = async (
  sheet: GoogleSpreadsheetWorksheet,
  todayRow: number,
) => {
  sheet.resetLocalCache(true);
  await sheet.loadCells(`G${todayRow}`);
  return sheet.getCellByA1(`G${todayRow}`);
};

export const setDayOff = (workingCells: WorkingCells) => {
  for (const cell in workingCells) {
    workingCells[cell].value = '';
    workingCells[cell].backgroundColor = Colors.GREY;
  }
};

export const setOvertimeDay = (workingCells: WorkingCells) => {
  for (const cell in workingCells) {
    workingCells[cell].textFormat = { foregroundColor: Colors.WHITE };
    workingCells[cell].backgroundColor = Colors.PURPLE;
  }
};

export const setWorkedDay = (
  workingCells: WorkingCells,
  workedDayInputs: WorkedDayInputs,
) => {
  workingCells.incoming.value = `=TIME(${workedDayInputs.incoming};00)`;
  workingCells.lunchBreak.value = `=TIME(${workedDayInputs.lunchBreak};00)`;
  workingCells.lunchReturn.value = `=TIME(${workedDayInputs.lunchReturn};00)`;
  workingCells.leave.value = `=TIME(${workedDayInputs.leave};00)`;
  workingCells.dayTasks.value = workedDayInputs.tasks;
};
