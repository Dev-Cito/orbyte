const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}
