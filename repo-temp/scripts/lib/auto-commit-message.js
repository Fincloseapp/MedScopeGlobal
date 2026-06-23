/**
 * Auto commit message generator — feat / fix / style / chore
 */

const UI_EXT = /\.(tsx|jsx|css|scss|svg|module\.css)$/i;
const UI_PATH = /components\/(layout|newsletter|brand|ui|v\d+)\//i;

function basename(path) {
  const norm = path.replace(/\\/g, "/");
  const file = norm.split("/").pop() ?? path;
  return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function parsePorcelain(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2).trim() || line[0];
      let path = line.slice(3).trim();
      if (path.includes(" -> ")) path = path.split(" -> ").pop() ?? path;
      return { status, path };
    })
    .filter(({ path }) => {
      const p = path.replace(/\\/g, "/");
      return !/\.cursor\/hooks\/\.auto-git-/.test(p) && !/\.cursor\/hooks\/auto-git\.log/.test(p);
    });
}

function classifyChange({ status, path }) {
  const lower = path.toLowerCase().replace(/\\/g, "/");
  const isNew = /^\?\?|^A/.test(status) || status.includes("A");
  const isDelete = status.includes("D");

  if (isDelete) return { type: "chore", label: "cleanup" };

  if (/fix|bug|hotfix|repair|patch|correct/i.test(lower)) {
    return { type: "fix", label: basename(path) };
  }

  if (UI_EXT.test(lower) || UI_PATH.test(lower) || /(header|hero|footer|logo|layout|typography)/i.test(lower)) {
    return { type: "style", label: basename(path) };
  }

  if (
    /^scripts\//.test(lower) ||
    /^\.github\//.test(lower) ||
    /package\.json|pnpm-lock|vercel\.json|\.gitignore|\.cursor\//.test(lower) ||
    /deploy|config|workflow|chore|cleanup/i.test(lower)
  ) {
    return { type: "chore", label: basename(path) };
  }

  if (isNew) return { type: "feat", label: basename(path) };

  return { type: "feat", label: basename(path) };
}

function generateCommitMessage(changes) {
  if (!changes.length) return null;

  const counts = { feat: 0, fix: 0, style: 0, chore: 0 };
  const newFiles = [];
  const labels = [];

  for (const change of changes) {
    const { type, label } = classifyChange(change);
    counts[type] += 1;
    if (/^\?\?|^A/.test(change.status) || change.status.includes("A")) {
      newFiles.push(label);
    }
    if (!labels.includes(label)) labels.push(label);
  }

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

  if (dominant === "feat" && newFiles.length) {
    const names = newFiles.slice(0, 3).join(", ");
    return `feat: added ${names}`;
  }

  if (dominant === "style") {
    const detail = labels.slice(0, 3).join(" + ");
    return detail ? `style: UI update — ${detail}` : "style: UI update";
  }

  if (dominant === "fix") {
    const detail = labels.slice(0, 3).join(" + ");
    return detail ? `fix: ${detail}` : "fix: bugfix";
  }

  if (dominant === "chore") {
    const detail = labels.slice(0, 3).join(" + ");
    return detail ? `chore: cleanup — ${detail}` : "chore: cleanup";
  }

  const summary = labels.slice(0, 4).join(" + ");
  return summary ? `update: ${summary}` : "update";
}

module.exports = { parsePorcelain, generateCommitMessage, classifyChange };
