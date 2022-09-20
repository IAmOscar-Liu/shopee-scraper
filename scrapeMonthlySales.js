const scrapeMonthlySales = async (product_idx, win, page, title, shopClass) => {
  try {
    const shopBtnPath = `.${shopClass} > a`;

    if (!(await page.$(shopBtnPath)))
      throw new Error("Can' find '查看賣場' button");

    const aLink = await page.$eval(shopBtnPath, (a) => a.href);

    await page.goto(aLink);
    await page.waitForSelector("form input");
    await page.type("form input", title);
    await page.keyboard.press("Enter");

    const itemPath = ".shopee-search-item-result__item";

    await page.waitForSelector(itemPath);

    const sortBySalesBtn = await page.$(
      ".shopee-sort-by-options > *:nth-of-type(3)"
    );

    if (!sortBySalesBtn) throw new Error("Cannot find '最熱銷' button");

    await sortBySalesBtn.click();

    await page.waitForSelector(itemPath);

    const salesResults = await page.$$(itemPath);
    if (!salesResults || salesResults.length === 0)
      throw new Error("Cannot find salesResults");
    const monthlySales = await page.$$eval(
      itemPath,
      (items) => items[0].innerText
    );

    const salesNumber = (
      monthlySales.split(/\n/).find((c) => c.includes("月銷量")) || ""
    )
      .replace("月銷量", "")
      .replaceAll(" ", "");

    win.webContents.send("receive_data", {
      product_idx,
      type: "monthly sales",
      payload: {
        fullContent: monthlySales,
        sales: salesNumber || "找不到",
      },
      msg: "done",
      msgColor: "green",
    });
  } catch (error) {
    win.webContents.send("receive_data", {
      product_idx,
      type: "monthly sales",
      payload: {
        fullContent: error.message,
        sales: "找不到",
        shopClass,
      },
      msg: "done",
      msgColor: "green",
    });
  }
};

module.exports = { scrapeMonthlySales };
