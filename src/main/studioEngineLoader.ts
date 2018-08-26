import * as LPS from 'lps';
import * as path from 'path';
import * as fs from 'fs';

import { studioModule } from './studioModule';

const loadImageTerm = LPS.literal('lpsLoadImage(Id, Url)');
const defineObjectTerm = LPS.literal('lpsDefineObject(Id, Type, Properties)');

function processLoadImageDeclarations(engine, programPath, sender) {
  engine.query(loadImageTerm)
    .forEach((imageTuple) => {
      let theta = imageTuple.theta;
      if (!(theta.Id instanceof LPS.Functor || theta.Id instanceof LPS.Value)
          || !(theta.Url instanceof LPS.Functor || theta.Url instanceof LPS.Value)) {
        return;
      }
      let id = theta.Id.evaluate();
      let imageUrl = theta.Url.evaluate();
      if (!(imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
          && !path.isAbsolute(imageUrl)) {
        // build relative path to the program's location
        imageUrl = path.resolve(programPath, imageUrl);
      }
      if (fs.existsSync(imageUrl)) {
        imageUrl = 'file:///' + imageUrl;
      }
      sender.send('canvas:loadImage', { id: id, url: imageUrl });
    });
}

function processPropertiesList(list) {
  let processedProperties = {};
  list.flatten()
    .forEach((item) => {
      if (!(item instanceof LPS.Functor)) {
        return;
      }
      let itemArgs = item.getArguments()
        .map((a) => {
          return a.evaluate();
        });
      processedProperties[item.getName()] = itemArgs;
    });

  return processedProperties;
}

function processDefineObjectDeclarations(engine, sender) {
  engine.query(defineObjectTerm)
    .forEach((tuple) => {
      let theta = tuple.theta;
      let id = null;
      if (!(theta.Id instanceof LPS.Variable) && theta.Id !== undefined) {
        // has a value
        id = theta.Id.evaluate();
      }
      let type = theta.Type.evaluate();
      let properties = theta.Properties;
      let processedProperties = processPropertiesList(properties);

      let data = {
        id: id,
        type: type,
        properties: processedProperties
      };
      sender.send('canvas:defineObject', data);
    });
}

export default function studioEngineLoader(engine, programPath, sender) {
  processLoadImageDeclarations(engine, programPath, sender);
  processDefineObjectDeclarations(engine, sender);

  engine.define('lpsUpdateObject', (id, properties) => {
    let processedProperties = processPropertiesList(properties);
    let data = {
      id: id.evaluate(),
      properties: processedProperties
    };
    sender.send('canvas:updateObject', data);
    return [ { theta: {} } ];
  });

  engine.define('lpsAnimateObject', (id, duration, properties) => {
    let processedProperties = processPropertiesList(properties);
    let data = {
      id: id.evaluate(),
      duration: duration.evaluate(),
      properties: processedProperties
    };
    sender.send('canvasAnimateObject', data);
    return [ { theta: {} } ];
  });

  return engine.loadModule(studioModule);
};
