import * as LPS from 'lps';
import * as path from 'path';
import { Promise } from 'es6-promise';

let studioProgramCached = null;

export function studioModule(engine, program) {
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
