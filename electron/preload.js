const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("ipcRender", ipcRenderer);
