import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";

const csvWriter = createObjectCsvWriter({
  path: "out.csv",
  header: [
    { id: "name", title: "Name" },
    { id: "price", title: "Price" },
    { id: "image", title: "Image" },
    { id: "quantity", title: "Quantity" },
    { id: "category", title: "Category" },
    { id: "description", title: "Description" },
  ],
});
const csvWriter1 = createObjectCsvWriter({
  path: "out1.csv",
  header: [
    { id: "category", title: "Category" },
    { id: "description", title: "Description" },
  ],
});
const fetchData = async (url) => {
  const config = {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "x-locale": "en-eg",
    },
    method: "GET",
    url: url,
  };

  const data = await axios(config);
  return data.data.hits;
};
const fetchProductDetails = async (url) => {
  const config = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Referer:
        "https://www.noon.com/egypt-en/boys-navy-blue-trousers/ZB5FB5FBC64DBD0549765Z/p/?o=zb5fb5fbc64dbd0549765z-2",
      "x-locale": "en-eg",
      "x-content": "desktop",
      "x-cms": "v3",
      "x-mp": "noon",
      "x-platform": "web",
      "x-visitor-id": "7ca23458-5686-4dc8-a25a-ef4ae2038567",
      "x-lat": "299940130",
      "x-lng": "314289970",
      "x-aby":
        '{"pdp_previously_browsed.show_previously_browsed":0,"returns_app_version.application_version":"v2","show_ar_model.enabled":1,"show_coupon_tray.enabled":1,"show_previously_bought_label_v3.enabled":1}',
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "If-None-Match": 'W/"359c-Eam6CgUstcBTwNq75a+g+wo0UsI"',
      TE: "trailers",
    },
    method: "GET",
    url: url,
  };

  const data = await axios(config);
  return data.data.product;
};

const getNoonData = async () => {
  let page = 1;
  const limit = 200;
  let isLastPage = false;
  const allStoreProducts = [];
  while (!isLastPage) {
    const url = `https://www.noon.com/_svc/catalog/api/v3/u/p-17301/egypt-e?limit=${limit}&page=${page}`;
    const data = await fetchData(url);
    allStoreProducts.push(...data);
    isLastPage = data.length < 1;
    page++;
  }
  return allStoreProducts;
};

const data = await getNoonData();
let finalData = [];
for (let product of data) {
  finalData.push({
    name: product.name,
    price: product.sale_price,
    image: `https://f.nooncdn.com/p/${product.image_key}.jpg`,
    quantity: product.stock_minimum_quantity,
    sku: product.sku,
    url: product.url,
  });
}

const getNoonProductData = async () => {
  let productData = [];
  for (let product of finalData) {
    const url =
      "https://www.noon.com/_svc/catalog/api/v3/u/" +
      product.url +
      "/" +
      product.sku +
      "/p/";
    const productDetails = await fetchProductDetails(url);
    if (!productDetails) continue;
    productData.push({
      category: productDetails.category_code,
      description: productDetails.long_description,
    });
  }
  return productData;
};
const productData = await getNoonProductData();

// console.log(productData);
// console.log(finalData.length);

csvWriter
  .writeRecords(finalData)
  .then(() => console.log("The First CSV file was written successfully"));

csvWriter1
  .writeRecords(productData)
  .then(() => console.log("The Second CSV file was written successfully"));
