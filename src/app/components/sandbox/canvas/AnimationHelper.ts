export function createAnimationFuncForTuple(obj, propertyKey, target, duration) {
  let original0 = obj[propertyKey][0];
  let original1 = obj[propertyKey][1];
  let delta0 = target[0] - obj[propertyKey][0];
  let delta1 = target[1] - obj[propertyKey][1];
  let startTime;
  return (timestamp: number) => {
    if (startTime === undefined) {
      startTime = timestamp;
      return true;
    }
    let timeElapsed = timestamp - startTime;
    if (timeElapsed >= duration) {
      obj[propertyKey][0] = target[0];
      obj[propertyKey][1] = target[1];
      return false;
    }
    let timeRatio = timeElapsed / duration;
    obj[propertyKey][0] = original0 + timeRatio * delta0;
    obj[propertyKey][1] = original1 + timeRatio * delta1;
    return true;
  };
};

export function createAnimationFuncForNumber(obj, propertyKey, target, duration) {
  let original = obj[propertyKey];
  let delta = target - obj[propertyKey];
  let startTime;
  return (timestamp: number) => {
    if (startTime === undefined) {
      startTime = timestamp;
      return true;
    }
    let timeElapsed = timestamp - startTime;
    if (timeElapsed >= duration) {
      obj[propertyKey] = target;
      return false;
    }
    let timeRatio = timeElapsed / duration;
    obj[propertyKey] = original + timeRatio * delta;
    return true;
  };
};
