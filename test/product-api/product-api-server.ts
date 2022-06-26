import Koa from 'koa';
import KoaRouter from 'koa-router';
import { faker } from '@faker-js/faker';
import * as fs from "fs";

const productApiServer = new Koa();
const router = new KoaRouter();

const seed = parseInt(process.env.randomSeed ?? "1246534");
const productsTotalCount = parseInt(process.env.productsTotalCount ?? "100000");
const productsMaxPerRequest = parseInt(process.env.productsMaxPerRequest ?? "100");
const minPrice = parseFloat(process.env.productMinPrice ?? "0");
const maxPrice = parseFloat(process.env.productMaxPrice ?? "100000");
const appPort = parseInt(process.env.port ?? "5555");

faker.seed(seed);

console.log("Running Products API");
console.table({
    seed,
    productsTotalCount,
    productsMaxPerRequest,
    minPrice,
    maxPrice,
    appPort
});

console.log("Generating products...");
const products = Array.from({length: productsTotalCount}).map((_, index) => {
    return {
        id: index,
        name: faker.commerce.productName(),
        price: faker.datatype.number({min: minPrice, max: maxPrice, precision: 0.01})
    }
});

fs.writeFileSync("./products.json", JSON.stringify(products, null, 2), "utf8");
console.log(`${products.length} products generated.`);

router.get("/products", (ctx) => {
    const filterMinPrice = ctx.query.minPrice != null ? parseFloat(ctx.query.minPrice as string) : null;
    const filterMaxPrice = ctx.query.maxPrice != null ? parseFloat(ctx.query.maxPrice as string) : null;

    console.log({filterMinPrice, filterMaxPrice})

    // Filters products by minPrice and maxPrice
    const filteredProducts = products
        .filter(product => {
            if (filterMinPrice != null && product.price < filterMinPrice) {
                return false;
            }
            if (filterMaxPrice != null && product.price > filterMaxPrice) {
                return false;
            }
            return true;
        });

    // Limits number of resulted products
    const productResults = filteredProducts.slice(0, productsMaxPerRequest);

    ctx.set("Content-Type", "application/json");
    ctx.body = JSON.stringify({
        total: filteredProducts.length,
        count: productResults.length,
        products: productResults
    });
});

productApiServer.use(router.routes()).use(router.allowedMethods());

let instance: ReturnType<typeof productApiServer.listen>;
export const productsApiStart = () => { instance?.close(); instance = productApiServer.listen(appPort) }
export const productsApiStop = () => { instance?.close(); }
console.log(`Product API is listening on port: ${appPort}.`);
