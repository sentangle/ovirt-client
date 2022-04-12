export const isEmpty = (obj: any) => {
  if (typeof obj == "string") {
    obj.trim();
  }
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
};

export const timeFormate = () => {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month =
    dateObj.getMonth() + 1 < 10
      ? "0" + (dateObj.getMonth() + 1)
      : dateObj.getMonth() + 1;
  const date =
    dateObj.getDate() < 10 ? "0" + dateObj.getDate() : dateObj.getDate();
  const hh =
    dateObj.getHours() < 10 ? "0" + dateObj.getHours() : dateObj.getHours();
  const mm =
    dateObj.getMinutes() < 10
      ? "0" + dateObj.getMinutes()
      : dateObj.getMinutes();
  const ss =
    dateObj.getSeconds() < 10
      ? "0" + dateObj.getSeconds()
      : dateObj.getSeconds();
  const week = dateObj.getDay();
  const weeks = ["日", "一", "二", "三", "四", "五", "六"];
  const getWeek = "周" + weeks[week];
  return (
    year +
    "-" +
    month +
    "-" +
    date +
    " \n " +
    hh +
    ":" +
    mm +
    ":" +
    ss +
    "  " +
    getWeek
  );
};
