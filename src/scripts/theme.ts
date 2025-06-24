const themes = ["neon", "strawberry-milkshake"];
const isDark = globalThis.matchMedia("(prefers-color-scheme: dark)");

const theme = new Proxy(
  {
    value: localStorage.getItem("theme")
      ?? (isDark.matches ? "neon" : "strawberry-milkshake"),
  },
  {
    set(target, p, newValue) {
      if (p !== "value") return false;
      if (!themes.includes(newValue)) return false;
      if (target.value === newValue) return true;

      target.value = newValue;
      document.body.dataset.theme = newValue;
      localStorage.setItem("theme", newValue);

      return true;
    },
  },
);

globalThis.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.querySelector("#theme-switcher");
  document.body.dataset.theme = theme.value;

  themeSwitcher!.addEventListener("click", () => {
    const idx = (themes.indexOf(theme.value) + 1) % themes.length;
    theme.value = themes[idx];
  });
});
