# ContractorFinder

TLC reached 363 states and 2177 steps. The chart draws 8 states and 30 arrows.
The chart does not draw 648 steps that stay in one chart state.
The view hides 596 steps, so the chart does not draw them.

## LatestSearchShows breaks
The shortest path has 3 steps:
0. Map only
1. the visitor taps Use my location: Map only, a search is still out
2. the latest search's answer comes back: Results for the latest search
3. the visitor follows the menu link back to the finder: Results for an older search, the visitor started over

## NeverSwitchesToAnOlderSearch breaks
The shortest path has 3 steps:
0. Map only
1. the visitor searches a ZIP: Map only, a search is still out
2. the visitor taps Use my location: Map only, a search is still out
3. an earlier search's answer comes back: Results for an older search, a search is still out

## SpinnerMeansSearching breaks
The shortest path has 3 steps:
0. Map only
1. the visitor searches a ZIP: Map only, a search is still out
2. the visitor searches a ZIP: Map only, a search is still out
3. an earlier search's answer comes back: Map only, a search is still out

## ResultsStayPut breaks
The shortest path has 4 steps:
0. Map only
1. the visitor searches a ZIP: Map only, a search is still out
2. the visitor searches a ZIP: Map only, a search is still out
3. the latest search's answer comes back: Results for the latest search, a search is still out
4. an earlier search's answer comes back: Map only, the latest search never shows

## Rules that hold
NoDeadlock
