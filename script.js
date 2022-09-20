async function preloadTitleAndPriceClass(
  productTitleInput,
  productPriceInput,
  productDeliverInput,
  productShopInput,
  productNumberInput
) {
  const { titleClass, priceClass, deliverClass, shopClass, numberClass } =
    await electron.api.getTitleAndPriceClass();
  productTitleInput.value = titleClass; //  "_2rQP1z"
  productPriceInput.value = priceClass; // "_2Shl1j"
  productDeliverInput.value = deliverClass; // "_3ihqr8"
  productShopInput.value = shopClass; //  "_2xDNx7"
  productNumberInput.value = numberClass; // "_283ldj"
}

function openBrowserWindow(e) {
  // console.log(e.target.dataset.url)
  electron.api.openBrowserWindow(e.target.dataset.url);
}

function printDataOnScreen(data) {
  downloadExcelFileButton.style.display = "none";
  document.querySelectorAll("ul li p.index span").forEach((span) => {
    span.removeEventListener("click", openBrowserWindow);
  });

  const ul = document.querySelector("ul");
  ul.innerHTML = `<li style="border-bottom: 1px solid black">
          <p class="title">商品名稱</p>
          <p class="monthly-sales">月銷量</p>
          <p class="delivery-keyword">免運費關鍵字</p>
          <p class="index">賣場編號</p>
          <p class="status">狀態</p>
  </li>`;

  data.forEach((d, i) => {
    const li = document.createElement("li");
    li.id = `index-${i}`;
    li.innerHTML = `
          <p class="title">${d["商品"] || "承上"}</p>
          <p class="monthly-sales"></p>
          <p class="delivery-keyword"></p>
          <p class="index"><span data-url="${d["賣場網址"]}">賣場${
      d["賣場編號"]
    }</span></p>
          <p class="status">waiting......</p>
        `;
    ul.appendChild(li);
  });
  document.querySelectorAll("ul li p.index span").forEach((span) => {
    span.addEventListener("click", openBrowserWindow);
  });
}

// const urls = [
//   "https://shopee.tw/%E3%80%90%E7%8F%BE%E8%B2%A8-%E5%85%8D%E9%81%8B%E8%B2%BB%EF%BC%81%E6%B6%BC%E6%84%9F%E7%9E%AC%E5%90%B8-%E6%B7%A8%E6%96%B0%E8%A1%9B%E7%94%9F%E6%A3%89%E3%80%91%E6%B6%BC%E6%84%9F%E8%A1%9B%E7%94%9F%E6%A3%89-%E6%97%A5%E7%94%A8-%E5%A4%9C%E7%94%A8-%E8%AD%B7%E5%A2%8A-%E5%8A%A0%E9%95%B7-%E9%87%8F%E5%B0%91-%E8%B6%85%E9%95%B7-%E9%80%8F%E6%B0%A3%E7%9E%AC%E5%90%B8-%E7%94%9F%E7%90%86%E6%9C%9F-%E8%A1%9B%E7%94%9F%E5%B7%BE-%E7%94%9F%E7%90%86%E7%94%A8%E5%93%81-i.4031525.18213552028?sp_atk=221b40d2-f48c-4027-af5d-b57ac4b1a71d&xptdk=221b40d2-f48c-4027-af5d-b57ac4b1a71d",
//   "https://shopee.tw/%E5%A5%BD%E8%87%AA%E5%9C%A8%E4%B9%BE%E7%88%BD%E7%9E%AC%E6%BD%94-%E7%B5%B2%E8%96%84%E8%AD%B7%E7%BF%BC%E6%97%A5%E7%94%A8%E8%A1%9B%E7%94%9F%E6%A3%89-24cmX52%E7%89%87%E3%80%90%E6%84%9B%E8%B2%B7%E3%80%91-i.19788054.1198519561?sp_atk=e63a84bb-8993-48dd-86e3-b0049dd6543e&xptdk=e63a84bb-8993-48dd-86e3-b0049dd6543e",
//   "https://shopee.tw/%E8%98%87%E8%8F%B2%E5%BD%88%E5%8A%9B%E8%B2%BC%E8%BA%AB%E8%B6%85%E8%96%84%E9%AB%94%E8%B2%BC%E8%A1%9B%E7%94%9F%E6%A3%89%E6%97%A5%E7%94%A823%E5%A4%9C%E7%94%A828%E7%AB%8B%E9%AB%94%E6%9F%94%E8%B2%BC%E9%98%B2%E6%BC%8F23%E9%87%8F%E5%B0%91%E5%9E%8B-17.5%E8%B6%85%E7%86%9F%E7%9D%A141.5-35-%E5%85%A7%E8%A4%B2%E5%9E%8B-%E8%8D%89%E6%9C%AC%E6%8A%91%E8%8F%8C-%E8%B6%85%E8%BC%95%E6%9F%94-i.21483839.471210895?sp_atk=c41b8e89-ecf6-4eb3-8635-d4f0d050e96d&xptdk=c41b8e89-ecf6-4eb3-8635-d4f0d050e96d",
// ];

