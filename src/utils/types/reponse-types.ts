export type SuccessResponse = {
  status: boolean;
  code: number;
  message?: string;
  data?: object | Array<any> | any;
  request?: {
    url: string;
    method: string;
  };
};

export type ErrorResponse = {
  status: boolean;
  code: number;
  message?: string;
  error: object | Array<any> | any;
  token_expired?: boolean;
  request?: {
    url: string;
    method: string;
  };
};
