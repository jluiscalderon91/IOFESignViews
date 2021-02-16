import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
  name: 'dateformat'
})
export class DateformatPipe implements PipeTransform {

  transform(date: any): any {
    if (date) {
      const pipe = new DatePipe('en-US');
      return pipe.transform(date, 'dd-MM-yyyy HH:mm');
    }
    return '-';
  }
}
