# QuoteRequests

TLC reached 45 states and 105 steps. The chart draws 10 states and 10 arrows.
The chart does not draw 32 steps that stay in one chart state.
The view hides 31 steps, so the chart does not draw them.

## ListedPagesTakeRequests breaks
The shortest path has 3 steps:
0. Contractor's page is live
1. a visitor opens the page: Visitor has the page open
2. an admin changes the page address: Visitor has the page open at its old address
3. the visitor sends the form: Visitor told the contractor isn't taking requests

## NoRequestIsLost breaks
The shortest path has 3 steps:
0. Contractor's page is live
1. a visitor opens the page: Visitor has the page open
2. the visitor sends the form: Saved, visitor told it's on its way, emails not sent yet
3. both emails fail: Saved, but nobody was ever told

## Rules that hold
NoDeadlock
