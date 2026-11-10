---- MODULE ViewAs ----
\* "View as": an admin opens a dealer's Pro Hub, read-only, from the Crazy Seal Admin.
\*
\* Code this model describes (working tree on codex/erics-machine, 2026-11-10):
\*   src/lib/pro/view-as.ts                  startViewAs, getViewAs, endViewAs, the signed cookie
\*   src/app/api/admin/view-as/route.ts      the View as button (account or roster customer)
\*   src/app/api/pro/auth/logout/route.ts    the Pro Hub's "Exit admin view" button
\*   src/app/api/pro/me/route.ts             every Pro Hub page load
\*   src/lib/pro/context.ts                  loadProContext, which syncs pro_users from Shopify
\*   src/app/api/pro/**                      write routes, which refuse while isViewingAs()
\*
\* Fixed = TRUE is the code now (today.cfg). Fixed = FALSE is the code before the 2026-11-10 fix
\* (before.cfg). The fix:
\*   1. loadProContext skips its pro_users sync while isViewingAs().
\*   2. getViewAs (viewedUser), on a base view, looks for the dealer's account first and shows that.
\*   3. "Exit admin view" (the logout route, when hasViewAsCookie()) runs endViewAs, which always
\*      deletes the view cookie and logs the exit for the admin the cookie names (logEnd).
\*   4. startViewAs logs an exit (logEnd) for the view it replaces.
\*
\* Abstractions: one browser. Admins A and B take turns signing in to the admin there; A opens the
\* views and can lose View as, and B shows what another admin in the same browser gets. Two dealers: Mike has a Pro Hub account whose stored details lag the Shopify copy
\* (so a page load syncs them, once); Ruth is on the roster with no account until she signs up.
\* "Exit pressed" is tracked only while the cookie it failed to remove is still in the browser.
\* The cookie's hour runs out in one step, and the browser drops it then. The log can tell an
\* expired view ended (it started an hour earlier), so expiry closes its log entry.
EXTENDS Naturals

CONSTANTS Fixed

Admins == {"A", "B"}
Targets == {"mike", "ruthBase", "ruthAccount"}

VARIABLES
    signedIn,       \* who is signed in to the admin in this browser: "none", "A" or "B"
    aAllowed,       \* A's role still includes View as
    cookieBy,       \* the view cookie names this admin; "none" when there is no cookie
    target,         \* whose Pro Hub the cookie opens
    ruthAccount,    \* Ruth has signed up for a Pro Hub account
    changedInView,  \* a page load during a view synced Mike's account (after that it matches the copy)
    staleBase,      \* a page showed Ruth's no-account base view after she had an account
    leaked,         \* a page showed a dealer's Pro Hub to someone the view wasn't for
    exited,         \* "Exit admin view" was pressed and the cookie is still there
    logOpen         \* View as starts in admin_view_as_log with no exit and no expiry yet

vars == <<signedIn, aAllowed, cookieBy, target, ruthAccount, changedInView, staleBase, leaked, exited, logOpen>>

Allowed(a) == IF a = "A" THEN aAllowed ELSE TRUE

\* getViewAs: a valid cookie, the admin it names signed in, and their role allows View as.
Usable == cookieBy # "none" /\ signedIn = cookieBy /\ Allowed(cookieBy)

Init ==
    /\ signedIn = "none"
    /\ aAllowed = TRUE
    /\ cookieBy = "none"
    /\ target = "mike"
    /\ ruthAccount = FALSE
    /\ changedInView = FALSE
    /\ staleBase = FALSE
    /\ leaked = FALSE
    /\ exited = FALSE
    /\ logOpen = 0

SignsIn(a) ==
    /\ signedIn = "none"
    /\ signedIn' = a
    /\ UNCHANGED <<aAllowed, cookieBy, target, ruthAccount, changedInView, staleBase, leaked, exited, logOpen>>

\* adminSignOut ends the admin session only; the view cookie stays in the browser.
SignsOut ==
    /\ signedIn # "none"
    /\ signedIn' = "none"
    /\ UNCHANGED <<aAllowed, cookieBy, target, ruthAccount, changedInView, staleBase, leaked, exited, logOpen>>

\* A Super admin unticks View as for A's role.
LosesViewAs ==
    /\ aAllowed
    /\ aAllowed' = FALSE
    /\ UNCHANGED <<signedIn, cookieBy, target, ruthAccount, changedInView, staleBase, leaked, exited, logOpen>>

\* The View as button: POST /api/admin/view-as. The route checks the admin and their role, then
\* sets the cookie (replacing any earlier one) and logs a start. For a roster customer it opens
\* their account if they have one, else the base view. Fixed: it logs an exit for the view it replaces.
StartsView(d) ==
    /\ signedIn = "A"
    /\ aAllowed
    /\ logOpen < 2
    /\ cookieBy' = signedIn
    /\ target' = IF d = "mike" THEN "mike" ELSE IF ruthAccount THEN "ruthAccount" ELSE "ruthBase"
    /\ logOpen' = IF Fixed /\ cookieBy # "none" THEN logOpen ELSE logOpen + 1
    /\ exited' = FALSE
    /\ UNCHANGED <<signedIn, aAllowed, ruthAccount, changedInView, staleBase, leaked>>

\* Ruth signs up for the Pro Hub (her own browser).
RuthSignsUp ==
    /\ ~ruthAccount
    /\ ruthAccount' = TRUE
    /\ UNCHANGED <<signedIn, aAllowed, cookieBy, target, changedInView, staleBase, leaked, exited, logOpen>>

\* The hour runs out and the browser drops the cookie.
CookieExpires ==
    /\ cookieBy # "none"
    /\ cookieBy' = "none"
    /\ logOpen' = 0
    /\ exited' = FALSE
    /\ UNCHANGED <<signedIn, aAllowed, target, ruthAccount, changedInView, staleBase, leaked>>

\* A Pro Hub page loads (GET /api/pro/me and the page's data routes). With a usable view it shows
\* the target's Pro Hub; otherwise it falls back to a Pro Hub session, which this browser lacks.
\* loadProContext writes pro_users when the stored Shopify id or name differ from the copy.
\* Fixed: no sync while viewing, and a base view whose dealer now has an account shows the account.
PageLoads ==
    /\ cookieBy # "none"
    /\ IF Usable
       THEN /\ LET shows == IF target = "ruthBase" /\ (Fixed /\ ruthAccount) THEN "ruthAccount" ELSE target IN
                 /\ staleBase' = (staleBase \/ (shows = "ruthBase" /\ ruthAccount))
                 /\ changedInView' = (changedInView \/ (shows = "mike" /\ ~Fixed))
            /\ leaked' = (leaked \/ ~(signedIn = cookieBy /\ Allowed(cookieBy)))
       ELSE UNCHANGED <<staleBase, changedInView, leaked>>
    /\ UNCHANGED <<signedIn, aAllowed, cookieBy, target, ruthAccount, exited, logOpen>>

\* A change from the Pro Hub tab (password, support request, warranty): each write route refuses
\* while isViewingAs(), and with no usable view there is no Pro Hub session to act as. Nothing changes.
TriesToChangeSomething ==
    /\ cookieBy # "none"
    /\ UNCHANGED vars

\* "Exit admin view": POST /api/pro/auth/logout. If the view is usable, endViewAs deletes the cookie
\* and logs the exit; otherwise the route ends a Pro Hub session and leaves the view cookie alone.
\* Fixed: it always deletes the view cookie and logs the exit for the admin the cookie names.
PressesExit ==
    /\ cookieBy # "none"
    /\ IF Usable \/ Fixed
       THEN /\ cookieBy' = "none"
            /\ logOpen' = IF logOpen > 0 THEN logOpen - 1 ELSE 0
            /\ exited' = FALSE
       ELSE /\ exited' = TRUE
            /\ UNCHANGED <<cookieBy, logOpen>>
    /\ UNCHANGED <<signedIn, aAllowed, target, ruthAccount, changedInView, staleBase, leaked>>

Next ==
    \/ \E a \in Admins : SignsIn(a)
    \/ SignsOut
    \/ LosesViewAs
    \/ \E d \in {"mike", "ruth"} : StartsView(d)
    \/ RuthSignsUp
    \/ CookieExpires
    \/ PageLoads
    \/ TriesToChangeSomething
    \/ PressesExit

Spec == Init /\ [][Next]_vars

\* Rules
\* Only the admin who started a view, while signed in and allowed View as, sees the dealer's Pro Hub through it.
OnlyTheStarterSees == ~leaked
\* Nothing changes a dealer's account while an admin views it.
NothingChangesWhileViewing == ~changedInView
\* Once the dealer has an account, View as stops showing the no-account base view.
NoBaseViewOnceTheyHaveAnAccount == ~staleBase
\* After "Exit admin view", the view can't be used again.
ExitEndsTheView == exited => ~Usable
\* The log shows every view that has ended: each start has an exit or has expired, except the view in the browser now.
LogShowsEveryView == logOpen <= (IF cookieBy # "none" THEN 1 ELSE 0)
====
