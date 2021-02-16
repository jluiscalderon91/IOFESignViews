import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'description'
})
export class DescriptionPipe implements PipeTransform {

  transform(operator: any): string {
    const operation = operator.operationByOperationId;
    if (operation != null) {
      return operation.description;
    }
    return '';
  }

}
