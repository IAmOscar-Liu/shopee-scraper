const scrapeMonthlySales = async ({ page, title, shopClass }) => {
  try {
    const shopBtnPath = `.${shopClass} > a`;

    if (!(await page.$(shopBtnPath)))
      throw new Error("Cannot find '查看賣場' button");

    const aLink = await page.$eval(shopBtnPath, (a) => a.href);

    await page.goto(aLink);
    await page.waitForSelector("form input");
    await page.type("form input", title);
    await page.keyboard.press("Enter");

    const itemPath = ".shopee-search-item-result__item";
    const noItemPath = ".shopee-search-empty-result-section__title";

    await Promise.race([
      page.waitForSelector(itemPath).then(() => true),
      page.waitForSelector(noItemPath).then(() => false),
      new Promise((resolve, reject) => {
        // Reject after 5 seconds
        setTimeout(() => reject(new Error("Request timed out")), 5000);
      }),
    ])
      .then((hasResult) => {
        if (!hasResult) throw new Error("No Result");
      })
      .catch((e) => {
        throw e;
      });

    const sortBySalesBtn = await page.$(
      ".shopee-sort-by-options > *:nth-of-type(3)"
    );

    if (!sortBySalesBtn) throw new Error("Cannot find '最熱銷' button");

    await sortBySalesBtn.click();

    await page.waitForSelector(itemPath, { timeout: 5000 });

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

    return {
      error: null,
      data: { fullContent: monthlySales, sales: salesNumber || "找不到" },
    };
  } catch (error) {
    return {
      error: error.message,
      data: { fullContent: "找不到", sales: "找不到" },
    };
  }
};

module.exports = { scrapeMonthlySales };
