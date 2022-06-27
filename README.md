# Product-loader solution

## Limitations:

- We presume that the prices of Products are defined with precision of max 3 decimals.
- There are not more than `MAX_PRODUCTS_PER_PAGE` (default 1000) of products with exactly same price.

## Possible improvements

- Product-server-api
    - All products are generated and then stored in single array as a simple in-memory approach. In case of higher
      amount of products being generated (more than 9 999 999) . Better approach would be to use some DBMS f
    - This could be solved by storing 
