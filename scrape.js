const fetch = require("isomorphic-fetch");
const { getItemIdAndShopId } = require("./getItemIdAndShopId");

function waitFor(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), time);
  });
}

function getTWDate(ts) {
  const date = new Date(ts * 1000);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

async function getData(url, product_idx, win, cookie) {
  win.webContents.send("receive_data", {
    product_idx,
    type: "start new product",
    msg: "scraping......",
    msgColor: "orange",
  });

  const { shopid, itemid } = getItemIdAndShopId(url);

  const itemRes = await fetch(
    `https://shopee.tw/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`,
    {
      headers: { cookie },
    }
  );
  const itemJson = await itemRes.json();

  const itemResult = {
    title: itemJson.data.name,
    price:
      itemJson.data.price_min === itemJson.data.price_max
        ? "$" + itemJson.data.price_min / 100000
        : `$${itemJson.data.price_min / 100000} - $${
            itemJson.data.price_max / 100000
          }`,
    number: itemJson.data.stock ? `剩下${itemJson.data.stock}件` : "找不到",
    sales: itemJson.data.sold || "找不到",
    variations: itemJson.data.models
      .filter((v) => v.stock)
      .map((v, varIdx) => ({
        varIdx,
        content: v.name,
        price: v.price / 100000,
        number: v.stock ? `剩下${v.stock}件` : "未知數量",
      })),
  };

  win.webContents.send("receive_data", {
    product_idx,
    type: "item results",
    payload: itemResult,
    msg: "scraping shipping info...",
    msgColor: "orange",
  });

  const shippingRes = await fetch(
    `https://shopee.tw/api/v4/pdp/get_shipping?buyer_zipcode=&city=%E4%B8%AD%E6%AD%A3%E5%8D%80&district=&itemid=${itemid}&shopid=${shopid}&state=%E8%87%BA%E5%8C%97%E5%B8%82&town=`,
    {
      headers: { cookie },
    }
  );
  const shippingJson = await shippingRes.json();

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

async function handleRequest(_data, win, cookie) {
  if (_data.length === 0 || win === null) return;

  while (_data.length > 0 && win !== null) {
    const { data, data_idx } = _data.shift();
    try {
      await getData(data["賣場網址"], data_idx, win, cookie);
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
}

async function main({ data, cookie }, win) {
  const dataWithIdx = data.map((d, data_idx) => ({ data_idx, data: d }));
  // console.log(cookie);

  await Promise.all([
    handleRequest(dataWithIdx, win, cookie),
    handleRequest(dataWithIdx, win, cookie),
    handleRequest(dataWithIdx, win, cookie),
  ]); // open 3 browser at the same time

  win.webContents.send("receive_data", {
    product_idx: 1000000,
    type: "done",
  });
}

// main();
module.exports = { scrape: main };
