import {loadAllProducts, Product} from "../src/load-all-products";

import {productsApiStart, productsApiStop} from "./product-api/product-api-server";

describe("loading all products", () => {

    beforeAll(() => {
        productsApiStart()
    });

    afterAll(() => {
        productsApiStop()
    });

    let products: Array<Product>;

    it('Should load all products', async () => {
        products = await loadAllProducts("http://localhost:5555/products");
        expect(products.length).toBe(100_000);
    });
});

