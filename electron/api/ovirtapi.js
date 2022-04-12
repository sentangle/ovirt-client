//二次封装ovirt api
const { request_api } = require("./request");
let configObj = require("../utils/config");
//信息
const loginstatusdata = configObj.getItem("loginstatusdata");
const CENTERIP = loginstatusdata.centerip;
const TOKEN = configObj.getItem("token");

//获取虚拟机详细信息
exports.GET_ITEM_VMINFO = async (vmid) => {
  let request_dict_args = {
    method: "get",
    url: "https://" + CENTERIP + "/ovirt-engine/api/vms/" + vmid,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: TOKEN,
    },
    data: {},
  };
  return request_api(request_dict_args);
};

//获取虚拟机ticket
exports.GET_VM_TICKET = async (vmid) => {
  var dict_args = {
    method: "post",
    url: "https://" + CENTERIP + "/ovirt-engine/api/vms/" + vmid + "/ticket",
    headers: {
      "Content-Type": "application/xml",
      Accept: "application/json",
      Authorization: TOKEN,
    },
    data: "<action><ticket></ticket></action>",
  };

  return request_api(dict_args);
};

//操作虚拟机开机关机等
exports.ACTION_VM = async (vmid, action) => {
  var dict_args = {
    method: "post",
    url: "https://" + CENTERIP + "/ovirt-engine/api/vms/" + vmid + "/" + action,
    headers: {
      "Content-Type": "application/xml",
      Accept: "application/json",
      Authorization: TOKEN,
    },
    data: "<action/>",
  };

  return request_api(dict_args);
};

//获取token
exports.GET_TOKEN = async (isfirst, args) => {
  console.log("GET_TOKEN:", args);
  let username = "";
  let password = "";
  let centerip = "";
  let domain = "";

  username = args.username;
  password = args.password;
  centerip = args.centerip;
  domain = args.domain;

  var dict_args = {
    method: "post",
    url: "https://" + centerip + "/ovirt-engine/sso/oauth/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    data: {
      grant_type: "password",
      username: username + "@" + domain,
      password: password,
      scope: "ovirt-app-api",
    },
  };
  return request_api(dict_args);
};

//获取所有虚拟机信息
exports.GET_VMS_INFO = async () => {
  let dict_args = {
    method: "get",
    url: "https://" + CENTERIP + "/ovirt-engine/api/vms",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: TOKEN,
    },
    data: {},
  };

  return request_api(dict_args);
};

//检查是否是ovirt引擎
exports.CHECK_IS_OVIRT_ENGINE = async (centaddr) => {
  var dict_args = {
    method: "get",
    url: "https://" + centaddr + "/ovirt-engine/services/health",
    headers: {},
    data: {},
  };
  return request_api(dict_args);
};
