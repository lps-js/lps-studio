import * as LPS from 'lps';
import * as path from 'path';
import { Promise } from 'es6-promise';

let studioProgramCached = null;

export function studioModule(engine, program) {
  program.defineEvent(LPS.literal('lpsClick(Item, X, Y)'));
  program.defineEvent(LPS.literal('lpsClick(X, Y)'));

  if (studioProgramCached !== null) {
    program.augment(studioProgramCached);
    return Promise.resolve(engine);
  }
  return LPS.ProgramFactory.fromFile(path.join(__dirname, 'studio.lps'))
    .then((studioProgram) => {
      studioProgramCached = studioProgram;
      program.augment(studioProgram);
      return Promise.resolve(engine);
    });
}
