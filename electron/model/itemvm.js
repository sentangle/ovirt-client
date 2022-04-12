//虚拟机操作
const configObj = require("../utils/config");
const functionObj = require("../utils/function");
const ovirtapiObj = require("../api/ovirtapi");
const hostTool = require("../utils/hosts_tool");
const fs = require("fs");
const os = require("os");
const myevents = require("events");
const eventEmitter = new myevents.EventEmitter();

// 默认window客户端
let remote_viewer_path = ".\\VirtViewer\\bin\\remote-viewer.exe";
if (os.platform() != "win32") {
  remote_viewer_path = "/usr/bin/remote-viewer";
}
let vminfo = {};

//虚拟机所有信息获取完毕
eventEmitter.on("have_allitem_info", (args) => {
  var fd2 = fs.openSync("./vv.pem", "w");
  fs.writeSync(fd2, args.ca);
  fs.closeSync(fd2);

  console.log("have_allitem_info", args);

  // 添加主机关联地址
  hostTool.add_host(args.host_address, args.host_domain);

  let entervm_str = remote_viewer_path.concat(
    ' "spice://',
    args.host_domain,
    "/?tls-port=",
    args.port,
    "&password=",
    args.ticket,
    '" --spice-ca-file=./vv.pem ',
    args.full_screen // ' -f' # 全屏参数
    // ' --spice-debug=true',
  );

  let result = { status: true, message: "打开虚拟机已就绪" };
  var exec = require("child_process").exec,
    last = exec(entervm_str);

  last.stdout.on("data", (data) => {
    console.log("标准输出：" + data);
  });

  last.on("exit", function (code) {
    console.log("虚拟机已关闭，退出代码:" + code);
    if (code === 0) {
      result.status = true;
      result.message = "虚拟机（" + args.name + "）" + "正常关闭";
    } else {
      result.status = false;
      result.message =
        "虚拟机（" + args.name + "）" + "异常退出，退出码:" + code;
    }
  });
});

