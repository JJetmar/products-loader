# Product-loader solution

## How to run

### NPM

```
npm install
npm run test
```

### Docker-compose

```
docker-compose up
```

## Presumptions:

- Prices of Products are defined with precision of max 3 decimals.
- There are not more than `MAX_PRODUCTS_PER_PAGE` (default 1000) of products with exactly same price.

## Environment variables

- `RANDOM_SEED`: Seed for generating random Products on Products API *(default `1234`)*
- `PRODUCTS_TOTAL_COUNT`: Amount of all products on Products API *(default `999999`)*
- `PRODUCTS_MAX_PER_REQUEST`: Maximum amount of products that can be returned in single response *(default `1000`)*
- `PRODUCT_MIN_PRICE`: Minimum possible value that can be generated pro Product's price *(default `0`)*
- `PRODUCT_MAX_PRICE`: Maximum possible value that can be generated pro Product's price *(default `100000`)*
- `MAX_CONCURRENT_REQUESTS`: Maximum amount of parallel HTTP requests from Product Loader *(default `100`)*
- `PORT`: Server port for Products API *(default `5555`)*

## Possible improvements

- **Product Loader**
    - Responses from Product API could be handled as a stream. In case that response starts with
      `{ "count": 100, total: 100, ...}` (as mentioned in the assignment), then when the both values (`count` and
      `total`) are not equal the loading of whole response could be aborted and which could saves some memory, network
      data and loading time.
- **Product API**
    - All products are generated and then stored in single array as a simple in-memory approach. In case of higher
      amount of products being generated (more than 9 999 999). Better approach would be to use some DBMS like
      PostgreSQL, MongoDb. Using DBMS could lead to better performance by traversing only the data that meet the price
      criteria or 

