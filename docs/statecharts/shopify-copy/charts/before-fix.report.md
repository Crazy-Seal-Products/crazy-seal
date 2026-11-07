# ShopifyCopy

TLC reached 3,990 states, more than the chart budget of 500, so the chart draws only the bug paths: 4 states and 6 arrows.

## DeletedStaysDeleted breaks
The shortest path has 3 steps:
0. Our copy matches Shopify
1. an admin page load starts a refresh: Our copy matches Shopify
2. the order is deleted in Shopify: Our copy matches Shopify
3. the refresh writes an order it fetched earlier: An order deleted in Shopify is still in our copy, after a delete was undone

## NeverGoesBack breaks
The shortest path has 5 steps:
0. Our copy matches Shopify
1. an admin page load starts a refresh: Our copy matches Shopify
2. an order changes in Shopify: An order is behind Shopify, the next refresh will fetch it
3. the update webhook asks Shopify for the order: An order is behind Shopify, the next refresh will fetch it
4. the webhook writes what it got: Our copy matches Shopify
5. the refresh writes an order it fetched earlier: An order is behind Shopify, the next refresh will fetch it, after an older copy overwrote a newer one

## Rules that hold
NoDeadlock
