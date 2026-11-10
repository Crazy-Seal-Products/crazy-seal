---- MODULE QuoteRequests ----
\* A quote request from a contractor's page (/contractor/<address>): the visitor sends it, the
\* server saves it as a lead and answers, then emails the contractor and copies Crazy Seal's lead
\* inbox after the answer.
\*
\* Code this model describes (uncommitted working tree, 2026-11-10):
\*   src/components/contractor/QuoteForm.tsx      the form; it posts the page's address (slug)
\*   src/app/api/contractors/quote/route.ts       Turnstile, recordQuote, then after(notifyQuote)
\*   src/lib/contractors/quote.ts                 recordQuote (finds the listed contractor by slug,
\*                                                inserts the lead) and notifyQuote (contractor
\*                                                email, stamp, team copy; errors only logged)
\*   src/lib/portal/admin/contractor-actions.ts   saveContractor: an admin renames or hides a page
\*
\* Fixed = TRUE is the code as it is now (today.cfg); Fixed = FALSE is the code before the
\* 2026-11-10 fix (before.cfg). The fix: recordQuote also finds a contractor by an address they
\* used to have (contractor_redirects), and a request nobody was told about (no
\* contractor_notified_at and no quote_team_notified_at) is sent again by resendUnsentQuotes, from
\* the daily cron /api/cron/contractor-quotes or Send again in the admin, instead of being dropped.
\* (The cron route needs no CRON_SECRET; resendUnsentQuotes tries each request at most once an hour
\* and claims each try first. Neither is modeled: here a queued request is retried without limit.)
\*
\* Abstractions: one contractor with an email on file, one visitor, one request. "Mail" is Gmail:
\* each send either goes through or fails. The server can stop after answering and before its
\* after() work runs (a deploy or a crash).

CONSTANTS Fixed

VARIABLES
    address,    \* the contractor's page address now: "old" or "new"
    listed,     \* the page is public
    page,       \* the address of the page the visitor has open, or "none"
    request,    \* "none", "turnedAway", "rejected" (hidden), "saved", "queued" or "done"
    toThem,     \* the contractor got the email
    toTeam      \* Crazy Seal's lead inbox got the copy

vars == <<address, listed, page, request, toThem, toTeam>>

Init ==
    /\ address = "old"
    /\ listed = TRUE
    /\ page = "none"
    /\ request = "none"
    /\ toThem = FALSE
    /\ toTeam = FALSE

VisitorOpensPage ==
    /\ page = "none"
    /\ listed
    /\ page' = address
    /\ UNCHANGED <<address, listed, request, toThem, toTeam>>

\* saveContractor with a new page address.
AdminRenames ==
    /\ address = "old"
    /\ address' = "new"
    /\ UNCHANGED <<listed, page, request, toThem, toTeam>>

\* saveContractor with "Listed publicly" off.
AdminHides ==
    /\ listed
    /\ listed' = FALSE
    /\ UNCHANGED <<address, page, request, toThem, toTeam>>

\* The form posts the slug of the page it is on. recordQuote looks for a listed contractor with
\* that slug; none means a 404 ("isn't taking requests here right now"). Fixed: an address the
\* contractor used to have finds them too.
VisitorSends ==
    /\ page # "none"
    /\ request = "none"
    /\ request' =
        IF ~listed THEN "rejected"
        ELSE IF page = address \/ Fixed THEN "saved"
        ELSE "turnedAway"
    /\ UNCHANGED <<address, listed, page, toThem, toTeam>>

\* after(notifyQuote): the contractor email, then the team copy. Each send can fail; failures are
\* only logged. Fixed: when both fail the request stays queued for the scheduled job.
Notifies(contractorMail, teamMail) ==
    /\ request \in {"saved", "queued"}
    /\ toThem' = contractorMail
    /\ toTeam' = teamMail
    /\ request' = IF Fixed /\ ~contractorMail /\ ~teamMail THEN "queued" ELSE "done"
    /\ UNCHANGED <<address, listed, page>>

\* The server stops after answering the visitor, so after() never runs. Today nothing comes back
\* for the request. Fixed: it is still queued, since nobody was told about it.
ServerStops ==
    /\ request = "saved"
    /\ request' = IF Fixed THEN "queued" ELSE "done"
    /\ UNCHANGED <<address, listed, page, toThem, toTeam>>

\* End states: the request is settled, or the page was hidden before the visitor opened it.
Done ==
    /\ \/ request \in {"turnedAway", "rejected", "done"}
       \/ page = "none" /\ ~listed
    /\ UNCHANGED vars

Next ==
    \/ VisitorOpensPage
    \/ AdminRenames
    \/ AdminHides
    \/ VisitorSends
    \/ \E c, t \in BOOLEAN : Notifies(c, t)
    \/ ServerStops
    \/ Done

Spec == Init /\ [][Next]_vars

\* Rules
\* A visitor on a listed contractor's page can always send them a request.
ListedPagesTakeRequests == request # "turnedAway"
\* Every saved request reaches the contractor, or Crazy Seal is told about it.
NoRequestIsLost == request = "done" => (toThem \/ toTeam)
====
