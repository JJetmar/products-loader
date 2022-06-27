import { loadProducts, Product } from "../src/load-products";
import { productsApiStart, productsApiStop } from "./product-api/product-api-server";

let products: Array<Product>;

const minPriceLimit = parseFloat(process.env.PRODUCT_MIN_PRICE ?? "0");
const maxPriceLimit = parseFloat(process.env.PRODUCT_MAX_PRICE ?? "100000");
const port = parseFloat(process.env.PORT ?? "5555");

beforeAll(() => {
    productsApiStart();
});

afterAll(() => {
    productsApiStop();
});

it("Should load all products", async () => {
    products = await loadProducts(`http://localhost:${port}/products`, minPriceLimit, maxPriceLimit);

    expect(products.length).toBe(parseInt(process.env.PRODUCTS_TOTAL_COUNT ?? "999999"));
}, 2 * 60 * 1000);

it("Should contain no duplicities", async () => {
    const uniqueProductIds = new Set(products.map((product) => product.id));

    expect(products.length).toEqual(uniqueProductIds.size);
});
