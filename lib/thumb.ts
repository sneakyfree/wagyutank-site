// Foundation cards show a pre-cut close-up of the bull's forward half
// (public/foundation/thumb/*), while the profile page keeps the full
// photograph. Cropping ahead of time rather than with object-position is
// what lets every card frame the head consistently despite the source
// photos having wildly different framing.
export function thumbUrl(url?: string | null): string {
  if (!url) return "";
  return url.startsWith("/foundation/")
    ? url.replace("/foundation/", "/foundation/thumb/")
    : url;
}
