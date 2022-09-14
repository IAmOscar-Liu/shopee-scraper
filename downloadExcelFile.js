const reader = require("xlsx");

const downloadExcelFile = (writeData, downloadPath) => {
  const json_to_sheet = reader.utils.json_to_sheet(writeData);
  const newFile = reader.utils.book_new();
  reader.utils.book_append_sheet(newFile, json_to_sheet, "Sheet 1");
  reader.writeFile(newFile, downloadPath);
};

module.exports = { downloadExcelFile };
