---- MODULE ContractorFinder ----
\* The public contractor finder (/contractor): what the results beside the map show while a
\* visitor searches by ZIP, uses their location, clears, or follows the menu link back.
\*
\* Code this model describes (uncommitted working tree, 2026-11-10):
\*   src/components/contractor/ContractorFinder.tsx   search state, lookUp, locate, clear
\*   src/app/api/contractors/zip/route.ts              the ZIP lookup each search waits on
\*
\* Fixed = TRUE (today.cfg) is the code as it is, after the 2026-11-10 fix: every ZIP's point is
\* kept by ZIP (zipPoints); "near me" is a search in the address bar (?near=me, no coordinates)
\* the moment it's tapped, and the location is used only while that is still the search
\* (nearRef); and the spinner is derived from what is still out (pending lookups, locating).
\* Fixed = FALSE (before.cfg) is the code before that fix, which kept one zipPoint, let a location
\* answer take over whenever it came, and set and cleared one busy flag per request.
\*
\* Not modeled: a page opened at ?near=me asks for the location once; the location request is
\* not sent again while one is out (AsksForLocation's guard).
\*
\* Abstractions: two ZIPs, A and B. A lookup's answer can arrive after a later search's answer.
\* Lookups and location requests succeed; a failure only shows an error and changes nothing here.
\* Changing the address with router.replace() keeps the page loaded (checked in a replay: Next.js
\* adds the trailing slash itself). The map follows the results (ContractorMap frames them and
\* zooms out when they clear), so the model tracks the results only.

CONSTANTS Fixed

Zips == {"A", "B"}

VARIABLES
    url,        \* the address bar: "none", a ZIP (?zip=), or "here" (?near=me, Fixed only)
    inflight,   \* ZIP lookups sent and not answered yet
    points,     \* ZIPs whose point the page holds
    here,       \* the page holds the visitor's location
    locating,   \* a location request is out
    busy,       \* the Search button shows its spinner
    asked,      \* ghost: the visitor's latest search, "none", a ZIP or "here"
    prev,       \* ghost: what the results showed before the last step
    by          \* ghost: who made the last step, "visitor" or "network"

vars == <<url, inflight, points, here, locating, busy, asked, prev, by>>

\* What the results beside the map are for. (With Fixed, the page holds a location only while
\* ?near=me is in the address bar.)
Shown ==
    IF here THEN "here"
    ELSE IF url \in Zips /\ url \in points THEN url
    ELSE "none"

Init ==
    /\ url = "none"
    /\ inflight = {}
    /\ points = {}
    /\ here = FALSE
    /\ locating = FALSE
    /\ busy = FALSE
    /\ asked = "none"
    /\ prev = "none"
    /\ by = "visitor"

\* submit(): forget a shared location, then search. A new ZIP goes in the address bar and the
\* effect on ?zip= sends the lookup; the same ZIP sends it again.
SearchesZip(z) ==
    /\ prev' = Shown
    /\ by' = "visitor"
    /\ here' = FALSE
    /\ url' = z
    /\ inflight' = inflight \cup {z}
    /\ busy' = TRUE
    /\ asked' = z
    /\ UNCHANGED <<points, locating>>

\* lookUp() gets its answer. Today the page keeps only the point that came back last, and any
\* answer turns the spinner off.
LookupAnswers(z) ==
    /\ z \in inflight
    /\ prev' = Shown
    /\ by' = "network"
    /\ inflight' = inflight \ {z}
    /\ points' = IF Fixed THEN points \cup {z} ELSE {z}
    /\ busy' = IF Fixed THEN (inflight' # {} \/ locating) ELSE FALSE
    /\ UNCHANGED <<url, here, locating, asked>>

\* locate(): ask the browser for the visitor's location. Fixed: "near me" becomes the search in
\* the address bar at once, so a ZIP answer still on its way no longer shows.
AsksForLocation ==
    /\ ~locating
    /\ prev' = Shown
    /\ by' = "visitor"
    /\ locating' = TRUE
    /\ busy' = TRUE
    /\ asked' = "here"
    /\ url' = IF Fixed THEN "here" ELSE url
    /\ here' = IF Fixed THEN FALSE ELSE here
    /\ UNCHANGED <<inflight, points>>

\* The location arrives. Today it always takes over and takes ?zip= out of the address bar.
\* Fixed: it is used only while ?near=me is still the search.
LocationArrives ==
    /\ locating
    /\ prev' = Shown
    /\ by' = "network"
    /\ locating' = FALSE
    /\ IF Fixed
       THEN here' = (url = "here")
       ELSE here' = TRUE
    /\ url' = IF Fixed THEN url ELSE "none"
    /\ busy' = IF Fixed THEN (inflight # {}) ELSE FALSE
    /\ UNCHANGED <<inflight, points, asked>>

\* clear(): drop the location and take the search out of the address bar.
Clears ==
    /\ prev' = Shown
    /\ by' = "visitor"
    /\ here' = FALSE
    /\ url' = "none"
    /\ asked' = "none"
    /\ UNCHANGED <<inflight, points, locating, busy>>

\* The menu's "Find a Contractor" link (or Back) to /contractor with no search in the address:
\* the visitor is starting over. The page stays loaded, so only the address bar changes. Fixed:
\* ?near=me leaves the address bar with it, so the location goes too.
LeavesSearch ==
    /\ prev' = Shown
    /\ by' = "visitor"
    /\ url' = "none"
    /\ asked' = "none"
    /\ here' = IF Fixed THEN FALSE ELSE here
    /\ UNCHANGED <<inflight, points, locating, busy>>

Next ==
    \/ \E z \in Zips : SearchesZip(z)
    \/ \E z \in Zips : LookupAnswers(z)
    \/ AsksForLocation
    \/ LocationArrives
    \/ Clears
    \/ LeavesSearch

Spec == Init /\ [][Next]_vars

\* Rules
\* The results never switch to a search the visitor has moved on from.
NeverSwitchesToAnOlderSearch == Shown = prev \/ Shown \in {asked, "none"}
\* An answer arriving never takes away the results the visitor is looking at.
ResultsStayPut == (by = "network" /\ prev = asked /\ prev # "none") => Shown = prev
\* Once nothing is still out, the results are for the visitor's latest search.
LatestSearchShows == (inflight = {} /\ ~locating) => Shown = asked
\* The spinner shows exactly while a search is still out.
SpinnerMeansSearching == busy = (inflight # {} \/ locating)
====
