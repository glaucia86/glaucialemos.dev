// Kyber crystal colors: GitHub's own language colors, so the archive matches what people see on the repositories.
const COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", "C#": "#178600", HTML: "#e34c26", CSS: "#a46cdf", Python: "#3572a5",
  Go: "#00add8", Vue: "#41b883", PHP: "#8892bf", PowerShell: "#4f8ec9", Java: "#b07219", Shell: "#89e051", Markdown: "#c9d1d9",
  "Jupyter Notebook": "#da5b0b", Svelte: "#ff3e00", Dockerfile: "#384d54",
};

export const languageColor = (language: string | null) => (language && COLORS[language]) || "#8b8f9e";
