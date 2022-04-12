const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require("electron");
const path = require("path");
const NODE_ENV = process.env.NODE_ENV;

let centerObj = require("./model/set_center");
let loginObj = require("./model/login");
let vmObj = require("./model/itemvm");
let osObj = require("./model/system");
//测试
ipcMain.on("test", (channel, args) => {
  channel.returnValue = args;
});
//中心管理
ipcMain.on("centeradd", centerObj.centeradd);
ipcMain.on("centerupdate", centerObj.centerupdate);
ipcMain.on("loginvalidate", loginObj.loginvalidate);
ipcMain.on("loginout", loginObj.loginout);
ipcMain.on("getallvminfo", vmObj.getallvminfo);
ipcMain.on("openvmspiceconnect", vmObj.openvmspiceconnect);
ipcMain.on("actionvm", vmObj.actionvm);
ipcMain.on("shutdownOs", osObj.shutdownOs);
ipcMain.on("rebootOs", osObj.rebootOs);
ipcMain.on("getSound", osObj.getSound);
ipcMain.on("setSound", osObj.setSound);
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 980,
    height: 680,
    transparent: true,
    // fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // mainWindow.webContents.openDevTools()
  const menu = new Menu();
  menu.append(new MenuItem({ label: "复制", role: "copy" }));
  menu.append(new MenuItem({ label: "粘贴", role: "paste" }));
  menu.append(new MenuItem({ label: "刷新", role: "forceReload" }));
  mainWindow.webContents.on("context-menu", (e, params) => {
    menu.popup({ window: mainWindow, x: params.x, y: params.y });
  });

  if (NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:8080/");
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