const startScrapingButton = document.querySelector("button#start-scraping");
const downloadExcelFileButton = document.getElementById("download-excel-file");
const readExcelFileButton = document.getElementById("read-excel-file");
const readGoogleSheetButton = document.getElementById("read-google-sheet");

const productTitleInput = document.getElementById("product-name");
const productPriceInput = document.getElementById("product-price");
const productDeliverInput = document.getElementById("product-deliver");
const productShopInput = document.getElementById("product-shop");
const productNumberInput = document.getElementById("product-number");
preloadTitleAndPriceClass(
  productTitleInput,
  productPriceInput,
  productDeliverInput,
  productShopInput,
  productNumberInput
);

let writeData;
let data;

readExcelFileButton.addEventListener("click", async () => {
  const readExcelFileInfo = document.getElementById("read-excel-file-info");
  const readGoogleSheetInfo = document.getElementById("read-google-sheet-info");

  startScrapingButton.disabled = true;

  const { data: excelData, error } = await electron.api.readExcelFile();
  if (!excelData && !error) {
    return;
  } else if (!excelData) {
    readExcelFileInfo.innerText = error;
    readGoogleSheetInfo.innerText = "";
    readGoogleSheetInfo.style.display = "none";
    return;
  }

  // Assign new data
  data = excelData.readData;

  // After get excel data, reset screen
  printDataOnScreen(data);

  readExcelFileInfo.innerText = excelData.filePath;
  readGoogleSheetInfo.innerText = "";
  readGoogleSheetInfo.style.display = "none";
  startScrapingButton.disabled = false;
});

readGoogleSheetButton.addEventListener("click", async () => {
  const googleSheetUrlValue = document.getElementById(
    "google-sheet-url-input"
  ).value;
  if (googleSheetUrlValue === "") return;

  const readExcelFileInfo = document.getElementById("read-excel-file-info");
  const readGoogleSheetInfo = document.getElementById("read-google-sheet-info");

  startScrapingButton.disabled = true;
  readGoogleSheetInfo.innerText = "Fetching google sheet data......";
  readGoogleSheetInfo.style.display = "block";

  const { data: excelData, error } = await electron.api.readGoogleSheet(
    googleSheetUrlValue
  );
  if (!excelData && !error) {
    return;
  } else if (!excelData) {
    readGoogleSheetInfo.innerText = error;
    return;
  }

  // Assign new data
  data = excelData.readData;

  // After get excel data, reset screen
  printDataOnScreen(data);

  readExcelFileInfo.innerText = "";
  readGoogleSheetInfo.innerText = "";
  readGoogleSheetInfo.style.display = "none";
  startScrapingButton.disabled = false;
});

document
  .getElementById("reset-name-and-price")
  .addEventListener("click", () => {
    electron.api.setTitleAndPriceClass(
      productTitleInput.value,
      productPriceInput.value,
      productDeliverInput.value,
      productShopInput.value,
      productNumberInput.value
    );
  });

startScrapingButton.addEventListener("click", (e) => {
  e.target.disabled = true;
  readExcelFileButton.disabled = true;
  readGoogleSheetButton.disabled = true;
  electron.api.startScraping("api_start_scraping", {
    data,
    titleClass: productTitleInput.value,
    priceClass: productPriceInput.value,
    deliverClass: productDeliverInput.value,
    shopClass: productShopInput.value,
    numberClass: productNumberInput.value,
  });
});

