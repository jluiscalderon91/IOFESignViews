export class Constant {

  public static readonly LOCAL_MODE = 1;
  public static readonly DEV_MODE = 2;
  public static readonly QA_MODE = 3;
  public static readonly PROD_MODE = 4;
  public static readonly MODE = Constant.DEV_MODE;
  // @ts-ignore
  public static readonly PROTOCOL = Constant.MODE === Constant.LOCAL_MODE ? 'http' : 'https';
  // @ts-ignore
  public static readonly PORT = Constant.MODE === Constant.LOCAL_MODE ? '8080' : '443';
  // @ts-ignore
  public static readonly HOST = Constant.MODE === Constant.LOCAL_MODE ? 'localhost' : Constant.MODE === Constant.DEV_MODE ? 'api.dev.iofesign.com' : Constant.MODE === Constant.QA_MODE ? 'api.qa.iofesign.com' : 'api.iofesign.com';
  public static readonly ROOT = Constant.PROTOCOL + '://' + Constant.HOST + ':' + Constant.PORT;
  public static readonly TYPE = 'api';
  public static readonly VERSION = 'v1';
  public static readonly ROOT_API_V1 = Constant.PROTOCOL + '://' + Constant.HOST + ':' + Constant.PORT + '/' + Constant.TYPE + '/' + Constant.VERSION;
  public static readonly NOT_FINISHED = 0;
  public static readonly FINISHED = 1;
  public static readonly USER = 1;
  public static readonly INVITED_USER = 2;
  public static readonly INVITED = 3;
  public static readonly RB_ADD_NEW = '1';
  public static readonly RB_SEARCH = '2';
  public static readonly BATCH = 1;
  public static readonly ONE2ONE = 0;
  public static readonly INACTIVE = 0;
  public static readonly ACTIVE = 1;
  public static readonly HAS_NOT_COMMENT = 0;
  public static readonly HAS_COMMENT = 1;
  public static readonly NATURAL_PERSON = 1;
  public static readonly LEGAL_PERSON = 2;
  public static readonly SIGN_OPTION = 1;
  public static readonly REVIEW_OPTION = 2;
  public static readonly DEFAULT_ENTERPRISE_ID_VIEW = 1;
  public static readonly DEFAULT_JOB_ID = 1;
  public static readonly DEFAULT_PERSON_ID = 1;
  public static readonly DEFAULT_IOFE_ID_VIEW = 2;
  public static readonly DNI = 1;
  public static readonly CARNE_EXTRANJERIA = 2;
  public static readonly PASSAPORTE = 3;
  // @ts-ignore
  public static readonly SCHEMA = Constant.MODE === Constant.LOCAL_MODE ? 'http' : 'https';
  public static readonly ROLE_SUPERADMIN = 'ROLE_SUPERADMIN';
  public static readonly ROLE_PARTNER = 'ROLE_PARTNER';
  public static readonly ROLE_ADMIN = 'ROLE_ADMIN';
  public static readonly ROLE_USER = 'ROLE_USER';
  public static readonly ROLE_ASSISTANT = 'ROLE_ASSISTANT';
  public static readonly ROLE_SUPERVISOR = 'ROLE_SUPERVISOR';
  public static readonly REPLACEABLE = 1;
  public static readonly NOT_REPLACED = 0;
  public static readonly REPLACED = 1;
  public static readonly ADD_TSA = 1;
  public static readonly NOT_ADD_TSA = 0;
  public static readonly COMPLETED = 1;
  public static readonly INCOMPLETE = 0;
  public static readonly NOT_OBSERVED = 0;
  public static readonly OBSERVED = 1;
  public static readonly NOT_MANDATORY = 0;
  public static readonly MANDATORY = 1;
  public static readonly ADD = 1;
  public static readonly EDIT = 2;
  public static readonly ADD_ON_DOCS = 3;
  public static readonly SEARCH_ON_DOCS = 4;
  public static readonly HAS_MULTIPLE_ATTACHMENTS = 1;
  public static readonly NOT_SEND_ALERT = 0;
  public static readonly SEND_ALERT = 1;
  public static readonly ONLY_API_OPTION = '1';
  public static readonly NOT_SEND_NOTIFICATION = 0;
  public static readonly SEND_NOTIFICATION = 1;
  public static readonly SAVE_OPTION = 1;
  public static readonly PREVIEW_OPTION = 2;
  public static readonly FIRST_OPERATION = 1;
  public static readonly NOT_READY_TO_USE = 0;
  public static readonly READY_TO_USE = 1;
  public static readonly SIE_NOT_CONFIGURED = 0;
  public static readonly SIE_CONFIGURED = 1;
  public static readonly NOT_REQUIRED_SIE_CONFIG = 0;
  public static readonly REQUIRED_SIE_CONFIG = 1;
  public static readonly NOT_REMOVABLE = 0;
  public static readonly REMOVABLE = 1;
  public static readonly NOT_EDITABLE = 0;
  public static readonly EDITABLE = 1;
  public static readonly ROLE_AUTHORITY_MODE = 1;
  public static readonly USER_AUTHORITY_MODE = 2;
  public static readonly NOT_ONLY_SUPERADMIN = 0;
  public static readonly ONLY_SUPERADMIN = 1;
  public static readonly ZERO_INDEX = 0;
  public static readonly FIRST_INDEX = 1;
  public static readonly NOT_DELIVER = 0;
  public static readonly DELIVER = 1;
  public static readonly HAS_NOT_DELIVER_OPTION = 0;
  public static readonly HAS_DELIVER_OPTION = 1;
  public static readonly SIE_SIGN = 1;
  public static readonly SIE_NOTIFICATION = 2;
  public static readonly SIE_LAYOUT = 3;
  public static readonly STATICALLY = 0;
  public static readonly DYNAMICALLY = 1;
  public static readonly MINIMUM_PARTICIPANTS = 1;
  public static readonly MINIMUM_OPERATOR = 0;
  public static readonly OFF = 0;
  public static readonly ON = 1;
  public static readonly FIRST_OPERATOR = 1;
  public static readonly EMPTY_LIST = 0;
  public static readonly CORRECT_OPERATION = 1;
  public static readonly OLD_SIGNATURE = 1;
  public static readonly NEW_SIGNATURE = 0;
  public static readonly EXCLUDED = 1;
  public static readonly NOT_EXCLUDED = 0;
  public static readonly IOFE_COIN = '(IOF)';
  public static readonly IS_PARTNER = 1;
  public static readonly IS_NOT_PARTNER = 0;
  public static readonly HAS_NOT_CONFIG_BALANCE = 0;
  public static readonly HAS_CONFIG_BALANCE = 1;
  public static readonly ISNT_RETURNED_BALANCE = 0;
  public static readonly IS_RETURNED_BALANCE = 1;
}
