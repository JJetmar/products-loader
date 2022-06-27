import Axios from "axios";
import Big from "big.js";
import { ConcurrencyManager } from "axios-concurrency";

const client = Axios.create();

export interface Product {
    id: number;
    name: string;
    price: number;
}

interface ProductApiResponse {
    count: number;
    total: number;
    products: Array<Product>;
}

const precision = Big("0.00001");

// Setup Axios concurrent requests limit.
ConcurrencyManager(client, parseInt(process.env.MAX_CONCURRENT_REQUESTS ?? "100"));

const divide = (range: [min: Big, max: Big], numberOfGroups: number): Array<[Big, Big]> => {
    const [min, max] = range;
    const full = max.minus(min);
    const sizeOfGroup = full.div(numberOfGroups);

    return Array.from({ length: numberOfGroups }).map((_, index) => [
        min.plus(sizeOfGroup.times(index)),
        min.plus(sizeOfGroup.times(index + 1)).minus(precision)
    ]);
};

export async function fetchProducts(endpoint: string, minPrice: number, maxPrice: number) {
    try {
        return (
            await client.get<ProductApiResponse>(endpoint, {
                params: {
                    minPrice,
                    maxPrice
                }
            })
        ).data;
    } catch (e) {
        console.error(e);
        throw new Error("Error during fetching products API!");
    }
}

export async function loadProducts(
    endpoint: string,
    minPriceLimit: number | Big,
    maxPriceLimit: number | Big
): Promise<Array<Product>> {
    const minPrice = Big(minPriceLimit);
    const maxPrice = Big(maxPriceLimit);

    if (minPrice.lt(0)) throw new Error("Min Price cannot be lower than 0!");
    if (maxPrice.lt(0)) throw new Error("Max Price cannot be lower than 0!");
    if (maxPrice.lt(minPrice)) throw new Error("Min Price cannot be lower than Max Price!");

    const { count, total, products } = await fetchProducts(endpoint, minPrice.toNumber(), maxPrice.toNumber());
    if (count === total) {
        // If we already fetched all products then we can return them.
        return products;
    }

    const allProducts: Array<Product> = [];

    const numberOfGroups = Math.ceil(total / count);

    await Promise.all(
        divide([minPrice, maxPrice], numberOfGroups).map(([newMin, newMax]) =>
            loadProducts(endpoint, newMin, newMax).then((products) => allProducts.push(...products))
        )
    );

    return allProducts;
}
