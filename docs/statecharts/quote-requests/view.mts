type Vars = {
  address: string;
  listed: boolean;
  page: string;
  request: string;
  toThem: boolean;
  toTeam: boolean;
};

export const title = "A quote request from a contractor's page";

export const state = (v: Vars) => {
  switch (v.request) {
    case "none":
      if (v.page === "none") return v.listed ? "Contractor's page is live" : "Page hidden";
      return v.page === v.address ? "Visitor has the page open" : "Visitor has the page open at its old address";
    case "turnedAway":
      return "Visitor told the contractor isn't taking requests";
    case "rejected":
      return "Turned away: the page was hidden";
    case "saved":
      return "Saved, visitor told it's on its way, emails not sent yet";
    case "queued":
      return "Saved, nobody told yet, waiting to send again";
    default:
      return v.toThem ? "Contractor emailed" : v.toTeam ? "Crazy Seal told to pass it on" : "Saved, but nobody was ever told";
  }
};

export const group = (v: Vars) =>
  v.request === "done" || v.request === "queued" ? (v.toThem || v.toTeam ? "Delivered" : "Stuck") : v.request === "none" || v.request === "saved" ? "In progress" : "Turned away";

export const colors = { "In progress": "blue", Delivered: "teal", Stuck: "orange", "Turned away": "tan" };

export const step = (action: string, from: Vars, to: Vars) => {
  switch (action) {
    case "VisitorOpensPage":
      return "a visitor opens the page";
    case "AdminRenames":
      return "an admin changes the page address";
    case "AdminHides":
      return "an admin hides the page";
    case "VisitorSends":
      return "the visitor sends the form";
    case "Notifies":
      if (to.toThem) return "the email to the contractor goes out";
      if (to.toTeam) return "the contractor email fails, the copy to Crazy Seal goes out";
      return from.request === "queued" ? "the retry fails again" : "both emails fail";
    case "ServerStops":
      return "the server stops right after answering";
    default:
      return null;
  }
};
