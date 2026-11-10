# ViewAs

TLC reached 576 states, more than the chart budget of 500, so the chart draws only the bug paths: 10 states and 10 arrows.

## NothingChangesWhileViewing breaks
The shortest path has 3 steps:
0. No view open
1. A signs in to the admin: No view open
2. A presses View as on Mike: Viewing Mike's account
3. a Pro Hub page loads and syncs Mike's details: Viewing Mike's account; Mike's account was changed

## LogShowsEveryView breaks
The shortest path has 3 steps:
0. No view open
1. A signs in to the admin: No view open
2. A presses View as on Mike: Viewing Mike's account
3. A presses View as on Mike: Viewing Mike's account; a view is missing its end in the log

## NoBaseViewOnceTheyHaveAnAccount breaks
The shortest path has 4 steps:
0. No view open
1. A signs in to the admin: No view open
2. A presses View as on Ruth: Viewing Ruth's base page
3. Ruth signs up for the Pro Hub: Viewing Ruth, opened before she signed up
4. a Pro Hub page loads the base page: Viewing Ruth, opened before she signed up; base page shown to an account

## ExitEndsTheView breaks
The shortest path has 5 steps:
0. No view open
1. A signs in to the admin: No view open
2. A presses View as on Mike: Viewing Mike's account
3. A signs out of the admin: Viewing Mike's account, paused
4. Exit admin view [while the view is paused]: Viewing Mike's account, paused, after Exit
5. A signs in to the admin: Viewing Mike's account, after Exit

## Rules that hold
OnlyTheStarterSees, NoDeadlock
