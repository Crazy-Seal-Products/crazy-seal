type Order = { ver: number; upd: number; gone: boolean };
type Vars = {
  shop: Record<string, Order>;
  copy: Record<string, Order>;
  cursor: number;
  undeleted: boolean;
  wentBack: boolean;
};

export const title = "Crazy Seal's copy of Shopify orders";

const newest = (v: Vars) => Math.max(...Object.values(v.copy).map((o) => o.upd));

// The worst order decides the label: deleted ones that came back, then ones no refresh will fetch.
export const state = (v: Vars) => {
  const orders = Object.keys(v.shop).filter((o) => v.shop[o].ver > 0);
  let label = "Our copy matches Shopify";
  for (const o of orders) {
    const s = v.shop[o];
    const c = v.copy[o];
    if (s.gone && !c.gone && c.ver > 0) { label = "An order deleted in Shopify is still in our copy"; break }
    if (!s.gone && c.ver !== s.ver) {
      label = s.upd >= newest(v) - 1 ? "An order is behind Shopify, the next refresh will fetch it" : "An order is behind Shopify, and no refresh will fetch it";
    }
  }
  if (v.undeleted) label += ", after a delete was undone";
  if (v.wentBack) label += ", after an older copy overwrote a newer one";
  return label;
};

export const group = (v: Vars) => (v.undeleted || v.wentBack ? "Wrong" : state(v) === "Our copy matches Shopify" ? "Up to date" : "Catching up");

export const colors = {
  "Up to date": "teal",
  "Catching up": "blue",
  Wrong: "pink",
};

export const step = (action: string) => {
  switch (action) {
    case "EditO":
      return "an order changes in Shopify";
    case "DeleteO":
      return "the order is deleted in Shopify";
    case "NewOrder":
      return "a new order comes in";
    case "Idle":
      return "a minute passes";
    case "HookFetches":
      return "the update webhook asks Shopify for the order";
    case "HookWrites":
      return "the webhook writes what it got";
    case "StaffOpensNew":
      return "staff open the new order, which copies it";
    case "RefreshFetches":
      return "an admin page load starts a refresh";
    case "RefreshWrites":
      return "the refresh writes an order it fetched earlier";
    case "RefreshEnds":
      return "the refresh finishes";
    case "NextRefresh":
      return "the next admin page load starts a refresh";
    default:
      return null;
  }
};
