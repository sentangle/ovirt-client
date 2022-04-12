//set 数据中心
let configObj = require("../utils/config");
let ovirtapiObj = require("../api/ovirtapi");
let functionObj = require("../utils/function");

//添加中心功能
exports.centeradd = (channel, args) => {
  console.log("center_add", args);
  let result = { data: "", status: false, message: "" };
  let centerinfo = [];
  let centerinfoConfig = configObj.getItem("centerinfo");
  if (!functionObj.isEmpty(centerinfoConfig)) {
    centerinfo = centerinfoConfig;
    // 判断ip是否存在
    for (let i = 0; i < centerinfo.length; i++) {
      console.log(centerinfo[i].ip);
      if (args.ip === centerinfo[i].ip) {
        result.message = "该中心已添加过了";
        channel.returnValue = result;
        return;
      }
    }
  }
  // 判断中心是否是ovirt中心
  let center_ip_port = args.ip + ":" + args.port;
  let requestObj = ovirtapiObj.CHECK_IS_OVIRT_ENGINE(center_ip_port);
  requestObj
    .catch(() => {
      result.message = "添加失败:该地址不是ovirt管理服务地址";
      channel.returnValue = result;
      return;
    })
    .then((res) => {
      console.log("CHECK_IS_OVIRT_ENGINE:", res.data);
      if (res?.status === 200) {
        // 添加中心, 保存到配置文件
        centerinfo.push(args);
        configObj.setItem("centerinfo", centerinfo);
        result.status = true;
      } else {
        result.message = "添加失败:中心地址认证错误";
      }
      channel.returnValue = result;
    });
};
//更新中心功能
exports.centerupdate = (channel, args) => {
  let result = { data: "", status: false, message: "" };
  configObj.setItem("centerinfo", args);
  result.status = true;
  result.message = "更新成功";
  channel.returnValue = result;
};
