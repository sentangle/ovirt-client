// 登录模块
let ovirtapiObj = require("../api/ovirtapi");
let configObj = require("../utils/config");

exports.timeupdatetoken = (channel, args) => {
  //检查token过期时间
  let requestObj = ovirtapiObj.GET_TOKEN(false, {});
  requestObj.then((res) => {
    if (typeof res === "object") {
      let tmpdata = res["data"];
      if (typeof tmpdata === "object") {
        configObj.setItem("token", "Bearer " + tmpdata["access_token"]);
      }
    }
  });
};
exports.loginout = (channel, args) => {
  configObj.setItem("isLogin", 0);
  let loginstatusdata = configObj.getItem("loginstatusdata");
  console.log(loginstatusdata);
  console.log(loginstatusdata.autologin);
  if (loginstatusdata.autologin == "1") {
    loginstatusdata.autologin = "0";
    console.log(loginstatusdata);
    configObj.setItem("loginstatusdata", loginstatusdata);
  }

  channel.returnValue = { status: true, message: "退出成功" };
  return;
};

//登录认证功能
exports.loginvalidate = (channel, args) => {
  let result = { data: "", status: false, message: "" };
  //获取ip的domain
  let centerinfoConfig = configObj.getItem("centerinfo");
  for (let index = 0; index < centerinfoConfig.length; index++) {
    console.log(centerinfoConfig[index].ip);
    console.log(args.ip);
    if (centerinfoConfig[index].ip === args.ip) {
      args.domain = centerinfoConfig[index].domain;
      args.centerip = args.ip + ":" + centerinfoConfig[index].port;
    }
  }
  let requestObj = ovirtapiObj.GET_TOKEN(true, args);
  requestObj
    .catch((err) => {
      console.log("GET_TOKEN:err:", err.response.data);
      if (
        err.response.data.message_code == "access_denied" ||
        err.response.status == 400
      ) {
        result.message = "用户名或密码不正确";
      }
      channel.returnValue = result;
      return;
    })
    .then((res) => {
      console.log("GET_TOKEN:res:", res.data);
      if (typeof res === "object") {
        let tmpdata = res["data"];
        if (typeof tmpdata === "object") {
          result["message"] = "";
          result["data"] = { token: "Bearer " + tmpdata["access_token"] };
          result["status"] = true;
          configObj.setItem("token", "Bearer " + tmpdata["access_token"]);
          configObj.setItem("loginstatusdata", args);
          configObj.setItem("isLogin", 1);
        } else {
          result["message"] = "登录认证错误!";
          result["data"] = "";
          result["status"] = false;
        }
      } else {
        result["status"] = false;
        result["message"] = "forceclose";
      }
      channel.returnValue = result;
      return;
    });
};

// ipcMain.on("client-mini", (event, data) => {
//   global.mainWindow.minimize();
// });

// ipcMain.on("client-close", (event, data) => {
//   app.quit();
// });
