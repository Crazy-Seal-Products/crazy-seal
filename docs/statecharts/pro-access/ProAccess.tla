---- MODULE ProAccess ----
\* Who can get into a Pro Hub account: the pro who owns the email, or a stranger who only knows it.
\*
\* Code this model describes:
\*   src/app/api/pro/auth/signup/route.ts      sign-up
\*   src/lib/pro/auth.ts                       createMagicLink, consumeMagicLink, setPasswordHash,
\*                                             createSession, endAllSessions
\*   src/app/api/pro/auth/callback/route.ts    a link that signs the pro in
\*   src/app/api/pro/auth/reset/route.ts       a link that sets the password (from /pro/forgot/, and
\*                                             when Fixed, the link sign-up sends)
\*
\* Fixed = FALSE is main at 96e6068: sign-up sets a password and signs in when the email has none,
\* using a link is a read and then an unconditional update, and a reset leaves other sessions alone.
\* Fixed = TRUE is branch fix/pro-access-signup: sign-up only emails a link, the password is set
\* when that link is used, using a link is one conditional update (used_at is null) so it works
\* once, and setting a password from a link ends every other session.
\*
\* TakenOver = TRUE starts from an account a stranger already took over (their password and one
\* of their sessions), as the old code may have left some, to check what the fixed code does then.
\*
\* Abstractions: one email address and one link. The owner can read its inbox; the stranger can't.
\* A link is used in two steps (a request arrives with it while it is unused, then marks it used).
EXTENDS Naturals

CONSTANTS Fixed, TakenOver

People == {"Owner", "Stranger"}
Openers == {"Tab1", "Tab2"}

VARIABLES
    password,     \* whose password the account has: "none", "Owner" or "Stranger"
    link,         \* the link in the owner's inbox: "none", "unused" or "used"
    opening,      \* opening[t]: request t arrived with the link while it was unused
    sessions,     \* sessions[p]: how many sessions person p holds
    fromLink      \* sign-ins the one link has given

vars == <<password, link, opening, sessions, fromLink>>

Init ==
    /\ password = IF TakenOver THEN "Stranger" ELSE "none"
    /\ link = "none"
    /\ opening = [t \in Openers |-> FALSE]
    /\ sessions = [p \in People |-> IF TakenOver /\ p = "Stranger" THEN 1 ELSE 0]
    /\ fromLink = 0

\* signup/route.ts, only when the email has no password. Before the fix: set the password and sign
\* in at once. Fixed: only email a link to the address; whoever reads the inbox continues.
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

\* The owner asks for a sign-in or reset link (createMagicLink); it goes to the inbox.
OwnerRequestsLink ==
    /\ link = "none"
    /\ link' = "unused"
    /\ UNCHANGED <<password, opening, sessions, fromLink>>

\* A request arrives with the link while it is unused. Only the owner has it, but two requests can
\* carry it at once (two tabs, or a mail scanner opening it first).
OpensLink(t) ==
    /\ link = "unused"
    /\ ~opening[t]
    /\ opening' = [opening EXCEPT ![t] = TRUE]
    /\ UNCHANGED <<password, link, sessions, fromLink>>

\* The request marks the link used and signs the owner in, either straight away (callback/route.ts)
\* or after setting a password (reset/route.ts). Before the fix the update is by id only, so a request
\* that read the link while unused always gets a session. Fixed: the update is conditional on used_at
\* still being null, so the request that loses does nothing, and setting a password first ends every
\* session the account has.
FinishesLink(t, setsPassword) ==
    /\ opening[t]
    /\ opening' = [opening EXCEPT ![t] = FALSE]
    /\ IF Fixed /\ link = "used"
       THEN UNCHANGED <<link, sessions, fromLink, password>>
       ELSE /\ link' = "used"
            /\ fromLink' = fromLink + 1
            /\ password' = IF setsPassword THEN "Owner" ELSE password
            /\ sessions' = IF Fixed /\ setsPassword
                           THEN [p \in People |-> IF p = "Owner" THEN 1 ELSE 0]
                           ELSE [sessions EXCEPT !["Owner"] = @ + 1]

\* A stranger who knows the email signs in with the password they set.
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
    \/ \E t \in Openers, s \in BOOLEAN : FinishesLink(t, s)
    \/ StrangerSignsIn
    \/ Done

Spec == Init /\ [][Next]_vars

\* Rules
\* Only the person who controls the email gets into its account.
OnlyTheOwnerGetsIn == sessions["Stranger"] = 0
\* A link signs someone in at most once.
LinkWorksOnce == fromLink <= 1
\* The owner can always get in by email: no one else ever owns the password.
OwnerKeepsTheAccount == password \in {"none", "Owner"}
\* Once the pro has set the password from a link, no one else is still signed in.
AResetLocksOthersOut == password = "Owner" => sessions["Stranger"] = 0
====
