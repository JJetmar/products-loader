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

export async function loadAllProducts(endpoint: string, minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER): Promise<Array<Product>> {
    if (minPrice < 0) throw new Error("Min Price cannot be lower than 0!")
    if (maxPrice < 0) throw new Error("Max Price cannot be lower than 0!")

    // Initial fetch to get information about maximal count per request and total number of products.
    let response;
    try {
        response = await fetch(`${endpoint}/?minPrice=${minPrice}?maxPrice=${maxPrice}`)
            .then<ProductApiResponse>(data => data.json());
    } catch (e) {
        console.error(e);
        throw new Error("Error during fetching products API!");
    }

    const {count, total, products} = response;

    if (count === total) {
        // If we already fetched all products then we can return them.
        return products;
    }

    // minimal number of requests required to fetch all products



    return [];
}
