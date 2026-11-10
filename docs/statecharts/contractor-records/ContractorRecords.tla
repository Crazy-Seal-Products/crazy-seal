---- MODULE ContractorRecords ----
\* Contractor records: the dealer-list import and the admin's edits, and what they do to the public
\* pages at /contractor/<page address>.
\*
\* Code this model describes (uncommitted working tree on codex/erics-machine, 2026-11-10):
\*   scripts/import-contractors.mjs              matches each sheet row on import_key (segment, email
\*                                               or name, home state) and writes its listed fields
\*                                               except those in edited_fields; else links a
\*                                               same-email contractor no sheet row owns; else holds
\*                                               a row whose company (or name and state) is listed;
\*                                               else inserts a row with an address no one has or had
\*   src/lib/portal/admin/contractor-actions.ts  createContractor (no import_key; marks the fields the
\*                                               admin filled as edited) and saveContractor (adds the
\*                                               fields it changes to edited_fields; a new address
\*                                               keeps the old one in contractor_redirects)
\*   src/lib/contractors/data.ts                 getPublicContractor, and currentAddressFor, which the
\*                                               page uses to redirect an old address
\*
\* Fixed = TRUE is the code as it is now (today.cfg). Fixed = FALSE is the code before the
\* 2026-11-10 fix (before.cfg):
\*   1. the import leaves a field alone once an admin has changed it;
\*   2. when no row has the sheet row's key, the import links the key to a contractor with the same
\*      email; when one has the same company it holds the row for an admin to review; only
\*      otherwise does it add a page;
\*   3. renaming a page address keeps the old address as a redirect to the same contractor, and an
\*      address that redirects is never given to anyone else.
\* The code adds two refinements the model's two rows don't need: the email link only takes a row
\* whose key no sheet row has (so one email listed in two states keeps two pages), and a row whose
\* name and state match a listed contractor is held like a same-company one.
\*
\* Abstractions: dealer D is on the sheet. Dealer E, another contact at the same company (so the
\* code makes the same address from the name), is only ever added by hand. Two rows are enough for
\* every bug path. One listed field, the phone, stands for all of them. "a", "a2", "a3" are the
\* addresses the code makes from the company name, in the order it tries them; "b" is one an admin
\* types. The import runs at most MaxImports times.
EXTENDS Naturals, FiniteSets

CONSTANTS Fixed, MaxImports

Rows == 1..2
Dealers == {"D", "E"}
Made == <<"a", "a2", "a3">>
Addresses == {"a", "a2", "a3", "b"}

