import * as LPS from 'lps';
import * as path from 'path';
import * as fs from 'fs';

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

  engine.define('enable_drag', (id) => {
    let data = {
      id: id.evaluate()
    };
    sender.send('enable-drag', data);
    return [ { theta: {} } ];
  });

  engine.define('show', (id) => {
    let data = {
      id: id.evaluate(),
      cycleInterval: engine.getCycleInterval()
    };
    sender.send('show-object', data);
    return [ { theta: {} } ];
  });

  engine.define('hide', (id) => {
    let data = {
      id: id.evaluate(),
      cycleInterval: engine.getCycleInterval()
    };
    sender.send('hide-object', data);
    return [ { theta: {} } ];
  });

  engine.define('flip_horizontal', (id) => {
    let data = {
      id: id.evaluate()
    };
    sender.send('flip-horizontal', data);
    return [ { theta: {} } ];
  });

  engine.define('clear_flip_horizontal', (id) => {
    let data = {
      id: id.evaluate()
    };
    sender.send('clear-flip-horizontal', data);
    return [ { theta: {} } ];
  });

  engine.define('set_flip_horizontal', (id) => {
    let data = {
      id: id.evaluate()
    };
    sender.send('set-flip-horizontal', data);
    return [ { theta: {} } ];
  });

  engine.define('flip_vertical', (id) => {
    let data = {
      id: id.evaluate()
    };
    sender.send('flip-vertical', data);
    return [ { theta: {} } ];
  });

  engine.define('clear_flip_vertical', (id) => {
    let data = {
      id: id.evaluate()
    };
    sender.send('clear-flip-vertical', data);
    return [ { theta: {} } ];
  });

  engine.define('set_flip_vertical', (id) => {
    let data = {
      id: id.evaluate()
    };
    sender.send('set-flip-vertical', data);
    return [ { theta: {} } ];
  });

  engine.define('move', (id, x, y) => {
    let data = {
      id: id.evaluate(),
      x: x.evaluate(),
      y: y.evaluate(),
      cycleInterval: engine.getCycleInterval()
    };
    sender.send('move', data);
    return [ { theta: {} } ];
  });

  engine.define('move', (id, x, y, n) => {
    let data = {
      id: id.evaluate(),
      x: x.evaluate(),
      y: y.evaluate(),
      numCycles: n.evaluate(),
      cycleInterval: engine.getCycleInterval()
    };
    sender.send('move', data);
    return [ { theta: {} } ];
  });

  engine.define('move_to', (id, x, y) => {
    let data = {
      id: id.evaluate(),
      x: x.evaluate(),
      y: y.evaluate()
    };
    sender.send('move-to', data);
    return [ { theta: {} } ];
  });

  engine.define('move_by', (id, x, y) => {
    let data = {
      id: id.evaluate(),
      x: x.evaluate(),
      y: y.evaluate(),
      cycleInterval: engine.getCycleInterval()
    };
    sender.send('move-by', data);
    return [ { theta: {} } ];
  });
};
