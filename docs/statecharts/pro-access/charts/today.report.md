# ProAccess

TLC reached 36 states and 87 steps. The chart draws 8 states and 14 arrows.
The chart does not draw 38 steps that stay in one chart state.
The view hides 16 steps, so the chart does not draw them.

## OnlyTheOwnerGetsIn breaks
The shortest path has 1 step:
0. No password yet
1. a stranger signs up with the pro's email: A stranger set the password, and the stranger is signed in

## OwnerKeepsTheAccount breaks
The shortest path has 1 step:
0. No password yet
1. a stranger signs up with the pro's email: A stranger set the password, and the stranger is signed in

## LinkWorksOnce breaks
The shortest path has 5 steps:
0. No password yet
1. the pro asks for a sign-in link: No password, a sign-in link is in the pro's inbox
2. the link is opened: No password, a sign-in link is in the pro's inbox
3. the link is opened: No password, a sign-in link is in the pro's inbox
4. the link signs the pro in: No password yet, and the pro is signed in
5. the link signs the pro in: No password yet, and the pro is signed in twice from one link

## Rules that hold
NoDeadlock
