const themes = ["neon", "strawberry-milkshake"];
type Theme = (typeof themes)[number];
const isDark = window.matchMedia("(prefers-color-scheme: dark)");

const theme = new Proxy(
  {
    value: localStorage.getItem("theme") ??
      (isDark.matches ? "neon" : "strawberry-milkshake"),
  },
  {
    set(target, p, newValue) {
      if (p !== "value") return false;
      if (!themes.includes(newValue)) return false;
      if (target.value === newValue) return true;

      target.value = newValue;
      applyTheme(newValue);
      localStorage.setItem("theme", newValue);

      return true;
    },
  },
);

const sfxs = ["/audio/switch-off.mp3", "/audio/switch-on.mp3"].map(
  (s) => new Audio(s),
);

window.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.querySelector("#theme-switcher");

  applyTheme(theme.value);

  themeSwitcher.addEventListener("click", () => {
    // NOTE: it's alright if indexOf returns -1
    const idx = (themes.indexOf(theme.value) + 1) % themes.length;
    sfxs[idx].play();
    theme.value = themes[idx];
  });

  const langSwitcher = document.querySelector("#language-switcher");
  langSwitcher.addEventListener("click", () => {
    // FIXME somehow this doesnt work
    new Audio("/audio/lang-switch.mp3").play();
  });
});

function applyTheme(theme: Theme) {
  document.body.classList.remove(...themes);
  document.body.classList.add(theme);
}
