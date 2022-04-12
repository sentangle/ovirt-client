exports.isEmpty = (obj) => {
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
};

// 计算时间差
exports.timeDiff = (time_diff) => {
  let days = Math.floor(time_diff / (24 * 3600 * 1000));
  //计算出小时数
  let leave1 = time_diff % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
  let hours = Math.floor(leave1 / (3600 * 1000));
  //计算相差分钟数
  let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
  let minutes = Math.floor(leave2 / (60 * 1000));
  //计算相差秒数
  // let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
  // let seconds = Math.round(leave3 / 1000);

  let runTime = "0分钟";

  if (days > 0) {
    runTime = days.toString().concat("天", hours, "小时", minutes, "分钟");
  } else if (hours > 0) {
    runTime = hours.toString().concat("小时", minutes, "分钟");
  } else {
    runTime = minutes.toString().concat("分钟");
  }
  return runTime;
};
