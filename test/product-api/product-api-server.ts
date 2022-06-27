import Koa from "koa";
import KoaRouter from "koa-router";
import { faker } from "@faker-js/faker";

const productApiServer = new Koa();
const router = new KoaRouter();

// Environment variables
const seed = parseInt(process.env.RANDOM_SEED ?? "1234");
const productsTotalCount = parseInt(process.env.PRODUCTS_TOTAL_COUNT ?? "999999");
const productsMaxPerRequest = parseInt(process.env.PRODUCTS_MAX_PER_REQUEST ?? "1000");
const minPrice = parseFloat(process.env.PRODUCT_MIN_PRICE ?? "0");
const maxPrice = parseFloat(process.env.PRODUCT_MAX_PRICE ?? "100000");
const appPort = parseInt(process.env.PORT ?? "5555");

faker.seed(seed);

console.debug("Running Products API");
console.debug("Configuration:");
console.table({
    seed,
    productsTotalCount,
    productsMaxPerRequest,
    minPrice,
    maxPrice,
    appPort
});

console.debug(`Generating ${productsTotalCount} products...`);

// Generate random Products
const products = Array.from({ length: productsTotalCount }).map((_, index) => {
    return {
        id: index,
        name: faker.commerce.productName(),
        price: faker.datatype.number({ min: minPrice, max: maxPrice, precision: 0.01 })
    };
});

console.debug(`${products.length} products generated.`);

let requestCounter = 0;

router.get("/products", async (ctx, next) => {
    const filterMinPrice = ctx.query.minPrice != null ? parseFloat(ctx.query.minPrice as string) : null;
    const filterMaxPrice = ctx.query.maxPrice != null ? parseFloat(ctx.query.maxPrice as string) : null;

    console.debug(`Incoming request for products in price range from ${filterMinPrice} to ${filterMaxPrice}.`);

    // Filters products by minPrice and maxPrice
    const filteredProducts = products.filter((product) => {
        if (filterMinPrice != null && product.price < filterMinPrice) {
            return false;
        }
        // noinspection RedundantIfStatementJS
        if (filterMaxPrice != null && product.price > filterMaxPrice) {
            return false;
        }
        return true;
    });

    // Limits number of resulted products
    const productResults = filteredProducts.slice(0, productsMaxPerRequest);

    console.debug(`Returning response for ${filterMinPrice} to ${filterMaxPrice}.`);

    requestCounter++;

    // Response as a JSON
    ctx.set("Content-Type", "application/json");
    ctx.body = JSON.stringify({
        total: filteredProducts.length,
        count: productResults.length,
        products: productResults
    });
    await next();
});

productApiServer.use(router.routes()).use(router.allowedMethods());

let instance: ReturnType<typeof productApiServer.listen>;

/**
 * It starts the Product API server on the port specified in the `appPort` variable
 */
export const productsApiStart = () => {
    instance?.close();
    instance = productApiServer.listen(appPort);
};

/**
 * It stops the Product API server.
 */
export const productsApiStop = () => {
    console.debug(`HTTP requests made: ${requestCounter}`);
    instance?.close();
};

console.debug(`Product API is listening on port: ${appPort}.`);
