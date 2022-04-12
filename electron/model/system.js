//系统操作
const os = require("os");
const loudness = require("loudness");

const execShell = require("child_process").exec;
let shutdownShell = "shutdown -s -t 00";
let rebootShell = "shutdown -r -t 0";
if (os.platform() != "win32") {
  shutdownShell = "shutdown now";
  rebootShell = "shutdown -r now";
}
// console.log(os.platform());

exports.shutdownOs = (channel, args) => {
  let command = execShell(shutdownShell, function (err, stdout, stderr) {
    if (err || stderr) {
      console.log("shutdown failed" + err + stderr);
    }
  });
  command.stdin.end();
  command.on("close", function (code) {
    console.log("shutdown", code);
  });
};
exports.rebootOs = (channel, args) => {
  let command = execShell(rebootShell, function (err, stdout, stderr) {
    if (err || stderr) {
      console.log("reboot failed" + err + stderr);
    }
  });
  command.stdin.end();
  command.on("close", function (code) {
    console.log("reboot", code);
  });
};

// 设置音量为特定值
exports.setSound = async (channel, soundVal) => {
  console.log(soundVal);
  await loudness.setVolume(soundVal);
};
// console.log("sound:", loudness.getVolume());
// 获取当前音量
exports.getSound = async (channel, args) => {
  let val = await loudness.getVolume();
  channel.returnValue = {
    status: true,
    data: val,
  };
};
// 设置和取消静音
exports.setSoundNone = async (a = true) => {
  if (a) {
    await loudness.setMuted(false);
    return 0;
  } else {
    await loudness.setMuted(true);
    return 1;
  }
};
