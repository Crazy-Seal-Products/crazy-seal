type Vars = {
  password: string;
  link: string;
  sessions: Record<string, number>;
  fromLink: number;
};

export const title = "Who can get into a Pro Hub account";

export const state = (v: Vars) => {
  let label =
    v.password === "Stranger" ? "A stranger set the password" : v.password === "Owner" ? "The pro set the password" : v.link === "unused" ? "No password, a sign-in link is in the pro's inbox" : "No password yet";
  if (v.sessions.Stranger > 0 && v.sessions.Owner > 0) label += ", and both the stranger and the pro are signed in";
  else if (v.sessions.Stranger > 0) label += ", and the stranger is signed in";
  else if (v.sessions.Owner > 0) label += ", and the pro is signed in";
  if (v.fromLink > 1) label += " twice from one link";
  return label;
};

export const group = (v: Vars) => (v.sessions.Stranger > 0 ? "Taken over" : v.sessions.Owner > 0 ? "Signed in" : "Signed out");

export const colors = {
  "Signed out": "tan",
  "Signed in": "teal",
  "Taken over": "pink",
};

export const step = (action: string, from: Vars, to: Vars) => {
  switch (action) {
    case "SignsUp":
      return to.password === "Stranger" ? "a stranger signs up with the pro's email" : to.password === "Owner" ? "the pro signs up" : "someone signs up, so a link is emailed to the address";
    case "OwnerRequestsLink":
      return "the pro asks for a sign-in link";
    case "OpensLink":
      return "the link is opened";
    case "FinishesLink":
      if (to.fromLink === from.fromLink) return "the link was already used, so nothing happens";
      if (to.password !== from.password)
        return to.sessions.Stranger < from.sessions.Stranger ? "the pro sets a password from the link, which signs everyone else out" : "the pro sets a password from the link";
      return "the link signs the pro in";
    case "StrangerSignsIn":
      return "the stranger signs in with their password";
    default:
      return null;
  }
};
