const puppeteer = require("puppeteer-core");
const { scrapeMonthlySales } = require("./scrapeMonthlySales");
const os = require("os");
const fs = require("fs");

// console.log(os.platform());

// const urls = [
//   "https://shopee.tw/%E3%80%90%E7%8F%BE%E8%B2%A8-%E5%85%8D%E9%81%8B%E8%B2%BB%EF%BC%81%E6%B6%BC%E6%84%9F%E7%9E%AC%E5%90%B8-%E6%B7%A8%E6%96%B0%E8%A1%9B%E7%94%9F%E6%A3%89%E3%80%91%E6%B6%BC%E6%84%9F%E8%A1%9B%E7%94%9F%E6%A3%89-%E6%97%A5%E7%94%A8-%E5%A4%9C%E7%94%A8-%E8%AD%B7%E5%A2%8A-%E5%8A%A0%E9%95%B7-%E9%87%8F%E5%B0%91-%E8%B6%85%E9%95%B7-%E9%80%8F%E6%B0%A3%E7%9E%AC%E5%90%B8-%E7%94%9F%E7%90%86%E6%9C%9F-%E8%A1%9B%E7%94%9F%E5%B7%BE-%E7%94%9F%E7%90%86%E7%94%A8%E5%93%81-i.4031525.18213552028?sp_atk=221b40d2-f48c-4027-af5d-b57ac4b1a71d&xptdk=221b40d2-f48c-4027-af5d-b57ac4b1a71d",
//   "https://shopee.tw/%E5%A5%BD%E8%87%AA%E5%9C%A8%E4%B9%BE%E7%88%BD%E7%9E%AC%E6%BD%94-%E7%B5%B2%E8%96%84%E8%AD%B7%E7%BF%BC%E6%97%A5%E7%94%A8%E8%A1%9B%E7%94%9F%E6%A3%89-24cmX52%E7%89%87%E3%80%90%E6%84%9B%E8%B2%B7%E3%80%91-i.19788054.1198519561?sp_atk=e63a84bb-8993-48dd-86e3-b0049dd6543e&xptdk=e63a84bb-8993-48dd-86e3-b0049dd6543e",
//   "https://shopee.tw/%E8%98%87%E8%8F%B2%E5%BD%88%E5%8A%9B%E8%B2%BC%E8%BA%AB%E8%B6%85%E8%96%84%E9%AB%94%E8%B2%BC%E8%A1%9B%E7%94%9F%E6%A3%89%E6%97%A5%E7%94%A823%E5%A4%9C%E7%94%A828%E7%AB%8B%E9%AB%94%E6%9F%94%E8%B2%BC%E9%98%B2%E6%BC%8F23%E9%87%8F%E5%B0%91%E5%9E%8B-17.5%E8%B6%85%E7%86%9F%E7%9D%A141.5-35-%E5%85%A7%E8%A4%B2%E5%9E%8B-%E8%8D%89%E6%9C%AC%E6%8A%91%E8%8F%8C-%E8%B6%85%E8%BC%95%E6%9F%94-i.21483839.471210895?sp_atk=c41b8e89-ecf6-4eb3-8635-d4f0d050e96d&xptdk=c41b8e89-ecf6-4eb3-8635-d4f0d050e96d",
// ];

function getChromeExeFilePath() {
  const defaultPath =
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

  if (fs.existsSync(defaultPath)) return defaultPath;
  return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
}

function waitFor(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), time);
  });
}

