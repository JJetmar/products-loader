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

/**
 * It takes a range and divides it into a given amount of parts
 * @param range - [min: Big, max: Big] - the range of numbers to divide
 * @param {number} priceRangeCount - number - the amount of parts to divide the range into
 * @returns An array of arrays of Big numbers.
 */
const divideToRanges = (range: [min: Big, max: Big], priceRangeCount: number): Array<[Big, Big]> => {
    const [min, max] = range;
    const currentRangeSize = max.minus(min);
    const sizeOfGroup = currentRangeSize.div(priceRangeCount);

    return Array.from({ length: priceRangeCount }).map((_, index) => [
        min.plus(sizeOfGroup.times(index)),
        min.plus(sizeOfGroup.times(index + 1)).minus(precision)
    ]);
};

/**
 * It fetches products from the API, and returns the data
 * @param {string} endpoint - The endpoint to fetch the products from.
 * @param {number} minPrice - The minimum price of the product
 * @param {number} maxPrice - number - The maximum price of the product
 * @returns Promise<ProductApiResponse>
 */
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

/**
 * We divide the price range into groups, fetch products from each group, and then merge the results
 * @param {string} endpoint - The endpoint to fetch products from.
 * @param {number | Big} minPriceLimit - The minimum price of the products you want to fetch.
 * @param {number | Big} maxPriceLimit - The maximum price of the product.
 * @returns An array of products.
 */
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

    // Fetch Products based on endpoint, and price range.
    const { count, total, products } = await fetchProducts(endpoint, minPrice.toNumber(), maxPrice.toNumber());
    if (count === total) {
        // Fetched all possible products in given price range.
        return products;
    }

    const allProducts: Array<Product> = [];

    // Calculating the amount of parts we need to divide the price range into.
    const priceRangeCount = Math.ceil(total / count);

    await Promise.all(
        // Divide current price range into smaller ranges.
        divideToRanges([minPrice, maxPrice], priceRangeCount).map(([newMin, newMax]) =>
            // Load Products based on new generated ranges
            loadProducts(endpoint, newMin, newMax).then((products) => allProducts.push(...products))
        )
    );

    return allProducts;
}
