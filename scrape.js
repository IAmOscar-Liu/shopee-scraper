const puppeteer = require("puppeteer-core");
const fetch = require("isomorphic-fetch");
const { getItemIdAndShopId } = require("./getItemIdAndShopId");
const { scrapeMonthlySales } = require("./scrapeMonthlySales");
const os = require("os");
const fs = require("fs");

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

function getTWDate(ts) {
  const date = new Date(ts * 1000);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

async function getData({
  page,
  url,
  product_idx,
  win,
  cookie,
  classes: { titleClass, priceClass, shopClass, numberClass },
}) {
  win.webContents.send("receive_data", {
    product_idx,
    type: "start new product",
    msg: "scraping......",
    msgColor: "orange",
  });

  await page.goto(url);
  // await page.waitFor(2000); // 等待一秒
  await Promise.all([
    page.waitForSelector("." + titleClass), // 確定商品全名出現
    page.waitForSelector("." + priceClass), // 確定商品價格出現
    page.waitForSelector("." + numberClass), // 確定商品數量出現
  ]);

  // const data = await page.content();

  const title = await page.$eval(`.${titleClass} > span`, (el) => el.innerText);
  const price = await page.$eval(`.${priceClass}`, (el) => el.innerText);
  const number = await page.$eval("." + numberClass, (el) =>
    (el.innerText || "找不到").split(/\n/).pop()
  );

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

  // console.log("Production variation: ", productVariations);

  const buttons = await page.$$(".product-variation");
  for (let varIdx = 0; varIdx < productVariations.length; varIdx++) {
    const button = buttons[productVariations[varIdx].idx];

    await button.click();
    await waitFor(varIdx === 0 ? 250 : 100);

    productVariations[varIdx].price = await page.$eval(
      "." + priceClass,
      (el) => el.innerText || "找不到"
    );
    productVariations[varIdx].number = await page.$eval(
      "." + numberClass,
      (el) => (el.innerText || "找不到").split(/\n/).pop()
    );
  }

  win.webContents.send("receive_data", {
    product_idx,
    type: "find monthly sales",
    msg: "scraping monthly sales...",
    msgColor: "orange",
  });

  const { error: monthlySalesError, data: monthlySalesData } =
    await scrapeMonthlySales({ page, title, shopClass });

  win.webContents.send("receive_data", {
    product_idx,
    type: "item results",
    payload: {
      title,
      price,
      number,
      sales: monthlySalesError ? "找不到" : monthlySalesData.sales,
      variations: productVariations,
    },
    msg: "scraping shipping info...",
    msgColor: "orange",
  });

  const { shopid, itemid } = getItemIdAndShopId(url);
  const shippingRes = await fetch(
    `https://shopee.tw/api/v4/pdp/get_shipping?buyer_zipcode=&city=%E4%B8%AD%E6%AD%A3%E5%8D%80&district=&itemid=${itemid}&shopid=${shopid}&state=%E8%87%BA%E5%8C%97%E5%B8%82&town=`,
    {
      headers: { cookie },
    }
  );
  const shippingJson = await shippingRes.json();

  // console.log("shipping data ~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  // console.log(shippingJson);

  win.webContents.send("receive_data", {
    product_idx,
    type: "shipping info",
    payload: {
      hasFreeDelivery: shippingJson.data?.product_info?.free_shipping?.min_spend
        ? `免運費 滿$${
            shippingJson.data.product_info.free_shipping.min_spend / 100000
          }，免運費`
        : "",
      freeDeliveryDetails:
        shippingJson.data.ungrouped_channel_infos &&
        shippingJson.data.ungrouped_channel_infos.length > 0
          ? shippingJson.data.ungrouped_channel_infos
              .map((info, infoIdx) => ({
                id: infoIdx + 1,
                name: info.name,
                minFreeDelivery: info.channel_promotion_infos?.[0].min_spend
                  ? `，滿$${
                      info.channel_promotion_infos[0].min_spend / 100000
                    }，免運費`
                  : "",
                deliveryTime:
                  info.channel_delivery_info?.estimated_delivery_date_from &&
                  info.channel_delivery_info?.estimated_delivery_date_to
                    ? `，預計到貨時間${getTWDate(
                        info.channel_delivery_info.estimated_delivery_date_from
                      )} - ${getTWDate(
                        info.channel_delivery_info.estimated_delivery_date_from
                      )}`
                    : "",
                price:
                  info.min_price === info.max_price
                    ? "$" + info.min_price / 100000
                    : `$${info.min_price / 100000}-$${info.max_price / 100000}`,
              }))
              .map(
                (info) =>
                  `(${info.id}).${info.name} ${info.price}${info.deliveryTime}${info.minFreeDelivery}`
              )
              .join(" ")
          : "",
    },
    msg: "done",
    msgColor: "green",
  });
}

async function handleRequest({ _data, win, cookie, classes }) {
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
      // await getData(data["賣場網址"], data_idx, win, cookie);
      await getData({
        page,
        url: data["賣場網址"],
        product_idx: data_idx,
        win,
        cookie,
        classes,
      });
      await waitFor(500);
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
  await browser.close();
}

async function main({ data, cookie, win, classes }) {
  const dataWithIdx = data.map((d, data_idx) => ({ data_idx, data: d }));
  // console.log("main: ", classes);
  // console.log("main: ", cookie)

  await Promise.all([
    handleRequest({ _data: dataWithIdx, win, cookie, classes }),
    handleRequest({ _data: dataWithIdx, win, cookie, classes }),
    handleRequest({ _data: dataWithIdx, win, cookie, classes }),
  ]); // open 3 browser at the same time

  win.webContents.send("receive_data", {
    product_idx: 1000000,
    type: "done",
  });
}

module.exports = { scrape: main };

/*
    title: itemJson.data.name,
    price:
    number: 
    sales: 
    variations: {content, price, number}
*/
