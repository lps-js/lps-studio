import { Pipe, PipeTransform } from '@angular/core';

// Source: https://stackoverflow.com/a/35261193/126039

@Pipe({
  name: 'mapToIterable'
})
export class MapToIterable implements PipeTransform {
  transform(dict: Object) {
    return Object
      .keys(dict)
      .map((key) => {
        let value = dict[key];
        return {
          key: key,
          val: dict[key]
        };
      });
  }
}
