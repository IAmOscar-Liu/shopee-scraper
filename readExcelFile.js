const reader = require("xlsx");

const readExcelFile = (filePath, dialog) => {
  // Reading our test file
  const file = reader.readFile(filePath);

  const readData = [];

  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);

    temp.forEach((res) => {
      const keys = Object.keys(res);
      if (
        !keys.includes("商品") ||
        !keys.find((k) => k.startsWith("被貫破賣場"))
      )
        return;

      keys
        .filter((k) => k.startsWith("被貫破賣場"))
        .forEach((shopUrl, urlIdx) => {
          readData.push({
            商品: urlIdx === 0 ? res["商品"] : "",
            賣場編號: urlIdx + 1,
            賣場網址: res[shopUrl],
          });
        });
    });
  }

  if (readData.length === 0) {
    dialog.showMessageBoxSync(null, {
      type: "error",
      message: "Cannot find any products in this file",
    });
    return { data: null, error: "Cannot find any products in this file" };
  }
  return {
    data: {
      readData,
      filePath,
    },
    error: null,
  };
};

module.exports = { readExcelFile };
