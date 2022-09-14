const { GoogleSpreadsheet } = require("google-spreadsheet");

const getDocID = (url) => {
  const match = url.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\//);
  if (!match) return ["Incorrect google sheet url", ""];

  return ["", url.slice(match[0].length).split("/")[0]];
};

const getData = async ({
  docID,
  sheetID = "0",
  credentialsPath = "./credentials.json",
}) => {
  const readData = [];
  let productNameIdx, shouldScrapeIdx;
  const urlIdxes = [];

  const doc = new GoogleSpreadsheet(docID);
  const creds = require(credentialsPath);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsById[sheetID];

  await sheet.loadCells("A1:AZ1");
  // console.log(sheet.cellStats);
  for (let i = 0; i < sheet.cellStats.loaded; i++) {
    if (!sheet.getCell(0, i)._rawData.formattedValue) {
      continue;
    } else if (
      sheet.getCell(0, i)._rawData.formattedValue.startsWith("是否爬蟲")
    ) {
      shouldScrapeIdx = i;
    } else if (sheet.getCell(0, i)._rawData.formattedValue === "商品") {
      productNameIdx = i;
    } else if (
      sheet.getCell(0, i)._rawData.formattedValue.startsWith("被貫破賣場")
    ) {
      urlIdxes.push(i);
    }
  }
  // console.log(productNameIdx, urlIdxes, shouldScrapeIdx);

  const rows = await sheet.getRows();
  for (let row of rows) {
    const rawData = row._rawData;
    if (
      /是|yes|true/i.test(rawData[shouldScrapeIdx] || "") &&
      rawData[productNameIdx] &&
      urlIdxes
        .map((idx) => rawData[idx])
        .some((url) => typeof url === "string" && url.startsWith("https://"))
    ) {
      const productName = rawData[productNameIdx];
      const productUrls = urlIdxes
        .map((idx) => rawData[idx])
        .filter((url) => typeof url === "string" && url.startsWith("https://"));
      productUrls.forEach((url, uIdx) => {
        readData.push({
          商品: uIdx === 0 ? productName : "",
          賣場編號: uIdx + 1,
          賣場網址: url,
        });
      });
    }
  }
  return readData;
};

const readGoogleSheet = async (googleSheetUrl, dialog) => {
  const [error, docID] = getDocID(googleSheetUrl);
  if (error) {
    dialog.showMessageBoxSync(null, {
      type: "error",
      message: error,
    });
    return { data: null, error };
  }

  try {
    const readData = await getData({ docID });

    if (readData.length === 0) {
      dialog.showMessageBoxSync(null, {
        type: "error",
        message: "Cannot find any products in this google sheet",
      });
      return {
        data: null,
        error: "Cannot find any products in this google sheet",
      };
    }

    return {
      data: {
        readData,
        filePath: googleSheetUrl,
      },
      error: null,
    };
  } catch (err) {
    dialog.showMessageBoxSync(null, {
      type: "error",
      message: "Sorry! This google sheet can't be read.",
    });
    return { data: null, error: err.message };
  }
};

module.exports = { readGoogleSheet };