async function getData(
  page,
  url,
  product_idx,
  win,
  titleClass,
  priceClass,
  deliverClass,
  shopClass,
  numberClass
) {
  win.webContents.send("receive_data", {
    product_idx,
    type: "start new product",
    msg: "scraping......",
    msgColor: "orange",
  });

  await page.goto(url);
  // await page.waitFor(2000); // 等待一秒
  await page.waitForSelector("." + titleClass); // 確定商品全名出現
  await page.waitForSelector("." + priceClass); // 確定商品價格出現
  await page.waitForSelector("." + deliverClass); // 確定商品運費出現
  await page.waitForSelector("." + numberClass); // 確定商品數量出現

  // const data = await page.content();

  const title = await page.$eval(`.${titleClass} > span`, (el) => el.innerText);
  const price = await page.$eval(`.${priceClass}`, (el) => el.innerText);

  // 檢查運費
  const hasFreeDelivery = await page.$eval("." + deliverClass, (el) => {
    if (!el.childNodes) return "";
    if (el.childNodes.length < 2) return "";

    let returnStrArr = [];
    for (
      let childNodeIdx = 0;
      childNodeIdx < el.childNodes.length - 1;
      childNodeIdx++
    ) {
      returnStrArr.push(
        (el.childNodes[childNodeIdx].innerText || "").replaceAll(/\n/g, " ")
      );
    }
    return returnStrArr.join(" ");
  });
  let freeDeliveryDetails = "";
  const deliverDetailHoverJSPath = `.${deliverClass} > *:last-child > *:last-child > *:last-child > *:last-child > *`;
  // const deliverDetailPopupJSPath = ".shopee-drawer__contents > div > *";
  const deliverDetailPopupJSPath =
    deliverDetailHoverJSPath + " > *:last-child > div > *";
  if (hasFreeDelivery && page.$(deliverDetailHoverJSPath)) {
    await page.hover(deliverDetailHoverJSPath);
    await waitFor(200);
    if (page.$(deliverDetailPopupJSPath)) {
      const deliverDetails = await page.$$eval(
        deliverDetailPopupJSPath,
        (cards) => cards.map((c) => c.innerText || "")
      );
      freeDeliveryDetails = deliverDetails
        .filter((c) => !!c)
        .map((c, cIdx) => `(${cIdx + 1}). ${c.replaceAll(/\n/g, " ")}`)
        .join(" ");
    }
    await page.mouse.move(10, 10); // 把滑鼠移開以免點不到variation的按鈕
  }
  // hasFreeDelivery, freeDeliveryDetails

  const productVariations = await page.$$eval(
    ".product-variation",
    (variations) =>
      variations
        .map((variation, idx) => ({
          idx,
          content: variation.textContent,
          disabled: variation.getAttribute("aria-disabled"),
        }))
        .filter((variation) => variation.disabled === "false")
  );

  // console.log("variations");
  // console.log(productVariations);

  win.webContents.send("receive_data", {
    product_idx,
    type: "title & price",
    payload: {
      title,
      price,
      hasFreeDelivery,
      freeDeliveryDetails,
    },
    msg:
      productVariations && productVariations.length > 0
        ? `scraping for variation 1/${productVariations.length}`
        : "scraping monthly sales",
    msgColor: "orange",
  });

  await waitFor(300);

  if (!productVariations || productVariations.length === 0) {
    await scrapeMonthlySales(product_idx, win, page, title, shopClass);
    return;
  }

  for (let varIdx = 0; varIdx < productVariations.length; varIdx++) {
    const variation = productVariations[varIdx];
    const variationButtons = await page.$$(".product-variation");
    await variationButtons[variation.idx].click();
    //await page.click(`.product-variation:nth-of-type(${variation.idx + 1})`);
    await waitFor(varIdx === 0 ? 250 : 100);
    const variationPrice = await page.$eval(
      "." + priceClass,
      (el) => el.innerText
    );
    const variationNumber = await page.$eval(
      "." + numberClass,
      (el) => el.innerText || ""
    );
    // console.log("  " + variation.content + ": " + variationPrice);
    win.webContents.send("receive_data", {
      product_idx,
      type: "variation",
      payload: {
        varIdx,
        content: variation.content,
        price: variationPrice,
        number:
          variationNumber.split(/\n/).find((c) => c.includes("還剩")) ||
          "未知數量",
      },
      msg:
        varIdx + 1 === productVariations.length
          ? "scraping for monthly sales"
          : `scraping for variation ${varIdx + 2}/${productVariations.length}`,
      msgColor: "orange",
    });

    await waitFor(100);
  }

  await scrapeMonthlySales(product_idx, win, page, title, shopClass);
}

async function handleBrowser(
  _data,
  win,
  titleClass,
  priceClass,
  deliverClass,
  shopClass,
  numberClass
) {
  if (_data.length === 0 || win === null) return;

  const browser = await puppeteer.launch({
    executablePath:
      os.platform() === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : getChromeExeFilePath(),
    headless: true, // 無外殼的 Chrome，有更佳的效能
  });

  await browser
    .defaultBrowserContext()
    .overridePermissions("https://shopee.tw/", ["geolocation"]);

  const page = await browser.newPage();

  while (_data.length > 0 && win !== null) {
    const { data, data_idx } = _data.shift();
    try {
      await getData(
        page,
        data["賣場網址"],
        data_idx,
        win,
        titleClass,
        priceClass,
        deliverClass,
        shopClass,
        numberClass
      );
      // await waitFor(500);
    } catch (e) {
      win.webContents.send("receive_data", {
        product_idx: data_idx,
        type: "error",
        payload: {
          errMsg: e.message,
          url: data["賣場網址"],
        },
        msg: "error",
        msgColor: "red",
      });
    }
  }
  browser.close();
}

async function main(
  { data, titleClass, priceClass, deliverClass, shopClass, numberClass },
  win
) {
  const dataWithIdx = data.map((d, data_idx) => ({ data_idx, data: d }));
  await Promise.all([
    handleBrowser(
      dataWithIdx,
      win,
      titleClass,
      priceClass,
      deliverClass,
      shopClass,
      numberClass
    ),
    handleBrowser(
      dataWithIdx,
      win,
      titleClass,
      priceClass,
      deliverClass,
      shopClass,
      numberClass
    ),
    handleBrowser(
      dataWithIdx,
      win,
      titleClass,
      priceClass,
      deliverClass,
      shopClass,
      numberClass
    ),
  ]); // open 3 browser at the same time

  win.webContents.send("receive_data", {
    product_idx: 1000000,
    type: "done",
  });
  // browser.close();
}

// main();
module.exports = { scrape: main };
