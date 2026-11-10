# ProAccess

TLC reached 48 states and 117 steps. The chart draws 11 states and 19 arrows.
The chart does not draw 30 steps that stay in one chart state.
The view hides 22 steps, so the chart does not draw them.

## OnlyTheOwnerGetsIn breaks
The shortest path has 1 step:
0. No password yet
1. a stranger signs up with the pro's email: A stranger set the password, and the stranger is signed in

## OwnerKeepsTheAccount breaks
The shortest path has 1 step:
0. No password yet
1. a stranger signs up with the pro's email: A stranger set the password, and the stranger is signed in

## AResetLocksOthersOut breaks
The shortest path has 4 steps:
0. No password yet
1. the pro asks for a sign-in link: No password, a sign-in link is in the pro's inbox
2. the link is opened: No password, a sign-in link is in the pro's inbox
3. a stranger signs up with the pro's email: A stranger set the password, and the stranger is signed in
4. the pro sets a password from the link: The pro set the password, and both the stranger and the pro are signed in

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
