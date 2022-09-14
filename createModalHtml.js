const createModalHtml = (data) => {
  return `
      <body>
        <h2>商品全名: ${data["商品全名"]}</h2>
        <h2>賣場編號: ${data["賣場編號"]}</h2>
        <h2>商品價格: ${data["商品價格"]}</h2>
        ${
          data["免運費關鍵字"]
            ? `<h2>商品運送: ${data["免運費關鍵字"]}</h2>`
            : ""
        }
        ${
          data.variation && data.variation.length > 0
            ? `
          <h2>Variation</h2>
          <ul>
          ${data.variation
            .map(
              ({ content, price }) => `
              <li style="margin-right: 50px; display: flex; justify-content: space-between">
                <p>${content}</p> 
                <p>${price}</p>
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
