import * as constant from './constant';

export type Command = (typeof constant.COMMANDS)[number];
export type CommandHistory = Array<CommandOrUnknownCommand>;
export type CommandOrUnknownCommand = Command | typeof constant.COMMAND.UNKNOWN;

export type Line = {
  data: string
  index: number
}

export type MessageAccumulator = {
  lines: Array<Line>
  remaining: string
}

export type LinesAccumulator = {
  emittedLinesCount: number,
  lines: Array<Line>
}
