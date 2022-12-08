const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
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
    url: settings.hasSync("key.testUrl")
      ? settings.getSync("key.testUrl")
      : "https://shopee.tw/%E8%98%87%E8%8F%B2%E8%B6%85%E7%86%9F%E7%9D%A141.5%E5%85%AC%E5%88%86%E4%B9%BE%E7%88%BD%E7%B6%B2%E5%B1%A4-%E7%B4%B0%E7%B7%BB%E6%A3%89%E6%9F%94-i.15828725.4248457236?sp_atk=9b2e92bf-0943-46a7-b3f9-4fabe5cfc074&fbclid=IwAR1UBWR0TQbzU9IZulcUoyoPz87ftlub2MhNXIZEMufA7nVGejFwdobz-aY",
    cookie: settings.hasSync("key.testCookie")
      ? settings.getSync("key.testCookie")
      : 'SPC_IA=-1; REC_T_ID=b6d127e7-4dc6-11eb-b3a7-48df37dda188; SPC_F=qqwFoYS6n5PBnhnQXfdXvdt7PjsUu013; REC_T_ID=b6dee5e2-4dc6-11eb-a739-b49691869054; __BWfp=c1609680145873xa5b751f2b; SC_DFP=PlCVGVdHlUVblnerGeox91eHcyd4pe6R; _fbp=fb.1.1658984790577.1140682313; csrftoken=hE7WvBpeWMNedDOXFB14vlc4bpNbIo8N; _QPWSDCXHZQA=b7bc575e-1465-46bc-87f7-4632e58aeafb; __LOCALE__null=TW; G_ENABLED_IDPS=google; G_AUTHUSER_H=0; SPC_CLIENTID=cXF3Rm9ZUzZuNVBCezosvjzoernjcmtf; SPC_T_IV="eU1Zd3d5bUN6RXZKcHBWUQ=="; SPC_T_ID="pYBZuBaRxWu53AtpNv5ymR3hLyUWbKHGrmtHDtwqwMJ3aHT+4B+e+WiYOUbFxzhhwT61kvY5RSZkWHvDUvEHnfIZZQT5S7fT7XzGwrxZqIztbWMI4q8PUmLF26ZAd1QQzL/KA7uPLVrPsDRzepXh2TP09Ynm1anrBU18oPYoMMg="; _fbc=fb.1.1665901682861.IwAR1UBWR0TQbzU9IZulcUoyoPz87ftlub2MhNXIZEMufA7nVGejFwdobz-aY; _gcl_au=1.1.1737244136.1667138053; SPC_SI=Mrh0YwAAAABKWWhhZ2RKdQIGMQQAAAAAUXN3V0tXRkQ=; _gid=GA1.2.840462054.1670509545; SPC_ST=.M0tQUXpYSzJNcHJPMldQYcl3axXvvUHzzwHCFzYMJvC4fVNhnVOzMavmCX0aQ0wxcKP4X03BlMzgUaZV37hgrdamna5sOHVw4vABE/t7vNcEssAkPfF6XRoZQB05mP+luO3RXv7jJ1YZvesWCTjhDNC0OnG4ZfVou7FHdbN9ue/TT/LeluxCrLFTP2+KKD7Zxr/hrJJX79MEdp0uN+9bSg==; _ga_CGXK257VSB=GS1.1.1670509970.2.0.1670509970.60.0.0; SPC_U=883910780; SPC_T_IV=bnNsZkREUGlwSDNaQmYzZA==; SPC_R_T_ID=qraidqzNQkjEoAaY1xSBFCTJoiZvGOG+6ekaJ+VlMTCXVv/tcX7aC0rzoAG3lseWL6wiJB4ZFvxLGKbcdlH43uner2RZV8VcrwDPW1jdWX/GBxuxkgDyDDIX49gC+2GmIVy/z0c64GanetrIeBXOGJrl9TrL/FuVXjLQTInY8qM=; SPC_R_T_IV=bnNsZkREUGlwSDNaQmYzZA==; SPC_T_ID=qraidqzNQkjEoAaY1xSBFCTJoiZvGOG+6ekaJ+VlMTCXVv/tcX7aC0rzoAG3lseWL6wiJB4ZFvxLGKbcdlH43uner2RZV8VcrwDPW1jdWX/GBxuxkgDyDDIX49gC+2GmIVy/z0c64GanetrIeBXOGJrl9TrL/FuVXjLQTInY8qM=; _ga=GA1.2.262431808.1609680146; shopee_webUnique_ccd=SERl1HmWmwKjVyImBHvrmg%3D%3D%7CzwB1NGTQQ6uw7imojqWILffBYMmkoDLMDyUcwrLQ5m4%2F1iqPWXRFNymdkt9mSLKLh02sdD1aIsXaedEK2d4YL9Y2lT3xH6f4Khlw%7CFOCY3n7vnKxBUC1c%7C06%7C3; ds=3708ffde4ee7982b0fd821ea34447698; cto_bundle=oMa4Bl9JeU5qWXpRUVJPaE9qRW9nYWRiUVlxcGF0dGtHJTJGWnBwRm9xc28zY2ZScHdaT2ZxOTgxSlRJakhuYVRUeElXdlZUMVElMkZ0a0FQbjNzbGo3STIlMkZUNGM4V045cTAzQW1hQWoycmxTalVmJTJCN1VRU1hkJTJGamlwcUJKYXRyNkRCcW5Zbjd1RzYzVWQ3JTJCbEZGc2c1Z0xGUzVESUElM0QlM0Q; _ga_RPSBE3TQZZ=GS1.1.1670520059.47.1.1670520061.58.0.0; SPC_EC=SklsejdQOG1hWkViMk11as32HFS3nXJWFUefyWAjPQ598D+mHJy8c3UdxXeM6Pax4hvyUvcA4CWRCBa8K1syDJmHIuu/nUEk92Y94DfzqZX2Ft39+pxRu8wGp6dZOZdmrGH06M2L4A/ffv1cHpHiuAhzA86Pq+I8+RvK9JH23UQ=',
  };
});

ipcMain.on("setTestUrlAndCookie", (e, testUrl, testCookie) => {
  const prevCookie = settings.getSync("key.testCookie");

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

ipcMain.handle("getElementClasses", (e) => {
  const data = {
    titleClass: settings.hasSync("key.titleClass")
      ? settings.getSync("key.titleClass")
      : "YPqix5",
    priceClass: settings.hasSync("key.priceClass")
      ? settings.getSync("key.priceClass")
      : "X0xUb5",
    numberClass: settings.hasSync("key.numberClass")
      ? settings.getSync("key.numberClass")
      : "MZzIOI",
    shopClass: settings.hasSync("key.shopClass")
      ? settings.getSync("key.shopClass")
      : "U6HLpM",
  };
  return data;
});

ipcMain.on(
  "setElementClasses",
  async (e, { titleClass, priceClass, numberClass, shopClass }) => {
    settings.setSync("key", { titleClass, priceClass, numberClass, shopClass });

    dialog.showMessageBox(null, {
      message: "Successfully reset all classes",
    });
  }
);

ipcMain.on("api_start_scraping", async (e, { data, cookie, classes }) => {
  // console.log(`data received in main: ${data}`);
  if (isScraping || win === null)
    return console.log("scraping, please wait......");

  isScraping = true;
  // await scrape(data, win);
  await scrape({ data, cookie, win, classes });
  isScraping = false;
  console.log("done");
});

ipcMain.on("openBrowserWindow", (e, url) => {
  // console.log(url);
  shell.openExternal(url);
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
