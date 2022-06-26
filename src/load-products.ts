import Axios from "axios";
import Big from "big.js";
const client = Axios.create();

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

const precision = Big("0.00001");

const divide = (range: [min: Big, max: Big], numberOfGroups: number): Array<[Big, Big]> => {
    console.log(range.map(a => a.toString()))
    const [min, max] = range;
    const full = max.minus(min);
    const sizeOfGroup = full.div(numberOfGroups);

    return Array.from({length: numberOfGroups}).map((_, index) => {
        const result = [min.plus((sizeOfGroup.times(index))), min.plus(sizeOfGroup.times(index + 1)).minus(precision)] as [Big, Big];
        console.log([result[0].toString(), result[1].toString()]);
        return result;
    });
}

export async function fetchProducts(endpoint: string, minPrice: number, maxPrice: number): Promise<ProductApiResponse> {
    try {
        console.count("CLIENT")
        return (await client.get(endpoint, {
            params: {
                minPrice,
                maxPrice
            }
        })).data;
    } catch (e) {
        console.error(e);
        throw new Error("Error during fetching products API!");
    }
}

//const fetchProductLimited = limiter.wrap(fetchProducts);

export async function loadAllProducts(endpoint: string, minPriceLimit: number | Big, maxPriceLimit: number | Big): Promise<Array<Product>> {
    const minPrice = Big(minPriceLimit);
    const maxPrice = Big(maxPriceLimit);

    if (minPrice.lt(0)) throw new Error("Min Price cannot be lower than 0!")
    if (maxPrice.lt(0)) throw new Error("Max Price cannot be lower than 0!")
    if (maxPrice.lt(minPrice)) throw new Error("Min Price cannot be lower than Max Price!")

    const {count, total, products} = await fetchProducts(endpoint, minPrice.toNumber(), maxPrice.toNumber());

    if (count === total) {
        // If we already fetched all products then we can return them.
        return products;
    }

    const allProducts: Array<Product> = [];

    const numberOfGroups = Math.ceil(total / count);
    console.log({total, count})

    //const requests = divide([minPrice, maxPrice], sizeOfGroup)
    // .map(([newMin, newMax]) => await loadAllProducts(endpoint, newMin, newMax)
    //             .then(products => allProducts.push(...products)));

    for (const [newMin, newMax] of divide([minPrice, maxPrice], numberOfGroups)) {
        await loadAllProducts(endpoint, newMin, newMax)
            .then(products => allProducts.push(...products))
    }

    console.log("WAITING", allProducts.length)

    //await Promise.all(requests);

    return allProducts;
}
