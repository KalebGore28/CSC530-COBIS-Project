// Role names are stored like cobis_administrator, so this turns them into Cobis Administrator
export function formatRoleName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
