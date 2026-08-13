import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
const KEY = "tikdown-theme";

function apply(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Mode | null) ?? "system";
    setMode(stored);
    apply(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(KEY) as Mode | null) ?? "system" === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next = () => {
    const order: Mode[] = ["light", "dark", "system"];
    const value = order[(order.indexOf(mode) + 1) % order.length] ?? "system";
    setMode(value);
    localStorage.setItem(KEY, value);
    apply(value);
  };

  const icon =
    mode === "light" ? "fa-sun" : mode === "dark" ? "fa-moon" : "fa-circle-half-stroke";

  return (
    <button
      type="button"
      onClick={next}
      aria-label={`Ubah tema (saat ini: ${mode})`}
      title={`Tema: ${mode}`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
    </button>
  );
}