//虚拟机开机了的情况 然后开始获取ticket 动态密钥
eventEmitter.on("signal_vm_isup", (args) => {
  console.log("signal_vm_isup:start:", args);
  vminfo["name"] = args.name;
  vminfo["id"] = args.id;
  vminfo["host_address"] = args.display.address;
  vminfo["port"] = args.display.secure_port;
  vminfo["ca"] = args.display.certificate.content;
  vminfo["host_domain"] = args.display.certificate.subject.split("CN=")[1];

  // 全屏参数
  vminfo["full_screen"] = "-f";
  let jv = configObj.getItem("full_screen_checked");
  if (functionObj.isEmpty(jv)) {
    configObj.setItem("full_screen_checked", true);
  } else if (jv === false) {
    vminfo["full_screen"] = "";
  }

  let result = { status: false, data: "", message: "" };
  let requestObj = ovirtapiObj.GET_VM_TICKET(args.id);
  requestObj.then((res) => {
    console.log("GET_VM_TICKET:", args);
    if (res.status === 200) {
      vminfo["ticket"] = res.data.ticket.value;
      result = eventEmitter.emit("have_allitem_info", vminfo);
    } else {
      result.message = "获取虚拟机ticket失败";
    }
  });
});
exports.getallvminfo = (channel, args) => {
  let result = { data: "", message: "", status: false };
  let requestObj = ovirtapiObj.GET_VMS_INFO();
  requestObj
    .then((res) => {
      if (res.status === 200) {
        // 如果获取列表为空, 返回 false
        if (res.data === {}) return false;

        let vmsinfo = [];
        let vmList = res.data["vm"];

        for (let i = 0; i < vmList.length; i++) {
          let tmp_vminfo = {};
          tmp_vminfo["id"] = vmList[i]["id"];
          tmp_vminfo["name"] = vmList[i]["name"];
          tmp_vminfo["status"] = vmList[i]["status"];
          tmp_vminfo["description"] = vmList[i]["description"];
          tmp_vminfo["os"] = vmList[i]["os"]["type"];
          tmp_vminfo["run_time"] = "0分钟";

          if (tmp_vminfo["status"] == "up") {
            if (vmList[i]["start_time"] > 0) {
              let time_diff = new Date() - vmList[i]["start_time"];
              tmp_vminfo["run_time"] = functionObj.timeDiff(time_diff);
            }
          }
          vmsinfo.push(tmp_vminfo);
        }

        result["status"] = true;
        result["message"] = "";
        result["data"] = vmsinfo;
        if (args.data === "timerupdateinfo") {
          result["timerupdateinfo"] = true;
        } else {
          result["timerupdateinfo"] = false;
        }
      } else {
        result["status"] = false;
        result["message"] =
          "请求虚拟机列表错误错误代码:" +
          res.status +
          "\n" +
          res.request.toString();
      }
      channel.returnValue = result;
    })
    .catch((err) => {
      result.message = err.toString();
      channel.returnValue = result;
    });
};
exports.openvmspiceconnect = (channel, args) => {
  let result = { status: false, data: "", message: "" };
  // 检查客户端是否存在
  let file_exist = fs.existsSync(remote_viewer_path);
  if (file_exist == false) {
    result.message = "请检查 remote-viewer 客户端是否安装";
    channel.returnValue = result;
    return;
  }
  //在此添加打开虚拟机的一系列操作
  let tmpi = 0;
  let intervalFunc = () => {
    tmpi = tmpi + 1;
    if (tmpi >= 30) {
      clearInterval(timergetitemvminfo);
      result = {
        status: false,
        data: "",
        message: "虚拟机(" + args.name + ")打开超时",
      };
    }
    let itemvminforetu = ovirtapiObj.GET_ITEM_VMINFO(args.vmid);
    itemvminforetu.then((res) => {
      console.log("GET_ITEM_VMINFO:", res);
      if (res.status === 200) {
        if (res.data.status === "down") {
          //需要开机
          if (tmpi >= 3) {
            clearInterval(timergetitemvminfo);
            result = {
              status: false,
              data: "",
              message: "虚拟机(" + args.name + ")开机失败",
            };
          }
          ovirtapiObj.ACTION_VM(args.vmid, "start");
        } else if (
          res.data.status === "up" ||
          res.data.status === "powering_up"
        ) {
          clearInterval(timergetitemvminfo);
          result.status = true;
          result.message = "虚拟机正打开中";
          eventEmitter.emit("signal_vm_isup", res.data);
        }
      } else {
        clearInterval(timergetitemvminfo);
        result = { status: false, data: "", message: res.data };
      }
      channel.returnValue = result;
    });
  };

  let for_time = 3000;
  let timergetitemvminfo = setInterval(() => intervalFunc, for_time);
  intervalFunc();
};

//用户操作虚拟机
exports.actionvm = (channel, args) => {
  let result = { status: false, data: "", message: "" };
  let requestObj = ovirtapiObj.ACTION_VM(args.vmid, args.action);
  requestObj
    .then((res) => {
      if (res.status === 200) {
        result["status"] = true;
        if (args.action === "start") {
          result["message"] = "电脑[" + args["name"] + "]正开机中...";
        } else if (args.action === "stop") {
          result["message"] = "电脑[" + args["name"] + "]正断电中...";
        } else if (args.action === "reboot") {
          result["message"] = "电脑[" + args["name"] + "]正重启中...";
        } else if (args.action === "shutdown") {
          result["message"] = "电脑[" + args["name"] + "]正关机中...";
        }
      } else {
        result["status"] = false;
        result["message"] =
          args["name"] + "操作失败(status code:" + res.status + ")";
      }
      channel.returnValue = result;
    })
    .catch((err) => {
      result["status"] = false;
      result["message"] = args["name"] + "操作失败(" + err.toString() + ")";
    });
};
