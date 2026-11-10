---- MODULE ProAccess ----
\* Who can get into a Pro Hub account: the pro who owns the email, or a stranger who only knows it.
\*
\* Code this model describes (Crazy-Seal-Products/crazy-seal main at 96e6068):
\*   src/app/api/pro/auth/signup/route.ts      sets a password and signs in when the email has none
\*   src/lib/pro/auth.ts                       createMagicLink, consumeMagicLink, setPasswordHash, createSession
\*   src/app/api/pro/auth/callback/route.ts    the sign-in link
\*
\* Fixed = FALSE is the code as it is. Fixed = TRUE is the proposed change: sign-up only emails a
\* link, the password is set when that link is used, and using a link is one conditional update
\* (used_at is null), so it works once.
\*
\* Abstractions: one email address. The owner can read its inbox; the stranger can't. A link is
\* used in two steps (read it while unused, then mark it used), as consumeMagicLink does.
EXTENDS Naturals

CONSTANTS Fixed

People == {"Owner", "Stranger"}
Openers == {"Tab1", "Tab2"}

VARIABLES
    password,     \* whose password the account has: "none", "Owner" or "Stranger"
    link,         \* the sign-in link in the owner's inbox: "none", "unused" or "used"
    opening,      \* opening[t]: a request reading the link has seen it unused
    sessions,     \* sessions[p]: how many sessions person p holds
    fromLink      \* sessions created from the one link

vars == <<password, link, opening, sessions, fromLink>>

Init ==
    /\ password = "none"
    /\ link = "none"
    /\ opening = [t \in Openers |-> FALSE]
    /\ sessions = [p \in People |-> 0]
    /\ fromLink = 0

\* signup/route.ts: if the email has no password, set one and sign in at once.
\* Fixed: sign-up only emails a link to the address; whoever reads the inbox continues.
SignsUp(p) ==
    /\ password = "none"
    /\ IF Fixed
       THEN /\ link = "none"
            /\ link' = "unused"
            /\ UNCHANGED <<password, sessions>>
       ELSE /\ password' = p
            /\ sessions' = [sessions EXCEPT ![p] = @ + 1]
            /\ UNCHANGED link
    /\ UNCHANGED <<opening, fromLink>>

\* The owner asks for a sign-in link (createMagicLink); it goes to the inbox.
OwnerRequestsLink ==
    /\ link = "none"
    /\ link' = "unused"
    /\ UNCHANGED <<password, opening, sessions, fromLink>>

\* consumeMagicLink, first half: select the link where used_at is null. Only the owner has it,
\* but two requests can carry it at once (two tabs, or a mail scanner opening it first).
OpensLink(t) ==
    /\ link = "unused"
    /\ ~opening[t]
    /\ opening' = [opening EXCEPT ![t] = TRUE]
    /\ UNCHANGED <<password, link, sessions, fromLink>>

\* Second half: mark it used (by id only), then create a session. Fixed: the update is conditional
\* on used_at still being null, and only the request that wins it gets a session.
FinishesLink(t) ==
    /\ opening[t]
    /\ opening' = [opening EXCEPT ![t] = FALSE]
    /\ IF Fixed /\ link = "used"
       THEN UNCHANGED <<link, sessions, fromLink, password>>
       ELSE /\ link' = "used"
            /\ sessions' = [sessions EXCEPT !["Owner"] = @ + 1]
            /\ fromLink' = fromLink + 1
            /\ password' = IF Fixed /\ password = "none" THEN "Owner" ELSE password

\* A stranger who knows the email tries to sign in with a password they set.
\* (They can't read the inbox, so they never hold a link.)
StrangerSignsIn ==
    /\ password = "Stranger"
    /\ sessions["Stranger"] < 2
    /\ sessions' = [sessions EXCEPT !["Stranger"] = @ + 1]
    /\ UNCHANGED <<password, link, opening, fromLink>>

Done ==
    /\ \A t \in Openers : ~opening[t]
    /\ UNCHANGED vars

Next ==
    \/ \E p \in People : SignsUp(p)
    \/ OwnerRequestsLink
    \/ \E t \in Openers : OpensLink(t)
    \/ \E t \in Openers : FinishesLink(t)
    \/ StrangerSignsIn
    \/ Done

Spec == Init /\ [][Next]_vars

\* Rules
\* Only the person who controls the email gets into its account.
OnlyTheOwnerGetsIn == sessions["Stranger"] = 0
\* A sign-in link signs someone in at most once.
LinkWorksOnce == fromLink <= 1
\* The owner can always get in by email: no one else ever owns the password.
OwnerKeepsTheAccount == password \in {"none", "Owner"}
====
