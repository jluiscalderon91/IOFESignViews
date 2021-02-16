import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'enterpriseName'
})
export class EnterpriseNamePipe implements PipeTransform {

  transform(person: any): any {
    if (person._more) {
      return person._more.enterpriseNameView;
    }
    return '';
  }

}
