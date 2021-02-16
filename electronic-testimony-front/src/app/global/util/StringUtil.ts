export class StringUtil {

  public static concatIdentifiers(selectedItems: any[]): string {
    return this.concatIdentifiers2(selectedItems, ',');
  }

  public static concatIdentifiers2(selectedItems: any[], separator: string): string {
    return selectedItems.map(item => item.id).join(separator);
  }

  public static removeLastCharacter(value: string): string {
    return value.substring(0, value.length - 1);
  }

  public static cut(source: string, finalSize: number, defaultValue?: string) {
    if (source === undefined) {
      return defaultValue;
    }
    return source.length > 42 ? source.substr(0, finalSize).concat('...') : source;
  }
}