downloadExcelFileButton.addEventListener("click", () => {
  electron.api.downloadExcelFile(writeData);
});

electron.api.on("receive_data", (receiveData) => {
  // console.log(receiveData);
  const el = document.querySelector(
    `#index-${receiveData.product_idx} p.status`
  );

  if (
    receiveData.type === "start new product" ||
    receiveData.type === "title & price" ||
    receiveData.type === "variation" ||
    receiveData.type === "monthly sales"
  ) {
    if (receiveData.type === "title & price") {
      data[receiveData.product_idx]["商品全名"] = receiveData.payload.title;
      data[receiveData.product_idx]["商品價格"] = receiveData.payload.price;
      data[receiveData.product_idx]["免運費關鍵字"] =
        receiveData.payload.hasFreeDelivery;
      data[receiveData.product_idx]["免運費細節"] =
        receiveData.payload.freeDeliveryDetails;
    } else if (receiveData.type === "variation") {
      if (!data[receiveData.product_idx]["variation"])
        data[receiveData.product_idx]["variation"] = [];

      data[receiveData.product_idx]["variation"].push({
        varIdx: receiveData.payload.varIdx,
        content: receiveData.payload.content,
        price: receiveData.payload.price,
        number: receiveData.payload.number,
      });
    } else if (receiveData.type === "monthly sales") {
      console.log("monthly sales", receiveData);
      data[receiveData.product_idx]["monthly_sales"] =
        receiveData.payload.sales;
    }

    if (el.innerText !== "error") {
      el.innerText = receiveData.msg;
      el.style.color = receiveData.msgColor || "black";
    }
  } else if (receiveData.type === "error") {
    console.log("receiveData error", receiveData);
    data[receiveData.product_idx]["商品全名"] = "無法找到商品全名";
    data[receiveData.product_idx]["商品價格"] = "無法找到商品價格";
    el.innerText = "error";
    el.style.color = receiveData.msgColor || "black";
  } else if (receiveData.type === "done") {
    console.log("finish scraping......");
    console.log(data);
    readExcelFileButton.disabled = false;
    readGoogleSheetButton.disabled = false;
    writeData = data.map((d) => {
      const newRow = {
        商品: d["商品"] || "",
        賣場編號: d["賣場編號"] || "",
        賣場網址: d["賣場網址"] || "",
        商品全名: d["商品全名"] || "",
        免運費關鍵字: d["免運費關鍵字"] || "",
        免運費細節: d["免運費細節"] || "",
        商品價格: d["商品價格"] || "",
        月銷量: d["monthly_sales"] || "找不到",
      };
      if (d.variation && d.variation.length > 0) {
        for (let vIdx = 0; vIdx < d.variation.length; vIdx++) {
          newRow[`規格${vIdx + 1}`] = d.variation[vIdx].content;
          newRow[`規格${vIdx + 1}價錢`] = d.variation[vIdx].price;
          newRow[`規格${vIdx + 1}庫存`] = d.variation[vIdx].number;
        }
      }
      return newRow;
    });
    console.log(writeData);
    if (writeData && writeData.length > 0) {
      downloadExcelFileButton.style.display = "block";
      document.querySelectorAll("ul li").forEach((li) => {
        if (!li.id) return;
        const liIdx = li.id.replace("index-", "");
        const pStatus = li.querySelector("p.status");
        const pMonthlySales = li.querySelector("p.monthly-sales");
        const pDeliveryKeyword = li.querySelector("p.delivery-keyword");
        if (pStatus.innerText !== "error") {
          pMonthlySales.innerHTML = data[liIdx]["monthly_sales"];
          pDeliveryKeyword.innerHTML = data[liIdx]["免運費關鍵字"];
          pStatus.innerHTML = `<span style="color: green">done</span><span style="margin-left: 12px">Detail</span>`;
          li.querySelector("p.status span:last-of-type").onclick = function () {
            // console.log(data[liIdx]);
            electron.api.openModal(data[liIdx]);
          };
        }
      });
    }
  }
});
