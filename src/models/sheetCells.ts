import {
  GoogleSpreadsheetCell,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import * as Colors from './colors';
import { WorkedDayInputs } from './interfaces/workedDayInputs';

export interface WorkingCells {
  incoming: GoogleSpreadsheetCell;
  lunchBreak: GoogleSpreadsheetCell;
  lunchReturn: GoogleSpreadsheetCell;
  leave: GoogleSpreadsheetCell;
  calculatedWorkedTime: GoogleSpreadsheetCell;
  dayOvertime: GoogleSpreadsheetCell;
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
    dayOvertime: sheet.getCellByA1(`G${todayRow}`),
    dayTasks: sheet.getCellByA1(`H${todayRow}`),
  };
};

export const setDayOff = (workingCells: WorkingCells) => {
  for (const cell in workingCells) {
    workingCells[cell].value = '';
    workingCells[cell].backgroundColor = Colors.GREY;
  }
};

export const setWorkedDay = (
  workingCells: WorkingCells,
  workedDayInputs: WorkedDayInputs,
) => {
  workingCells.incoming.value = workedDayInputs.incoming;
  workingCells.lunchBreak.value = workedDayInputs.lunchBreak;
  workingCells.lunchReturn.value = workedDayInputs.lunchReturn;
  workingCells.leave.value = workedDayInputs.leave;
  workingCells.dayTasks.value = workedDayInputs.tasks;
};
