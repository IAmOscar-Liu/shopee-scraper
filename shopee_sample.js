const puppeteer = require("puppeteer");
const os = require("os");

const singlePage = async (url, title, page) => {
  //   const url =
  //     "https://shopee.tw/Sofy-%E8%98%87%E8%8F%B2-%E5%BD%88%E5%8A%9B%E8%B2%BC%E8%BA%AB%E3%80%81%E5%B0%91%E9%87%8F%E3%80%81%E6%97%A5%E7%94%A8%E3%80%81%E5%A4%9C%E7%94%A8%E3%80%9017.5cm%E3%80%8123cm%E3%80%8128cm%E3%80%91%E8%A1%9B%E7%94%9F%E6%A3%89-i.5065357.9760271201?sp_atk=4646a15c-7e59-47a9-9853-e3999d7f491d";

  console.log("start");

  //   page.on("dialog", async (dialog) => {
  //     console.log(dialog.message());
  //     await dialog.accept();
  //   });

  await page.goto(url, { waitUntil: "networkidle2" });
  // await page.waitFor(2000); // 等待一秒
  //   await page.waitForSelector("." + titleClass); // 確定商品全名出現
  //   await page.waitForSelector("." + priceClass); // 確定商品價格出現
  //   await page.waitForSelector("." + deliverClass); // 確定運費出現

  if (await page.$("._2xDNx7 > a")) {
    const aLink = await page.$eval("._2xDNx7 > a", (a) => a.href);
    // console.log(aLink);
    await page.goto(aLink);
    await page.waitForSelector("form input");
    await page.type(
      "form input",
      title
    );
    await page.keyboard.press("Enter");
    console.log("after pressing enter");

    // await new Promise.all([
    //   await page.setGeolocation({ latitude: 25.027984, longitude: 121.586264 }),
    //   await page.waitForNavigation(),
    // ]);

    const itemPath = ".shopee-search-item-result__item";

    await page.waitForSelector(itemPath);

    console.log("after navigation");
    const sortBySalesBtn = await page.$(
      ".shopee-sort-by-options > *:nth-of-type(3)"
    );

    if (sortBySalesBtn) {
      await sortBySalesBtn.click();

      // await page.waitForNavigation();

      //   await new Promise.all([
      //     await page.setGeolocation({
      //       latitude: 25.027984,
      //       longitude: 121.586264,
      //     }),
      //     await page.waitForNavigation(),
      //   ]);

      await page.waitForSelector(itemPath);

      console.log("sort by sales");

      const salesResults = await page.$$(itemPath);
      if (salesResults.length > 0) {
        const monthlySales = await page.$$eval(
          ".shopee-search-item-result__item",
          (items) => items[0].innerText
        );
        console.log("monthSales: ", monthlySales);
      }
    }
  }

  // browser.close();
};

const main = async () => {
  const urls = [
    "https://shopee.tw/Sofy-%E8%98%87%E8%8F%B2-%E5%BD%88%E5%8A%9B%E8%B2%BC%E8%BA%AB%E3%80%81%E5%B0%91%E9%87%8F%E3%80%81%E6%97%A5%E7%94%A8%E3%80%81%E5%A4%9C%E7%94%A8%E3%80%9017.5cm%E3%80%8123cm%E3%80%8128cm%E3%80%91%E8%A1%9B%E7%94%9F%E6%A3%89-i.5065357.9760271201?sp_atk=4646a15c-7e59-47a9-9853-e3999d7f491d",
    "https://shopee.tw/%E8%98%87%E8%8F%B2%E8%B6%85%E7%86%9F%E7%9D%A141.5%E5%85%AC%E5%88%86%E4%B9%BE%E7%88%BD%E7%B6%B2%E5%B1%A4-%E7%B4%B0%E7%B7%BB%E6%A3%89%E6%9F%94-i.15828725.4248457236?sp_atk=9b2e92bf-0943-46a7-b3f9-4fabe5cfc074",
  ];

  const titles = [
    "Sofy 蘇菲 彈力貼身、少量、日用、夜用【17.5cm、23cm、28cm】衛生棉",
    "蘇菲超熟睡41.5公分（六片裝）乾爽網層/細緻棉柔"
  ]

  const browser = await puppeteer.launch({
    executablePath:
      os.platform() === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: false, // 無外殼的 Chrome，有更佳的效能
  });
  await browser
    .defaultBrowserContext()
    .overridePermissions("https://shopee.tw/", ["geolocation"]);
  const page = await browser.newPage();

  for (let i = 0; i < urls.length; i++) {
    await singlePage(urls[i], titles[i], page);
  }

  browser.close();
};

main();
