export class DocumentState {
  public static readonly PENDING = 1;
  public static readonly SIGNED = 2;
  public static readonly REVIEWED = 3;
  public static readonly OBSERVED = 4;
  public static readonly FINISHED = 6;
  public static readonly DOWNLOADED = 7;
  public static readonly DELIVERED = 9;
  public static readonly ATTENDED = 10;
  public static readonly CANCELED = 15;
  public static readonly MODIFIED = 16;
  public static readonly VISUALIZED = 20;
  public static readonly MY_PENDINGS = 30;
  public static readonly SCHEDULE_ATTACH_DELIVERY = 40;
  public static readonly ATTACH_SENT = 41;
  public static readonly ERROR_SENDING_ATTACH = 42;
  public static readonly ES_GRAPHIC_SIGNATURE = 50;
  public static readonly ALL = 100;
}
