type Rows<T> = Record<string, T>;
type Vars = {
  used: Rows<boolean>;
  dealer: Rows<string>;
  key: Rows<string>;
  email: Rows<string>;
  address: Rows<string>;
  phone: Rows<string>;
  edited: Rows<boolean>;
  sheet: string;
  imports: number;
  redirect: Record<string, number>;
  shared: string;
  sharedFor: string;
};

export const title = "Contractor pages: the dealer-list import and admin edits";

const live = (v: Vars) => Object.keys(v.used).filter((i) => v.used[i]);
const pages = (v: Vars, d: string) => live(v).filter((i) => v.dealer[i] === d).length;

const opens = (v: Vars, s: string) => {
  const row = live(v).find((i) => v.address[i] === s);
  if (row) return v.dealer[row];
  const to = v.redirect[s];
  return to ? v.dealer[String(to)] : "nobody";
};

export const state = (v: Vars) => {
  const d = pages(v, "D");
  let label = d === 0 ? "The dealer has no page" : d === 1 ? "The dealer has a page" : "The dealer has two pages";
  if (pages(v, "E") > 0) label += d === 0 ? ", but the other contact at the company has one" : ", and so does the other contact at the company";
  if (live(v).some((i) => v.edited[i] && v.phone[i] !== "admin")) label += ", and an admin's edit was undone";
  if (v.shared !== "none") {
    const to = opens(v, v.shared);
    label +=
      to === v.sharedFor ? "; a shared link works" : to === "nobody" ? "; a shared link is dead" : "; a shared link opens the other contact's page";
  }
  return label;
};

export const group = (v: Vars) => {
  const broken =
    pages(v, "D") > 1 ||
    live(v).some((i) => v.edited[i] && v.phone[i] !== "admin") ||
    (v.shared !== "none" && opens(v, v.shared) !== v.sharedFor);
  return broken ? "Wrong" : pages(v, "D") === 0 ? "Not listed" : "Listed";
};

export const colors = {
  "Not listed": "tan",
  Listed: "teal",
  Wrong: "pink",
};

export const step = (action: string, from: Vars, to: Vars) => {
  switch (action) {
    case "Import": {
      if (pages(to, "D") > pages(from, "D")) return "the import adds a page for the dealer";
      if (live(to).some((i) => from.key[i] !== to.key[i])) return "the import links the dealer to the page an admin added";
      if (live(to).some((i) => from.phone[i] !== to.phone[i])) return "the import rewrites the dealer's details";
      return "the import runs";
    }
    case "EmailChanges":
      return "the dealer's email changes on the sheet";
    case "AdminEditsPhone":
      return "an admin changes a phone number";
    case "AdminRenames":
      return "an admin renames a page address";
    case "AdminAddsDealer":
      return "an admin adds the dealer by hand";
    case "AdminAddsOtherContact":
      return "an admin adds another contact at the same company";
    case "Shares":
      return "someone shares a page's address";
    default:
      return null;
  }
};
