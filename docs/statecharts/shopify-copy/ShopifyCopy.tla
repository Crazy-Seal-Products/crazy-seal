---- MODULE ShopifyCopy ----
\* Crazy Seal's copy of Shopify orders while webhooks, the admin refresh and one-off fetches overlap.
\*
\* Code this model describes (Crazy-Seal-Products/crazy-seal):
\*   src/lib/shopify/sync.ts                 fetchAndUpsertOrder, upsertShopifyOrder, markShopifyDeleted
\*   supabase/migrations/019_shopify_copy_newest_wins.sql
\*                                           upsert_shopify_orders, the write every path above goes through
\*   src/app/api/shopify/webhooks/route.ts   orders/* call fetchAndUpsertOrder; orders/delete marks deleted
\*   src/lib/portal/admin/refresh.ts         refresh after admin page loads and "Sync now"
\*   src/lib/portal/admin/details.ts         staff opening an order not yet copied fetches and writes it
\*
\* Fixed = TRUE is the code on branch fix/shopify-copy: a write replaces a stored order only when
\* Shopify's updated_at is the same or newer and never clears a delete (upsert_shopify_orders), and the
\* refresh keeps its own starting point in shopify_sync_state, set to the time it asked Shopify less the
\* 60-second overlap (not when it finished, and not the newest stored time).
\* Fixed = FALSE is main at 96e6068, before the fix: upsertShopifyOrder upserted on shopify_id with no
\* compare, orderRow set deleted_at to null on every write, and the refresh started from the newest
\* stored shopify_updated_at minus 60 seconds.
\*
\* Abstractions: two orders. O exists and is edited or deleted; N is a new order. Time is a tick, and
\* a change gets the next tick as its updated_at; Idle lets time pass. The 60-second overlap is one tick.
\* Webhooks may or may not be registered (refresh.ts says so). With Webhooks, O's update webhook is a
\* slow fetch-then-write, deletes are marked at once, and N's create webhook copies it at once.
EXTENDS Naturals

CONSTANTS Fixed, Webhooks, MaxEvents

Orders == {"O", "N"}
None == [ver |-> 0, upd |-> 0, gone |-> FALSE]

VARIABLES
    shop,       \* shop[o]: the order in Shopify (ver 0 = not created yet)
    clock,
    copy,       \* copy[o]: shopify_orders (ver 0 = not copied)
    cursor,     \* Fixed only: the refresh's own cursor
    hook,       \* what O's update webhook fetched
    hookState,  \* "idle", "fetched", "done"
    pull,       \* what the running refresh fetched, per order
    pullState,  \* "idle", "fetched", "done"
    pulledAt,   \* the time the running refresh asked Shopify
    events,     \* Shopify changes and idle ticks so far (bound)
    undeleted,  \* a write cleared a delete that Shopify still has
    wentBack    \* a write replaced a newer copy with an older one

vars == <<shop, clock, copy, cursor, hook, hookState, pull, pullState, pulledAt, events, undeleted, wentBack>>
copyFlags == <<copy, undeleted, wentBack>>
runs == <<hook, hookState, pull, pullState, pulledAt>>

Init ==
    /\ shop = [o \in Orders |-> IF o = "O" THEN [ver |-> 1, upd |-> 1, gone |-> FALSE] ELSE None]
    /\ clock = 1
    /\ copy = [o \in Orders |-> IF o = "O" THEN [ver |-> 1, upd |-> 1, gone |-> FALSE] ELSE None]
    /\ cursor = 1
    /\ hook = None /\ hookState = "idle"
    /\ pull = [o \in Orders |-> None] /\ pullState = "idle" /\ pulledAt = 0
    /\ events = 0
    /\ undeleted = FALSE /\ wentBack = FALSE

Newest == CHOOSE m \in {copy[o].upd : o \in Orders} : \A o \in Orders : copy[o].upd <= m
From == IF Fixed THEN cursor ELSE Newest

\* One write of a fetched order. Fixed: only if the same or newer, and never over a delete. A tick names
\* one version of an order, so the same tick writes the same version again.
Write(o, got) ==
    /\ copy' = IF ~Fixed \/ (got.upd >= copy[o].upd /\ ~copy[o].gone)
               THEN [copy EXCEPT ![o] = [ver |-> got.ver, upd |-> got.upd, gone |-> FALSE]]
               ELSE copy
    /\ undeleted' = (undeleted \/ (copy[o].gone /\ ~copy'[o].gone /\ shop[o].gone))
    /\ wentBack' = (wentBack \/ copy'[o].ver < copy[o].ver)

\* Shopify changes. Each takes the next tick.
EditO ==
    /\ events < MaxEvents /\ shop["O"].ver > 0 /\ ~shop["O"].gone
    /\ clock' = clock + 1 /\ events' = events + 1
    /\ shop' = [shop EXCEPT !["O"] = [ver |-> @.ver + 1, upd |-> clock + 1, gone |-> FALSE]]
    /\ UNCHANGED <<copyFlags, cursor, runs>>
DeleteO ==
    /\ events < MaxEvents /\ ~shop["O"].gone
    /\ clock' = clock + 1 /\ events' = events + 1
    /\ shop' = [shop EXCEPT !["O"] = [ver |-> @.ver + 1, upd |-> clock + 1, gone |-> TRUE]]
    /\ copy' = IF Webhooks THEN [copy EXCEPT !["O"].gone = TRUE] ELSE copy
    /\ UNCHANGED <<cursor, runs, undeleted, wentBack>>
NewOrder ==
    /\ events < MaxEvents /\ shop["N"].ver = 0
    /\ clock' = clock + 1 /\ events' = events + 1
    /\ shop' = [shop EXCEPT !["N"] = [ver |-> 1, upd |-> clock + 1, gone |-> FALSE]]
    /\ copy' = IF Webhooks THEN [copy EXCEPT !["N"] = [ver |-> 1, upd |-> clock + 1, gone |-> FALSE]] ELSE copy
    /\ UNCHANGED <<cursor, runs, undeleted, wentBack>>
\* A minute passes with no changes.
Idle ==
    /\ events < MaxEvents
    /\ clock' = clock + 1 /\ events' = events + 1
    /\ UNCHANGED <<shop, copyFlags, cursor, runs>>

\* O's orders/updated webhook: fetchAndUpsertOrder asks Shopify, then writes (no write if deleted).
HookFetches ==
    /\ Webhooks /\ hookState = "idle" /\ shop["O"].ver > copy["O"].ver
    /\ hook' = shop["O"] /\ hookState' = "fetched"
    /\ UNCHANGED <<shop, clock, copyFlags, cursor, pull, pullState, pulledAt, events>>
HookWrites ==
    /\ hookState = "fetched"
    /\ IF hook.gone THEN UNCHANGED copyFlags ELSE Write("O", hook)
    /\ hook' = None /\ hookState' = "done"
    /\ UNCHANGED <<shop, clock, cursor, pull, pullState, pulledAt, events>>

\* Staff open an order that isn't copied yet (details.ts): fetch and write it at once.
StaffOpensNew ==
    /\ shop["N"].ver > 0 /\ copy["N"].ver = 0
    /\ Write("N", shop["N"])
    /\ UNCHANGED <<shop, clock, cursor, runs, events>>

\* The admin refresh: orders updated at or after (From - 1), deleted ones aside; written later.
RefreshFetches ==
    /\ pullState = "idle"
    /\ pull' = [o \in Orders |-> IF shop[o].ver > 0 /\ ~shop[o].gone /\ shop[o].upd >= From - 1 THEN shop[o] ELSE None]
    /\ pullState' = "fetched" /\ pulledAt' = clock
    /\ UNCHANGED <<shop, clock, copyFlags, cursor, hook, hookState, events>>
RefreshWrites ==
    /\ pullState = "fetched"
    /\ \E o \in Orders :
         /\ pull[o] # None
         /\ Write(o, pull[o])
         /\ pull' = [pull EXCEPT ![o] = None]
    /\ UNCHANGED <<shop, clock, cursor, hook, hookState, pullState, pulledAt, events>>
RefreshEnds ==
    /\ pullState = "fetched" /\ \A o \in Orders : pull[o] = None
    /\ pullState' = "done"
    /\ cursor' = IF Fixed THEN pulledAt ELSE cursor
    /\ UNCHANGED <<shop, clock, copyFlags, hook, hookState, pull, pulledAt, events>>

\* The next admin page load starts another refresh.
NextRefresh ==
    /\ pullState = "done" /\ hookState # "fetched"
    /\ \E o \in Orders : copy[o].ver # shop[o].ver /\ ~(shop[o].gone /\ copy[o].gone)
    /\ pullState' = "idle"
    /\ UNCHANGED <<shop, clock, copyFlags, cursor, hook, hookState, pull, pulledAt, events>>

Quiet == pullState \in {"idle", "done"} /\ hookState # "fetched"
Finished ==
    /\ Quiet /\ ~ENABLED NextRefresh /\ ~ENABLED HookFetches /\ ~ENABLED RefreshFetches
    /\ UNCHANGED vars

Next ==
    \/ EditO \/ DeleteO \/ NewOrder \/ Idle
    \/ HookFetches \/ HookWrites \/ StaffOpensNew
    \/ RefreshFetches \/ RefreshWrites \/ RefreshEnds \/ NextRefresh
    \/ Finished

Spec == Init /\ [][Next]_vars

\* Rules
\* Our copy of an order never goes back to an older version.
NeverGoesBack == ~wentBack
\* An order deleted in Shopify stays deleted in our copy.
DeletedStaysDeleted == ~undeleted
\* When nothing is running, any order behind Shopify will be fetched by the next refresh.
NothingLeftBehind ==
    Quiet => \A o \in Orders :
        copy[o].ver = shop[o].ver \/ shop[o].gone \/ shop[o].upd >= From - 1
====
