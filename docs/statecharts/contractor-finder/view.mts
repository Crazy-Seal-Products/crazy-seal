type Vars = {
  url: string;
  inflight: string[];
  points: string[];
  here: boolean;
  locating: boolean;
  busy: boolean;
  asked: string;
  prev: string;
  by: string;
};

// Shown in ContractorFinder.tla.
const shown = (v: Vars) => (v.here ? "here" : (v.url === "A" || v.url === "B") && v.points.includes(v.url) ? v.url : "none");
const searching = (v: Vars) => v.locating || v.inflight.length > 0;

export const title = "What the contractor finder shows";

// The chart names results by how they relate to the visitor's latest search, not by ZIP, so
// ZIP A and ZIP B share states.
export const state = (v: Vars) => {
  const s = shown(v);
  const results = s === "none" ? "Map only" : s === v.asked ? "Results for the latest search" : "Results for an older search";
  const notes = [];
  if (searching(v)) notes.push("a search is still out");
  else if (s !== v.asked) notes.push(v.asked === "none" ? "the visitor started over" : "the latest search never shows");
  // The spinner is left out of the labels to keep the chart readable; SpinnerMeansSearching
  // shows as a "may break" mark and its path is in the report.
  return notes.length ? `${results}, ${notes.join(", ")}` : results;
};

export const group = (v: Vars) => (shown(v) === "none" ? "Map only" : "Results");

export const colors = { "Map only": "tan", Results: "teal" };

export const step = (action: string, from: Vars, to: Vars) => {
  switch (action) {
    case "SearchesZip":
      return "the visitor searches a ZIP";
    // A ZIP lookup and the browser's location are both answers to a search; the chart cares only
    // whether the answer is for the visitor's latest search.
    case "LookupAnswers": {
      const z = from.inflight.find((x) => !to.inflight.includes(x));
      return z === from.asked ? "the latest search's answer comes back" : "an earlier search's answer comes back";
    }
    case "AsksForLocation":
      return "the visitor taps Use my location";
    case "LocationArrives":
      return from.asked === "here" ? "the latest search's answer comes back" : "an earlier search's answer comes back";
    // Clear and the menu link take every state back to the map alone; the chart hides those
    // arrows and keeps the menu link only where it fails to start over.
    case "Clears":
      return null;
    case "LeavesSearch":
      return shown(to) === "none" ? null : "the visitor follows the menu link back to the finder";
    default:
      return null;
  }
};
