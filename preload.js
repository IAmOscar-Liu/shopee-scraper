const { ipcRenderer, contextBridge } = require("electron");
const shell = require("electron").shell;

contextBridge.exposeInMainWorld("electron", {
  api: {
    getTitleAndPriceClass: async () => {
      const result = await ipcRenderer.invoke("getTitleAndPriceClass");
      // console.log("result");
      // console.log(result.titleClass);
      return result;
    },
    setTitleAndPriceClass: (titleClass, priceClass, deliverClass) => {
      ipcRenderer.send("setTitleAndPriceClass", titleClass, priceClass, deliverClass);
    },
    readExcelFile: () => {
      return ipcRenderer.invoke("read-excel-file");
    },
    readGoogleSheet: (url) => {
      return ipcRenderer.invoke("read-google-sheet", url);
    },
    openBrowserWindow: (url) => {
      shell.openExternal(url);
    },
    startScraping: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, callback) => {
      ipcRenderer.on(channel, (e, data) => {
        // console.log(`data received in preload: ${data}`);
        callback(data);
      });
    },
    openModal: (data) => {
      ipcRenderer.send("openModal", data);
    },
    downloadExcelFile: (data) => {
      ipcRenderer.send("download-excel-file", data);
    },
  },
  // other functions...
});
