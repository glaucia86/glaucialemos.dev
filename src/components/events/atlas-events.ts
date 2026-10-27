// Shared between the hero, the globe and the logbook: anchors and the events that move between them.
export const eventAnchor = (id: string) => `evento-${id}`;
export const LOG_ID = "diario";
// Ask the logbook to clear its filters and highlight one record (detail: event id). Cancelled when handled.
export const FIND_EVENT = "atlas:find-event";
// Ask the logbook to open one year (detail: year).
export const FILTER_YEAR = "atlas:filter-year";

export function findEvent(id: string) {
  return !window.dispatchEvent(new CustomEvent(FIND_EVENT, { detail: id, cancelable: true }));
}
export const filterYear = (year: number) => window.dispatchEvent(new CustomEvent(FILTER_YEAR, { detail: year }));
