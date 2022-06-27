import { loadProducts, Product } from "../src/load-products";
import { productsApiStart, productsApiStop } from "./product-api/product-api-server";

describe("loading all products", () => {
    beforeAll(() => {
        productsApiStart();
    });

    afterAll(() => {
        productsApiStop();
    });

    let products: Array<Product>;

    it("Should load all products", async () => {
        products = await loadProducts("http://localhost:5555/products", 0, 100_000);
        expect(products.length).toBe(999_999);
    }, 99999_999);

    it("Should contain no duplicities", async () => {
        const productIds = new Set();
        let duplicities = 0;

        for (const product of products) {
            if (productIds.has(product.id)) {
                duplicities++;
            } else {
                productIds.add(product.id);
            }
        }
        expect(duplicities).toBe(0);
    });
});
