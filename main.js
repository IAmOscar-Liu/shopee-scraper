const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const settings = require("electron-settings");
const scrape = require("./scrape");
const { createModalHtml } = require("./createModalHtml");
const { readExcelFile } = require("./readExcelFile");
const { downloadExcelFile } = require("./downloadExcelFile");
const { readGoogleSheet } = require("./readGogleSheet");
let win, modalWin;
let isScraping = false;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: false,
      // worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");

  // Run "npm run start_after_build_react" after "npm run build_react"
  // win.loadFile('./build/index.html');

  win.on("closed", () => (win = null));
}

function createModalWindow(data) {
  modalWin = new BrowserWindow({
    parent: win,
    modal: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
    },
  });

  const html = createModalHtml(data);

  modalWin.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
  modalWin.on("close", () => (modalWin = null));
}

// app.whenReady().then(createWindow);
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle("read-excel-file", (e) => {
  const fileNames = dialog.showOpenDialogSync();
  if (fileNames === undefined) {
    return { data: null, error: null };
  }
  // console.log(fileNames[0]);
  if (!/.xlsx$/.test(fileNames[0])) {
    dialog.showMessageBoxSync(null, {
      type: "error",
      message: "Error! The file is not an xlsx file",
    });
    return { data: null, error: "Error! The file is not an xlsx file!" };
  }
  return readExcelFile(fileNames[0], dialog);
});

ipcMain.handle("read-google-sheet", (e, url) => {
  return readGoogleSheet(url, dialog);
});

ipcMain.handle("getTitleAndPriceClass", (e) => {
  return {
    titleClass: settings.hasSync("key.titleClass")
      ? settings.getSync("key.titleClass")
      : "_2rQP1z",
    priceClass: settings.hasSync("key.priceClass")
      ? settings.getSync("key.priceClass")
      : "_2Shl1j",
    deliverClass: settings.hasSync("key.deliverClass")
      ? settings.getSync("key.deliverClass")
      : "_3ihqr8"  
  };
});

ipcMain.on("setTitleAndPriceClass", (e, titleClass, priceClass, deliverClass) => {
  settings.setSync("key", {
    titleClass,
    priceClass,
    deliverClass
  });
  dialog.showMessageBox(null, {
    message: "Successfully reset the class of product title, product price and product delivery",
  });
});

ipcMain.on("api_start_scraping", async (e, data) => {
  // console.log(`data received in main: ${data}`);
  if (isScraping || win === null)
    return console.log("scraping, please wait......");

  isScraping = true;
  await scrape(data, win);
  isScraping = false;
  console.log("done");
});

ipcMain.on("openModal", (e, data) => {
  createModalWindow(data);
});

ipcMain.on("download-excel-file", (e, data) => {
  if (!data || data.length === 0) return;
  const dirs = dialog.showOpenDialogSync(null, {
    properties: ["openDirectory"],
  });
  if (dirs === undefined) return;
  const d = new Date();
  const newFilePath = path.join(
    dirs[0],
    `Shopee_scraping_${(Math.random() + "").slice(2, 8)}_on_${
      d.getMonth() + 1
    }_${d.getDate()}_${d.getFullYear()}.xlsx`
  );
  downloadExcelFile(data, newFilePath);
  dialog.showMessageBox(null, {
    message: `File has been downloaded at ${newFilePath}`,
  });
});
