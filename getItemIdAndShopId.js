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

module.exports = { getItemIdAndShopId };
