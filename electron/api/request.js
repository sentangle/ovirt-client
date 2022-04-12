//此文件编写http请求客户端代码
const axios = require("axios");
const https = require("https");
const qs = require("qs");
exports.request_api = (dict_args) => {
  let args_data = null;
  if (typeof dict_args.data === "string") {
    args_data = dict_args.data;
  } else {
    args_data = qs.stringify(dict_args.data);
  }

  let myAxiosConfig = {
    url: dict_args["url"],
    method: dict_args["method"],
    headers: dict_args["headers"],
    data: args_data,

    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
    }),
  };
  axios.defaults.timeout = 30000;

  return axios.request(myAxiosConfig);
};
