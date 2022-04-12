const fs = require("fs");
const path = require("path");
const CONFIG_PATH = path.join(__dirname, "../configure.json");
// console.log(CONFIG_PATH);

exports.init_configure = () => {
  if (!fs.existsSync(CONFIG_PATH)) {
    let fileRes = fs.openSync(CONFIG_PATH, "w");
    fs.writeSync(fileRes, JSON.stringify({}));
    fs.closeSync(fileRes);
  }
};

exports.getItem = (keysv) => {
  let json_value = JSON.parse(fs.readFileSync(CONFIG_PATH));
  return json_value[keysv];
};

exports.setItem = (keysv, value) => {
  let json_value = JSON.parse(fs.readFileSync(CONFIG_PATH));
  json_value[keysv] = value;
  let str_value = JSON.stringify(json_value);
  var fileRes = fs.openSync(CONFIG_PATH, "w");
  fs.writeSync(fileRes, str_value);
  fs.closeSync(fileRes);
};
