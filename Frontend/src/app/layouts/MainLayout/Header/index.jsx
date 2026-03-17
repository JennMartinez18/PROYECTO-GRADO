// Import Dependencies
import clsx from "clsx";

// Local Imports
import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { useThemeContext } from "app/contexts/theme/context";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "☀️ ¡Buenos días!";
  if (hour >= 12 && hour < 19) return "🌤️ ¡Buenas tardes!";
  return "🌙 ¡Buenas noches!";
}

export function Header() {
  const { cardSkin } = useThemeContext();
  const { user } = useAuthContext();

  return (
    <header
      className={clsx(
        "app-header transition-content sticky top-0 z-20 flex h-[65px] shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-(--margin-x) backdrop-blur-sm backdrop-saturate-150 dark:border-dark-600",
        cardSkin === "shadow" ? "dark:bg-dark-750/80" : "dark:bg-dark-900/80",
      )}
    >
      <SidebarToggleBtn />
      <p className="text-sm font-medium text-gray-600 dark:text-dark-200">
        {getGreeting()}, <span className="font-semibold text-gray-800 dark:text-dark-50">{user?.nombre || "Usuario"}</span>!
      </p>
    </header>
  );
}
