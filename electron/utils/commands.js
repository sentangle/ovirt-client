//获取系统命令行返回值
exports.getstatusoutput = (commands_str) => {
  var exec = require("child_process").execSync;
  var str = exec(commands_str);
  return str.toString("utf8").trim();
};
