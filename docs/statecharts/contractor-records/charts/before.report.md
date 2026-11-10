# ContractorRecords

TLC reached 978 states, more than the chart budget of 500, so the chart draws only the bug paths: 6 states and 6 arrows.

## OnePagePerDealer breaks
The shortest path has 2 steps:
0. The dealer has no page
1. an admin adds the dealer by hand: The dealer has a page
2. the import adds a page for the dealer: The dealer has two pages

## AdminEditsStick breaks
The shortest path has 3 steps:
0. The dealer has no page
1. the import adds a page for the dealer: The dealer has a page
2. an admin changes a phone number: The dealer has a page
3. the import rewrites the dealer's details: The dealer has a page, and an admin's edit was undone

## SharedLinksKeepWorking breaks
The shortest path has 3 steps:
0. The dealer has no page
1. the import adds a page for the dealer: The dealer has a page
2. someone shares a page's address: The dealer has a page; a shared link works
3. an admin renames a page address: The dealer has a page; a shared link is dead

## Rules that hold
AddressesUnique, NoDeadlock
