export function createAnimationFuncForTuple(obj, propertyKey, target) {
  let original0 = obj[propertyKey][0];
  let original1 = obj[propertyKey][1];
  let delta0 = target[0] - obj[propertyKey][0];
  let delta1 = target[1] - obj[propertyKey][1];
  return (timeRatio: number) => {
    obj[propertyKey] = [
      original0 + timeRatio * delta0,
      original1 + timeRatio * delta1
    ];
  };
};

export function createAnimationFuncForNumber(obj, propertyKey, target) {
  let original = obj[propertyKey];
  let delta = target - obj[propertyKey];
  return (timeRatio: number) => {
    obj[propertyKey] = original + timeRatio * delta;
  };
};

export function createAnimation(
  obj,
  animations,
  duration,
  tupleProperties,
  numberProperties,
  animationProperties
) {
  let subAnimationSet = [];
  Object.keys(animationProperties).forEach((key) => {
    if (tupleProperties.indexOf(key) !== -1) {
      subAnimationSet.push(createAnimationFuncForTuple(obj, key, animationProperties[key]));
    } else if (numberProperties.indexOf(key) !== -1) {
      subAnimationSet.push(createAnimationFuncForNumber(obj, key, animationProperties[key]));
    }
  });

  return new Promise((resolve) => {
    let startTime;
    let animationFunc = (timestamp: number) => {
      if (startTime === undefined) {
        startTime = timestamp;
        return true;
      }
      let timeElapsed = timestamp - startTime;
      if (timeElapsed > duration) {
        subAnimationSet.forEach((func) => {
          func(1);
        });
        resolve();
        return false;
      }
      let timeRatio = timeElapsed / duration;
      subAnimationSet.forEach((func) => {
        func(timeRatio);
      });
    };
    obj.animations.push(animationFunc);
  });
}
