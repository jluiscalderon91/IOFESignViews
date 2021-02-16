import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'personName'
})
export class NamePipe implements PipeTransform {

  transform(operator: any): string {
    if (operator.personByPersonId) {
      return operator.personByPersonId.fullname;
    }
    return '';
  }
}
