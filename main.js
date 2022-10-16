const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const settings = require("electron-settings");
const { scrape } = require("./scrape");
const { createModalHtml } = require("./createModalHtml");
const { readExcelFile } = require("./readExcelFile");
const { downloadExcelFile } = require("./downloadExcelFile");
const { readGoogleSheet } = require("./readGoogleSheet");
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

ipcMain.handle("getTestUrlAndCookie", (e) => {
  return {
    url: settings.getSync("testUrl")
      ? settings.getSync("testUrl")
      : "https://shopee.tw/%E8%98%87%E8%8F%B2%E8%B6%85%E7%86%9F%E7%9D%A141.5%E5%85%AC%E5%88%86%E4%B9%BE%E7%88%BD%E7%B6%B2%E5%B1%A4-%E7%B4%B0%E7%B7%BB%E6%A3%89%E6%9F%94-i.15828725.4248457236?sp_atk=9b2e92bf-0943-46a7-b3f9-4fabe5cfc074&fbclid=IwAR1UBWR0TQbzU9IZulcUoyoPz87ftlub2MhNXIZEMufA7nVGejFwdobz-aY",
    cookie: settings.hasSync("testCookie")
      ? settings.getSync("testCookie")
      : 'SPC_IA=-1; REC_T_ID=b6d127e7-4dc6-11eb-b3a7-48df37dda188; SPC_F=qqwFoYS6n5PBnhnQXfdXvdt7PjsUu013; REC_T_ID=b6dee5e2-4dc6-11eb-a739-b49691869054; __BWfp=c1609680145873xa5b751f2b; SC_DFP=PlCVGVdHlUVblnerGeox91eHcyd4pe6R; _gcl_au=1.1.2072460877.1658984790; _fbp=fb.1.1658984790577.1140682313; _med=refer; csrftoken=hE7WvBpeWMNedDOXFB14vlc4bpNbIo8N; _QPWSDCXHZQA=b7bc575e-1465-46bc-87f7-4632e58aeafb; __LOCALE__null=TW; cto_bundle=47WID19JeU5qWXpRUVJPaE9qRW9nYWRiUVlqWTZ2OGNkM1lQejU5Mmg1bjdycWs3c01zbUc5TFhwS3Q4eVM4ZVA5Y002ajdMZVI5SlRkUHhYTEZUJTJGM25LVHMlMkZmNSUyRlVETHZpQUExMW5vVkt1bzJLdDNDTnlQeEVIZEFsazZSbFg3YjJBS1hOR0phZjJJSDJIZW1IZ20lMkZjalZoQSUzRCUzRA; _gid=GA1.2.1564482495.1665833245; G_ENABLED_IDPS=google; G_AUTHUSER_H=0; SPC_CLIENTID=cXF3Rm9ZUzZuNVBCezosvjzoernjcmtf; SPC_ST=.QU5mRWFsd2tjanlFSU5jYjBkHTdCfV7g3yCMjaGdAKg/LVdV0xDEVux/NQp9VEtddyFHD7tQ6ELce+w5A/nBVXm4pwXfYvY2QTJ4Zxe8VOxSUy+W7u/ds8ryd5Oha5WmQx8+G3sJSEwQWr7MjXG9kE8Am1nVi5bGooWSeWkeSdqIAt+gIYO6EtD5cUG5xrKcsShzrFL2dLibVShx6mWdrQ==; SPC_U=883910780; SPC_T_ID=pYBZuBaRxWu53AtpNv5ymR3hLyUWbKHGrmtHDtwqwMJ3aHT+4B+e+WiYOUbFxzhhwT61kvY5RSZkWHvDUvEHnfIZZQT5S7fT7XzGwrxZqIztbWMI4q8PUmLF26ZAd1QQzL/KA7uPLVrPsDRzepXh2TP09Ynm1anrBU18oPYoMMg=; SPC_T_IV=eU1Zd3d5bUN6RXZKcHBWUQ==; SPC_T_IV="eU1Zd3d5bUN6RXZKcHBWUQ=="; SPC_T_ID="pYBZuBaRxWu53AtpNv5ymR3hLyUWbKHGrmtHDtwqwMJ3aHT+4B+e+WiYOUbFxzhhwT61kvY5RSZkWHvDUvEHnfIZZQT5S7fT7XzGwrxZqIztbWMI4q8PUmLF26ZAd1QQzL/KA7uPLVrPsDRzepXh2TP09Ynm1anrBU18oPYoMMg="; _fbc=fb.1.1665835564486.IwAR05PazNLe5IANImWjKrf8jvMibatu0W8u44KD4QCROUE4uwr_Z4NlfMb7Y; SPC_R_T_IV=eU1Zd3d5bUN6RXZKcHBWUQ==; SPC_SI=7qlHYwAAAABFSHp1YnpqWcA2HAAAAAAATEF5Y0pOZjg=; SPC_R_T_ID=pYBZuBaRxWu53AtpNv5ymR3hLyUWbKHGrmtHDtwqwMJ3aHT+4B+e+WiYOUbFxzhhwT61kvY5RSZkWHvDUvEHnfIZZQT5S7fT7XzGwrxZqIztbWMI4q8PUmLF26ZAd1QQzL/KA7uPLVrPsDRzepXh2TP09Ynm1anrBU18oPYoMMg=; _ga=GA1.1.262431808.1609680146; shopee_webUnique_ccd=TcUythqHAuxm%2FnRJphmHFA%3D%3D%7CGWHR72dQTqmBB1AgSgUbQ11bqBm80Qc6AXn6zSB75A5byNEtAyk%2BaDDPA9JnwdDiXbFGadIRfjCTC8fQr9m08Ag3URrLC0MdkHG%2B%7Cyk7ik%2BpLFTw9Mm4C%7C06%7C3; _ga_RPSBE3TQZZ=GS1.1.1665852394.34.1.1665853478.57.0.0; SPC_EC=Zm00TEVGcElScUtvdTFwSxPV0gtJjD/LSIhVLhOM15thMOkXDWZ85CNUnVV8+hBQCakDeqTQmXYBwBx8NOs+kQhJURP6K1Tlyqta6RcE82i6gHWU9D1wJU64hXrHh9OBxqy1q8kp+JiM8pJBlX03oWHoq6NRODb5/DNP9ekjZuY=',
  };
});

ipcMain.on("setTestUrlAndCookie", (e, testUrl, testCookie) => {
  const prevCookie = settings.getSync("testCookie");
  settings.setSync("key", {
    testUrl,
    testCookie,
  });
  if (testCookie !== prevCookie) {
    dialog.showMessageBox(null, {
      message: "Successfully reset the cookie",
    });
  }
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
