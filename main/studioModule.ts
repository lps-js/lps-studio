import * as LPS from 'lps';
import * as path from 'path';
import { Promise } from 'es6-promise';

let studioProgramCached = null;

export function studioModule(engine, program) {
  program.defineEvent(LPS.literal('lpsClick(X, Y)'));
  program.defineEvent(LPS.literal('lpsClick(Item, X, Y)'));
  program.defineEvent(LPS.literal('lpsMouseDown(X, Y)'));
  program.defineEvent(LPS.literal('lpsMouseDown(Item, X, Y)'));
  program.defineEvent(LPS.literal('lpsMouseUp(X, Y)'));
  program.defineEvent(LPS.literal('lpsMouseUp(Item, X, Y)'));
  program.defineEvent(LPS.literal('lpsMouseMove(X, Y)'));
  program.defineEvent(LPS.literal('lpsMouseMove(Item, X, Y)'));
  program.defineEvent(LPS.literal('lpsDragRelease(Item, X, Y)'));

  if (studioProgramCached !== null) {
    program.augment(studioProgramCached);
    return Promise.resolve(engine);
  }
  return LPS.ProgramFactory.fromFile(`${__dirname}/studio.lps`)
    .then((studioProgram) => {
      studioProgramCached = studioProgram;
      program.augment(studioProgram);
      return Promise.resolve(engine);
    });
}
