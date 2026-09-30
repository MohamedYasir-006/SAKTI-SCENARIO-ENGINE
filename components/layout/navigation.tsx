const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analysis", label: "Analysis" },
  { href: "/scenario-lab", label: "Scenario Lab" },
  { href: "/evidence", label: "Evidence" },
  { href: "/red-team", label: "Red Team" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function Navigation(): React.JSX.Element {
  return (
    <nav aria-label="Primary" className="p-2">
      <ul className="space-y-1">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
