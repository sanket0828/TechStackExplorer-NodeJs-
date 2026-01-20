const fs = require("fs");
const http = require("http");
const url = require("url");

///////////////////////////////////////////////////
/// Server

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTSNAME%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");

  return output;
};

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/myOverview.html`,
  "utf-8",
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8",
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/myProduct.html`,
  "utf-8",
);

const data = fs.readFileSync(`${__dirname}/dev-data/myData.json`, "utf-8");
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  /////////////////////
  //Routing :

  //Overview page
  if (pathname === "/overview" || pathname === "/") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    //Product Page
  } else if (pathname === "/product") {
    const product = dataObj[query.id];

    if (!product) {
      res.writeHead(404, { "Content-type": "text/html" });
      return res.end("<h1>Product not found</h1>");
    }

    res.writeHead(200, { "Content-type": "text/html" });
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    //API
  } else if (pathname == "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(data);

    //Not Found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "Hello this is Header.",
    });
    res.end("<h1>Error, Page not found! </h1>");
  }
});

const port = 8000;
server.listen(`${port}`, "127.0.0.1", () => {
  console.log(`Server is Listening on port: ${port}`);
});