VARIABLES
    used,        \* used[i]: row i exists
    dealer,      \* dealer[i]: whose row it is, "D" or "E"
    key,         \* key[i]: its import_key, "none" or the sheet email it was matched on
    email,       \* email[i]: "old", "new" (D's two emails) or "e"
    address,     \* address[i]: its page address
    phone,       \* phone[i]: "sheet" (as on the sheet) or "admin" (as an admin typed it)
    edited,      \* edited[i]: an admin set its phone
    sheet,       \* the email on D's sheet row: "old", then maybe "new"
    imports,     \* how many times the import has run
    redirect,    \* redirect[s]: the row an old address leads to (Fixed only), 0 for none
    shared,      \* the address someone shared, "none" before that
    sharedFor    \* whose page that address was when it was shared

vars == <<used, dealer, key, email, address, phone, edited, sheet, imports, redirect, shared, sharedFor>>

Init ==
    /\ used = [i \in Rows |-> FALSE]
    /\ dealer = [i \in Rows |-> "D"]
    /\ key = [i \in Rows |-> "none"]
    /\ email = [i \in Rows |-> "old"]
    /\ address = [i \in Rows |-> "a"]
    /\ phone = [i \in Rows |-> "sheet"]
    /\ edited = [i \in Rows |-> FALSE]
    /\ sheet = "old"
    /\ imports = 0
    /\ redirect = [s \in Addresses |-> 0]
    /\ shared = "none"
    /\ sharedFor = "D"

Live == {i \in Rows : used[i]}

\* Addresses no new page may take: those in use, and (Fixed) those that redirect.
Taken == {address[i] : i \in Live} \cup (IF Fixed THEN {s \in Addresses : redirect[s] # 0} ELSE {})

CanMake == \E n \in 1..3 : Made[n] \notin Taken
\* uniqueSlug in the import and in createContractor: the first address made from the name that is free.
MadeAddress == Made[CHOOSE n \in 1..3 : Made[n] \notin Taken /\ \A m \in 1..3 : m < n => Made[m] \in Taken]

CanInsert == (\E i \in Rows : ~used[i]) /\ CanMake
NewRow == CHOOSE i \in Rows : ~used[i] /\ \A j \in Rows : j < i => used[j]

\* A new row. One an admin adds by hand has the phone the admin typed.
Insert(d, k, e) ==
    LET i == NewRow IN
    /\ used' = [used EXCEPT ![i] = TRUE]
    /\ dealer' = [dealer EXCEPT ![i] = d]
    /\ key' = [key EXCEPT ![i] = k]
    /\ email' = [email EXCEPT ![i] = e]
    /\ address' = [address EXCEPT ![i] = MadeAddress]
    /\ phone' = [phone EXCEPT ![i] = IF k = "none" THEN "admin" ELSE "sheet"]
    /\ edited' = [edited EXCEPT ![i] = (k = "none")]

\* The import writes the sheet's listed fields into row i. Fixed: not a field an admin changed.
Rewrite(i) ==
    /\ phone' = IF Fixed /\ edited[i] THEN phone ELSE [phone EXCEPT ![i] = "sheet"]
    /\ email' = [email EXCEPT ![i] = sheet]

\* scripts/import-contractors.mjs, for D's sheet row.
Import ==
    /\ imports < MaxImports
    /\ imports' = imports + 1
    /\ LET match == {i \in Live : key[i] = sheet}
           sameEmail == {i \in Live : email[i] = sheet}
           sameCompany == Live
       IN IF match # {}
          THEN /\ Rewrite(CHOOSE i \in match : TRUE)
               /\ UNCHANGED <<used, dealer, key, address, edited>>
          ELSE IF Fixed /\ sameEmail # {}
          THEN LET i == CHOOSE i \in sameEmail : TRUE IN
               /\ key' = [key EXCEPT ![i] = sheet]
               /\ Rewrite(i)
               /\ UNCHANGED <<used, dealer, address, edited>>
          ELSE IF Fixed /\ sameCompany # {}
          THEN UNCHANGED <<used, dealer, key, email, address, phone, edited>>
          ELSE /\ CanInsert
               /\ Insert("D", sheet, sheet)
    /\ UNCHANGED <<sheet, redirect, shared, sharedFor>>

\* The dealer's email changes on the sheet before the next import.
EmailChanges ==
    /\ sheet = "old"
    /\ sheet' = "new"
    /\ UNCHANGED <<used, dealer, key, email, address, phone, edited, imports, redirect, shared, sharedFor>>

\* saveContractor with a new phone.
AdminEditsPhone(i) ==
    /\ used[i]
    /\ ~edited[i]
    /\ phone' = [phone EXCEPT ![i] = "admin"]
    /\ edited' = [edited EXCEPT ![i] = TRUE]
    /\ UNCHANGED <<used, dealer, key, email, address, sheet, imports, redirect, shared, sharedFor>>

\* saveContractor with a new page address; it checks the address is free.
AdminRenames(i) ==
    /\ used[i]
    /\ "b" \notin Taken
    /\ address' = [address EXCEPT ![i] = "b"]
    /\ redirect' = IF Fixed THEN [redirect EXCEPT ![address[i]] = i] ELSE redirect
    /\ UNCHANGED <<used, dealer, key, email, phone, edited, sheet, imports, shared, sharedFor>>

\* createContractor with the address left blank. An admin adds D only after checking the list.
AdminAddsDealer ==
    /\ ~\E i \in Live : dealer[i] = "D"
    /\ CanInsert
    /\ Insert("D", "none", sheet)
    /\ UNCHANGED <<sheet, imports, redirect, shared, sharedFor>>

AdminAddsOtherContact ==
    /\ ~\E i \in Live : dealer[i] = "E"
    /\ CanInsert
    /\ Insert("E", "none", "e")
    /\ UNCHANGED <<sheet, imports, redirect, shared, sharedFor>>

\* Someone shares a page's address (a card, a text, a Google listing).
Shares(i) ==
    /\ shared = "none"
    /\ used[i]
    /\ shared' = address[i]
    /\ sharedFor' = dealer[i]
    /\ UNCHANGED <<used, dealer, key, email, address, phone, edited, sheet, imports, redirect>>

Done ==
    /\ imports = MaxImports \/ ~CanInsert
    /\ UNCHANGED vars

Next ==
    \/ Import
    \/ EmailChanges
    \/ \E i \in Rows : AdminEditsPhone(i)
    \/ \E i \in Rows : AdminRenames(i)
    \/ AdminAddsDealer
    \/ AdminAddsOtherContact
    \/ \E i \in Rows : Shares(i)
    \/ Done

Spec == Init /\ [][Next]_vars

\* Whose page an address opens: the row that has it, else (Fixed) the row it redirects to.
Opens(s) ==
    IF \E i \in Live : address[i] = s THEN dealer[CHOOSE i \in Live : address[i] = s]
    ELSE IF redirect[s] # 0 THEN dealer[redirect[s]]
    ELSE "nobody"

\* Rules
\* A dealer never ends up with two pages.
OnePagePerDealer == \A d \in Dealers : Cardinality({i \in Live : dealer[i] = d}) <= 1
\* A later import never undoes an admin's change.
AdminEditsStick == \A i \in Live : edited[i] => phone[i] = "admin"
\* An address someone shared keeps opening that contractor's page.
SharedLinksKeepWorking == shared = "none" \/ Opens(shared) = sharedFor
\* No two pages have the same address.
AddressesUnique == \A i, j \in Live : i # j => address[i] # address[j]
====
