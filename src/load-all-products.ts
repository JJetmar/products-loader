import Axios from "axios";

export interface Product {
    id: number;
    name: string;
    price: number;
}

interface ProductApiResponse {
    count: number;
    total: number;
    products: Array<Product>
}

const divide = (input: [min: number, max: number]) => {
    const divideTo = 2;

    const precision = Math.pow(10, -4);
    const [min, max] = input;
    const full= (max - min);
    const half = full / divideTo

    return Array.from({length: divideTo}).map((_, index) => {
        return [min + index * half, min + (index +1) * half - precision]
    });
}

export async function loadAllProducts(endpoint: string, minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER): Promise<Array<Product>> {
    if (minPrice < 0) throw new Error("Min Price cannot be lower than 0!")
    if (maxPrice < 0) throw new Error("Max Price cannot be lower than 0!")
    if (maxPrice < minPrice) throw new Error("Min Price cannot be lower than Max Price!")

    console.log(`Loading ${minPrice}, ${maxPrice}`);

    const client = Axios.create();

    // Initial fetch to get information about maximal count per request and total number of products.
    let response;
    try {
        console.count("CLIENT")
        response = await client.get(endpoint, {
            params: {
                minPrice,
                maxPrice
            }
        });
    } catch (e) {
        console.error(e);
        throw new Error("Error during fetching products API!");
    }

    const {count, total, products} = response.data;

    if (count === total) {
        // If we already fetched all products then we can return them.
        return products;
    }

    // minimal number of requests required to fetch all products
    const productResults: Array<Product> = [];
    for (const [newMin, newMax] of divide([minPrice, maxPrice])) {
        productResults.push(...(await loadAllProducts(endpoint, newMin, newMax)));
    }
    return productResults;
}
