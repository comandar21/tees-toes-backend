import { RequestPromise } from "request-promise";

export const sendRequest = async <T>(
  method: string,
  url: string,
  body?: any,
  token?: string
): Promise<T> => {
  // console.log(token);

  if (body == null) {
    const option = {
      method: method,
      url: url,
      headers: {
        authorization: token, // token
        "content-Type": "application/json",
      },
      // json: json
      // body: JSON.stringify(body),
    };
    return await RequestPromise(option);
  }
  // console.log('body:', body, " ", "token:", token);

  const option = {
    method: method,
    url: url,
    headers: {
      authorization: token, // token
      "content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  return await RequestPromise(option);
};
