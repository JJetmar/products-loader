# Products loader solution

This project is result of exercise for loading Products via simple REST API that is limited by maximum amount of
products per request. The only way to load all data is with setting appropriate values for minimum and maximum price
filter.

Main algorithm for loading Products can be found in [src/load-products.ts](src/load-products.ts). To test the algorithm
a Products API has been made as a simple server REST API that is able to generate random Product data and fetching them
by their price criteria.

## How to run

Main focus in this exercise was on the algorithm itself - it is not part of any self executable application. Algorithm
can be tested with a [Jest testing framework](https://jestjs.io/).

### NPM

You need to install a [Node.js](https://nodejs.org/en/) on your locale machine (tested on version 16.13.1).

```
npm install
npm run test
```

### Docker-compose

To be able to run tests with docker-compose, you need to install [Docker](https://www.docker.com/) first.

```
docker-compose up
```

## Environment variables

- `RANDOM_SEED`: Seed for generating random Products on Products API *(default `1234`)*
- `PRODUCTS_TOTAL_COUNT`: Amount of all products on Products API *(default `999999`)*
- `PRODUCTS_MAX_PER_REQUEST`: Maximum amount of products that can be returned in single response *(default `1000`)*
- `PRODUCT_MIN_PRICE`: Minimum possible value that can be generated pro Product's price *(default `0`)*
- `PRODUCT_MAX_PRICE`: Maximum possible value that can be generated pro Product's price *(default `100000`)*
- `MAX_CONCURRENT_REQUESTS`: Maximum amount of parallel HTTP requests from Product Loader *(default `100`)*
- `PORT`: Server port for Products API *(default `5555`)*

## Presumptions

Based on the assignment there are few limitations for data that comes from Product API.

- Prices of Products are defined with precision of max 3 decimals.
- There are not more than `MAX_PRODUCTS_PER_PAGE` (default 1000) of products with exactly same price.

## Possible improvements

There are few thing that are not expressly mentioned in the assignment and are not included in the final version of this
project. When there would be assigned with much more data or HW or network limitations then we could get into some
troubles. The following list includes some of these improvements that could be done.

- **Products Loader**
    - Responses from Product API could be handled as a stream. In case that response starts with
      `{ "count": 100, total: 100, ...}` (as mentioned in the assignment), then when the both values (`count` and
      `total`) are not equal the loading of whole response could be aborted and which could saves some memory, network
      data and loading time.
- **Product API**
    - All products are generated and then stored in single array as a simple in-memory approach. In case of higher
      amount of products being generated (more than 9 999 999). Better approach would be to use some DBMS like
      PostgreSQL, MongoDb. Using DBMS could lead to better performance by traversing only the data that meet the price
      criteria and products per page amount.
