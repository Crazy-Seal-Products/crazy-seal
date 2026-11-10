# ShopifyCopy

TLC reached 1,222 states, more than the chart budget of 500, so the chart draws only the bug paths: 3 states and 3 arrows.

## NothingLeftBehind breaks
The shortest path has 4 steps:
0. Our copy matches Shopify
1. an order changes in Shopify: An order is behind Shopify, the next refresh will fetch it
2. a minute passes: An order is behind Shopify, the next refresh will fetch it
3. a new order comes in: An order is behind Shopify, the next refresh will fetch it
4. staff open the new order, which copies it: An order is behind Shopify, and no refresh will fetch it

## Rules that hold
NeverGoesBack, DeletedStaysDeleted, NoDeadlock
