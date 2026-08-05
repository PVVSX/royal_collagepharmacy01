#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_ROOTS = ["src/app", "src/components", "src/roles"];
const EXCLUDED_DIRECTORY = "src/app/print";
const SOURCE_FILE = /\.tsx?$/;

const PALETTE_UTILITY = new RegExp(
  String.raw`(?<![A-Za-z0-9_-])(?<token>-?(?:bg|text|border(?:-[trblxyse])?|divide(?:-[xy])?|outline|ring(?:-offset)?|shadow|drop-shadow|from|via|to|fill|stroke|decoration|placeholder|caret|accent)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)|black|white)(?:\/(?:\d{1,3}|\[[^\]\s]+\]))?)(?![A-Za-z0-9_-])`,
  "g",
);
const ARBITRARY_COLOR_UTILITY = new RegExp(
  String.raw`(?<![A-Za-z0-9_-])(?<token>(?<utility>(?:bg|text|border(?:-[trblxyse])?|divide(?:-[xy])?|outline|ring(?:-offset)?|shadow|drop-shadow|from|via|to|fill|stroke|decoration|placeholder|caret|accent))-\[(?<value>[^\]\r\n]+)\])`,
  "g",
);
const ARBITRARY_COLOR_PROPERTY = new RegExp(
  String.raw`(?<![A-Za-z0-9_-])(?<token>\[(?:color|background-color|border(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?-color|outline-color|text-decoration-color|caret-color|accent-color|fill|stroke)\s*:[^\]\r\n]+\])`,
  "gi",
);
const RAW_HEX_COLOR = /(?<![A-Za-z0-9-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
const RAW_FUNCTION_COLOR = /(?<![A-Za-z0-9-])(?:rgba?|hsla?)\s*\([^\r\n)]*\)/gi;
const INLINE_STYLE = /\bstyle\s*=/g;

const reportOnly = process.argv.slice(2).includes("--report");

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function toProjectPath(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join("/");
}

function isExcluded(projectPath) {
  return projectPath === EXCLUDED_DIRECTORY || projectPath.startsWith(`${EXCLUDED_DIRECTORY}/`);
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => compareText(left.name, right.name));

  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const projectPath = toProjectPath(absolutePath);

    if (isExcluded(projectPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(absolutePath));
    } else if (entry.isFile() && SOURCE_FILE.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function isArbitraryColor(value) {
  const normalized = value.trim();

  return /^(?:#|--|(?:color:)?\s*(?:var|rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\s*\()/i.test(normalized)
    || /^theme\s*\(\s*colors(?:\.|\[)/i.test(normalized)
    || /^[a-z]+$/i.test(normalized);
}

function isLikelyRawHexColor(sourceLine, match) {
  const hex = match[0].slice(1);
  if (hex.length >= 6 || /[a-f]/i.test(hex)) {
    return true;
  }

  const prefix = sourceLine.slice(0, match.index);
  return /(?:className|style|color|background|border|shadow|fill|stroke)\b[^;]*$/i.test(prefix);
}

function addFinding(findings, severity, rule, file, line, column, detail) {
  findings.push({ severity, rule, file, line, column, detail });
}

function scanLine(findings, file, sourceLine, lineNumber) {
  for (const match of sourceLine.matchAll(PALETTE_UTILITY)) {
    addFinding(findings, "violation", "direct-palette", file, lineNumber, match.index, match.groups.token);
  }

  for (const match of sourceLine.matchAll(ARBITRARY_COLOR_UTILITY)) {
    if (isArbitraryColor(match.groups.value)) {
      addFinding(findings, "violation", "arbitrary-color", file, lineNumber, match.index, match.groups.token);
    }
  }

  for (const match of sourceLine.matchAll(ARBITRARY_COLOR_PROPERTY)) {
    addFinding(findings, "violation", "arbitrary-color", file, lineNumber, match.index, match.groups.token);
  }

  for (const match of sourceLine.matchAll(RAW_HEX_COLOR)) {
    if (isLikelyRawHexColor(sourceLine, match)) {
      addFinding(findings, "violation", "raw-color", file, lineNumber, match.index, match[0]);
    }
  }

  for (const match of sourceLine.matchAll(RAW_FUNCTION_COLOR)) {
    addFinding(findings, "violation", "raw-color", file, lineNumber, match.index, match[0]);
  }

  for (const match of sourceLine.matchAll(INLINE_STYLE)) {
    addFinding(findings, "warning", "inline-style", file, lineNumber, match.index, "style=");
  }
}

function sortFindings(findings) {
  const severityOrder = { violation: 0, warning: 1 };

  findings.sort((left, right) => (
    compareText(left.file, right.file)
    || left.line - right.line
    || left.column - right.column
    || severityOrder[left.severity] - severityOrder[right.severity]
    || compareText(left.rule, right.rule)
    || compareText(left.detail, right.detail)
  ));
}

async function main() {
  const nestedFiles = await Promise.all(
    SOURCE_ROOTS.map((sourceRoot) => collectSourceFiles(path.join(PROJECT_ROOT, sourceRoot))),
  );
  const files = nestedFiles.flat().sort((left, right) => compareText(toProjectPath(left), toProjectPath(right)));
  const findings = [];

  for (const absolutePath of files) {
    const file = toProjectPath(absolutePath);
    const source = await readFile(absolutePath, "utf8");
    const lines = source.split(/\r?\n/);

    lines.forEach((sourceLine, index) => scanLine(findings, file, sourceLine, index + 1));
  }

  sortFindings(findings);

  for (const finding of findings) {
    console.log(`${finding.severity.toUpperCase()} ${finding.file}:${finding.line} ${finding.rule} ${finding.detail}`);
  }

  const violationCount = findings.filter(({ severity }) => severity === "violation").length;
  const warningCount = findings.length - violationCount;
  console.log(`Summary: ${violationCount} violation(s), ${warningCount} warning(s), ${files.length} file(s) scanned.`);

  if (violationCount > 0 && !reportOnly) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Design token check failed: ${error.message}`);
  process.exitCode = 1;
});
