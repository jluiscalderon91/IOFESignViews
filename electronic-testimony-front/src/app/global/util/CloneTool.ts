export class CloneTool {

  public static do(object: any): any {
    return Object.assign({}, object);
  }

  public static doList(objects: any[]): any {
    return objects.map(object => CloneTool.do(object));
  }
}
