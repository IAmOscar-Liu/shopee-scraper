function getItemIdAndShopId(url) {
  const firstPart = url.split("?")[0];

  const itemIdAndShopId = firstPart.split("-i")[1];
  if (!itemIdAndShopId) throw "Invalid url";

  const ansArr = itemIdAndShopId.slice(1).split(".");
  if (ansArr.length !== 2) throw "Invalid url";
  return {
    shopid: ansArr[0],
    itemid: ansArr[1],
  };
}

function updateHowToGetCookie(howToGetCookie, shopid, itemid) {
  const apiUrl = `https://shopee.tw/api/v4/pdp/get_shipping?buyer_zipcode=&city=%E4%B8%AD%E6%AD%A3%E5%8D%80&district=&itemid=${itemid}&shopid=${shopid}&state=%E8%87%BA%E5%8C%97%E5%B8%82&town=`;
  howToGetCookie.innerHTML = `
      請先確定登入蝦皮帳戶，再到下面網址<br/>
      <span style="cursor: pointer; color: blue; text-decoration: underline; white-space: nowrap; overflow: hidden; display: block; text-overflow: ellipsis;">${apiUrl}</span>
      然後按ctrl + shift + i開啟DevTools<br/>
      1. 在DevTools中選擇Network，按F5重新整理一次<br/>
      2. 在Network的Filter欄位輸入get_shipping，然後點選filter後的唯一一筆資料，右邊跳出來的視窗選Headers<br/>
      3. 在Headers中找到Request Headers，然後複製裡面cookie的內容<br/>
      4. 最後，把複製的結果貼到下面的Request Cookie裡面，再按「重設」
    `;
  howToGetCookie.querySelector("span").onclick = function () {
    electron.api.openBrowserWindow(apiUrl);
  };
}

async function preloadTestUrlAndCookie(
  requestUrlInput,
  requestCookieInput,
  howToGetCookie
) {
  const { url, cookie } = await electron.api.getTestUrlAndCookie();
  requestUrlInput.value = url;
  requestCookieInput.value = cookie;

  try {
    const { shopid, itemid } = getItemIdAndShopId(url);
    updateHowToGetCookie(howToGetCookie, shopid, itemid);
  } catch (e) {
    howToGetCookie.innerText = e.message;
  }
}

async function preloadElementClasses({
  productTitleInput,
  productPriceInput,
  productNumberInput,
  productShopInput,
}) {
  const { titleClass, priceClass, numberClass, shopClass } =
    await electron.api.getElementClasses();
  productTitleInput.value = titleClass;
  productPriceInput.value = priceClass;
  productNumberInput.value = numberClass;
  productShopInput.value = shopClass;
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

const requestUrlInput = document.getElementById("request-url");
const requestCookieInput = document.getElementById("request-cookie");
const howToGetCookie = document.getElementById("how-to-get-cookie");
preloadTestUrlAndCookie(requestUrlInput, requestCookieInput, howToGetCookie);

const productTitleInput = document.getElementById("product-name");
const productPriceInput = document.getElementById("product-price");
const productNumberInput = document.getElementById("product-number");
const productShopInput = document.getElementById("product-shop");
preloadElementClasses({
  productTitleInput,
  productPriceInput,
  productShopInput,
  productNumberInput,
});

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

document.getElementById("reset-all-classes").addEventListener("click", () => {
  electron.api.setElementClasses({
    titleClass: productTitleInput.value,
    priceClass: productPriceInput.value,
    numberClass: productNumberInput.value,
    shopClass: productShopInput.value,
  });
});

document.getElementById("reset-url").addEventListener("click", () => {
  electron.api.setTestUrlAndCookie(
    requestUrlInput.value,
    requestCookieInput.value
  );
  try {
    const { shopid, itemid } = getItemIdAndShopId(requestUrlInput.value);
    updateHowToGetCookie(howToGetCookie, shopid, itemid);
  } catch (e) {
    howToGetCookie.innerText = e.message;
  }
});

document.getElementById("reset-cookie").addEventListener("click", () => {
  electron.api.setTestUrlAndCookie(
    requestUrlInput.value,
    requestCookieInput.value
  );
});

startScrapingButton.addEventListener("click", (e) => {
  e.target.disabled = true;
  readExcelFileButton.disabled = true;
  readGoogleSheetButton.disabled = true;
  electron.api.startScraping("api_start_scraping", {
    data,
    cookie: requestCookieInput.value,
    classes: {
      titleClass: productTitleInput.value,
      priceClass: productPriceInput.value,
      numberClass: productNumberInput.value,
      shopClass: productShopInput.value,
    },
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
    [
      "start new product",
      "find monthly sales",
      "item results",
      "shipping info",
    ].includes(receiveData.type)
  ) {
    if (receiveData.type === "item results") {
      data[receiveData.product_idx]["商品全名"] = receiveData.payload.title;
      data[receiveData.product_idx]["商品價格"] = receiveData.payload.price;
      data[receiveData.product_idx]["月銷量"] = receiveData.payload.sales;
      data[receiveData.product_idx]["商品庫存"] = receiveData.payload.number;
      data[receiveData.product_idx]["variation"] =
        receiveData.payload.variations;
    } else if (receiveData.type === "shipping info") {
      data[receiveData.product_idx]["免運費關鍵字"] =
        receiveData.payload.hasFreeDelivery;
      data[receiveData.product_idx]["免運費細節"] =
        receiveData.payload.freeDeliveryDetails;
    }

    if (el.innerText !== "error") {
      el.innerText = receiveData.msg;
      el.style.color = receiveData.msgColor || "black";
    }
  } else if (receiveData.type === "error") {
    console.log("receiveData error", receiveData);
    if (!data[receiveData.product_idx]["商品全名"]) {
      data[receiveData.product_idx]["商品全名"] = "無法找到商品全名";
      data[receiveData.product_idx]["商品價格"] = "無法找到商品價格";
    }
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
        月銷量: d["月銷量"] || "找不到",
        總庫存: d["商品庫存"] || "找不到",
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
          pMonthlySales.innerHTML = data[liIdx]["月銷量"];
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
