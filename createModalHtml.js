const createModalHtml = (data) => {
  return `
      <body>
        <h2>商品全名: ${data["商品全名"]}</h2>
        <h2>賣場編號: ${data["賣場編號"]}</h2>
        <h2>商品價格: ${data["商品價格"]}</h2>
        <h2>月銷量: ${data["monthly_sales"]}</h2>
        ${
          data["免運費關鍵字"]
            ? `<h2>免運費關鍵字: ${data["免運費關鍵字"]}</h2>`
            : ""
        }
        ${
          data.variation && data.variation.length > 0
            ? `
          <h2>規格</h2>
          <ul>
          ${data.variation
            .map(
              ({ content, price, number }) => `
              <li style="margin-right: 50px; display: flex; justify-content: space-between">
                <p>${content}</p> 
                <p style="margin-left: auto">${price}</p>
                <p style="margin-left: 24px; width: 100px; transform: translateY(-2px)">${number}</p>
              </li>
            `
            )
            .join("")}
          </ul>
        `
            : ""
        }
        ${
          data["免運費細節"]
            ? `
          <h2>運費細節</h2>
          <ul>
          ${data["免運費細節"]
            .split(/\([0-9]+\)\./)
            .filter((detail) => !!detail)
            .map(
              (detail) => `
              <li style="margin-right: 50px">
                <p>${detail}</p> 
              </li>
            `
            )
            .join("")}
          </ul>
        `
            : ""
        }
      </body>
    `;
};

module.exports = { createModalHtml };
