type Vars = {
  signedIn: string;
  aAllowed: boolean;
  cookieBy: string;
  target: string;
  ruthAccount: boolean;
  changedInView: boolean;
  staleBase: boolean;
  leaked: boolean;
  exited: boolean;
  logOpen: number;
};

export const title = "View as: an admin opens a dealer's Pro Hub, read-only";

const TARGET: Record<string, string> = {
  mike: "Mike's account",
  ruthBase: "Ruth's base page",
  ruthAccount: "Ruth's account",
};

const usable = (v: Vars) => v.cookieBy !== "none" && v.signedIn === v.cookieBy && (v.cookieBy !== "A" || v.aAllowed);

export const state = (v: Vars) => {
  let label: string;
  if (v.cookieBy === "none") {
    label = "No view open";
  } else {
    // Paused: the cookie is there, but A isn't the one signed in, or A's role lost View as.
    const what = v.target === "ruthBase" && v.ruthAccount ? "Ruth, opened before she signed up" : TARGET[v.target];
    label = `Viewing ${what}${usable(v) ? "" : ", paused"}`;
    if (v.exited) label += ", after Exit";
  }
  if (v.changedInView) label += "; Mike's account was changed";
  if (v.staleBase) label += "; base page shown to an account";
  if (v.logOpen > (v.cookieBy !== "none" ? 1 : 0)) label += "; a view is missing its end in the log";
  return label;
};

export const group = (v: Vars) => (v.cookieBy === "none" ? "No view" : usable(v) ? "Viewing" : "Paused");

export const colors = {
  "No view": "tan",
  Viewing: "teal",
  Paused: "yellow",
};

export const step = (action: string, from: Vars, to: Vars) => {
  switch (action) {
    case "SignsIn":
      return `${to.signedIn} signs in to the admin`;
    case "SignsOut":
      return `${from.signedIn} signs out of the admin`;
    case "LosesViewAs":
      return "A's role loses View as";
    case "StartsView":
      return `${to.signedIn} presses View as on ${to.target === "mike" ? "Mike" : "Ruth"}`;
    case "RuthSignsUp":
      return "Ruth signs up for the Pro Hub";
    case "CookieExpires":
      // Hidden: every view ends this way after an hour, the same as its Exit arrow.
      return null;
    case "PageLoads":
      if (to.changedInView && !from.changedInView) return "a Pro Hub page loads and syncs Mike's details";
      if (to.staleBase && !from.staleBase) return "a Pro Hub page loads the base page";
      return null;
    case "TriesToChangeSomething":
      return null;
    case "PressesExit":
      return to.cookieBy === "none" ? "Exit admin view" : "Exit admin view [while the view is paused]";
    default:
      return null;
  }
};
