"use client";

import { useEffect, useRef, useState } from "react";
import { codeToHtml } from "shiki";
import { toBlob, toPng } from "html-to-image";
import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const languages = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "sql",
  "html",
  "css",
  "json",
  "bash",
  "jsx",
  "tsx",
  "markdown",
  "java",
  "csharp",
  "php",
  "ruby",
  "swift",
  "yaml",
  "toml",
  "graphql",
  "docker",
  "powershell",
  "plaintext",
];

const themes = [
  "one-dark-pro",
  "dracula",
  "tokyo-night",
  "monokai",
  "github-dark",
  "nord",
];

const backgroundMap = {
  sunset: "linear-gradient(135deg, #ff7a59 0%, #ffb36b 23%, #7f5af0 60%, #17142d 100%)",
  hyper: "linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%)",
  mesh: "radial-gradient(circle at top left, rgba(59,130,246,0.55), transparent 30%), radial-gradient(circle at bottom right, rgba(232,121,249,0.5), transparent 35%), linear-gradient(135deg, #0b1220 0%, #111827 45%, #1f2937 100%)",
  glassmorphism:
    "linear-gradient(135deg, rgba(15,23,42,0.75), rgba(30,41,59,0.4)), rgba(15,23,42,0.3)",
  solid: "#0b1020",
  transparent: "rgba(15, 23, 42, 0.18)",
} as const;

const presetRatios = {
  twitter: "16 / 9",
  linkedin: "4 / 5",
  instagram: "9 / 16",
  square: "1 / 1",
} as const;

const presetSizes = {
  twitter: { width: 1280, height: 720 },
  linkedin: { width: 960, height: 1200 },
  instagram: { width: 720, height: 1280 },
  square: { width: 1000, height: 1000 },
} as const;

const previewDisplaySizes = {
  twitter: { width: 1100, height: 620 },
  linkedin: { width: 760, height: 950 },
  instagram: { width: 520, height: 930 },
  square: { width: 780, height: 780 },
} as const;

const exportResolutions = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "4K": { width: 3840, height: 2160 },
} as const;

const getResolutionLabel = (option: keyof typeof exportResolutions, aspect: keyof typeof presetSizes) => {
  const base = exportResolutions[option];
  const targetAspect = presetSizes[aspect].width / presetSizes[aspect].height;

  if (targetAspect >= 1) {
    const width = base.width;
    const height = Math.round(width / targetAspect);
    return `${width}×${height}`;
  }

  const height = base.height;
  const width = Math.round(height * targetAspect);
  return `${width}×${height}`;
};

const sampleSnippets: Record<string, { code: string; filename: string }> = {
  javascript: {
    code: `const config = {
  apiKey: "sk_live_8f3d1c4f7d9a2e",
  password: "Tr0ub4dor&3",
  email: "hello@codeglow.dev",
};

async function deploy() {
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";
  const response = await fetch("https://api.example.com/release", {
    method: "POST",
    headers: { Authorization: \`Bearer \${token}\`, "x-api-key": config.apiKey },
  });

  return response.json();
}`,
    filename: "app.js",
  },
  typescript: {
    code: `type Config = {
  apiKey: string;
  password: string;
  email: string;
};

const config: Config = {
  apiKey: "sk_live_8f3d1c4f7d9a2e",
  password: "Tr0ub4dor&3",
  email: "hello@codeglow.dev",
};

export async function deploy() {
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";
  return fetch("https://api.example.com/release", {
    method: "POST",
    headers: { Authorization: \`Bearer \${token}\`, "x-api-key": config.apiKey },
  });
}`,
    filename: "app.ts",
  },
  python: {
    code: `import os

API_KEY = os.getenv("API_KEY", "your-dev-key")
PASSWORD = "Tr0ub4dor&3"
EMAIL = "hello@codeglow.dev"


def deploy():
    token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"
    headers = {
        "Authorization": f"Bearer {token}",
        "X-API-Key": API_KEY,
    }
    return headers`,
    filename: "app.py",
  },
  rust: {
    code: `fn main() {
    let api_key = "sk_live_8f3d1c4f7d9a2e";
    let password = "Tr0ub4dor&3";
    let email = "hello@codeglow.dev";

    let token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";
    println!("Deploying with token: {}", token);
    println!("API key: {}", api_key);
}`,
    filename: "main.rs",
  },
  go: {
    code: `package main

import "fmt"

func main() {
    apiKey := "sk_live_8f3d1c4f7d9a2e"
    password := "Tr0ub4dor&3"
    email := "hello@codeglow.dev"
    token := "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"

    fmt.Println("Using token:", token)
    fmt.Println("API key:", apiKey)
    fmt.Println("Email:", email)
    fmt.Println("Password:", password)
}`,
    filename: "main.go",
  },
  sql: {
    code: `SELECT
  user_id,
  email,
  api_key,
  auth_token
FROM users
WHERE password_hash IS NOT NULL
  AND email = 'hello@codeglow.dev';`,
    filename: "query.sql",
  },
  html: {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CodeGlow</title>
  </head>
  <body>
    <main>
      <button data-token="eyJhbGciOiJIUzI1NiJ9">Deploy</button>
    </main>
  </body>
</html>`,
    filename: "index.html",
  },
  css: {
    code: `.card {
  --api-key: "sk_live_8f3d1c4f7d9a2e";
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #7c3aed, #0ea5e9);
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.35);
}`,
    filename: "styles.css",
  },
  json: {
    code: `{
  "apiKey": "sk_live_8f3d1c4f7d9a2e",
  "password": "Tr0ub4dor&3",
  "email": "hello@codeglow.dev",
  "features": ["export", "redact", "share"]
}`,
    filename: "config.json",
  },
  bash: {
    code: `#!/usr/bin/env bash
API_KEY="sk_live_8f3d1c4f7d9a2e"
PASSWORD="Tr0ub4dor&3"
EMAIL="hello@codeglow.dev"
TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"

curl -X POST https://api.example.com/release \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-api-key: $API_KEY"`,
    filename: "deploy.sh",
  },
  jsx: {
    code: `export function App() {
  const apiKey = "sk_live_8f3d1c4f7d9a2e";
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";

  return (
    <button onClick={() => fetch("/api/deploy", {
      headers: { Authorization: \`Bearer \${token}\`, "x-api-key": apiKey },
    })}>
      Deploy
    </button>
  );
}`,
    filename: "App.jsx",
  },
  tsx: {
    code: `type Props = { title: string };

export function Dashboard({ title }: Props) {
  const apiKey = "sk_live_8f3d1c4f7d9a2e";
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";

  return (
    <section>
      <h1>{title}</h1>
      <button onClick={() => console.log({ apiKey, token })}>Run</button>
    </section>
  );
}`,
    filename: "Dashboard.tsx",
  },
  markdown: {
    code: `# CodeGlow Demo

> Secure deployment notes for ` + "`" + `production` + "`" + ` usage.

- API key: sk_live_8f3d1c4f7d9a2e
- Email: hello@codeglow.dev
- Token: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ

## Deploy

Run the CLI to publish the release.
`,
    filename: "README.md",
  },
  java: {
    code: `public class DeployService {
    private static final String API_KEY = "sk_live_8f3d1c4f7d9a2e";
    private static final String PASSWORD = "Tr0ub4dor&3";

    public static void main(String[] args) {
        String token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";
        System.out.println("Deploying with token: " + token);
    }
}`,
    filename: "DeployService.java",
  },
  csharp: {
    code: `using System;

class Program {
    static void Main() {
        string apiKey = "sk_live_8f3d1c4f7d9a2e";
        string password = "Tr0ub4dor&3";
        string token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";

        Console.WriteLine($"Deploying using {token}");
        Console.WriteLine($"Key: {apiKey}");
    }
}`,
    filename: "Program.cs",
  },
  php: {
    code: `<?php
$apiKey = "sk_live_8f3d1c4f7d9a2e";
$password = "Tr0ub4dor&3";
$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ";

$headers = [
    "Authorization" => "Bearer $token",
    "x-api-key" => $apiKey,
];

print_r($headers);`,
    filename: "deploy.php",
  },
  ruby: {
    code: `api_key = "sk_live_8f3d1c4f7d9a2e"
password = "Tr0ub4dor&3"
token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"

def deploy(api_key:, token:)
  { authorization: "Bearer #{token}", "x-api-key": api_key }
end

puts deploy(api_key: api_key, token: token)`,
    filename: "deploy.rb",
  },
  swift: {
    code: `import Foundation

let apiKey = "sk_live_8f3d1c4f7d9a2e"
let password = "Tr0ub4dor&3"
let token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"

let headers = [
    "Authorization": "Bearer \(token)",
    "x-api-key": apiKey
]
print(headers)`,
    filename: "Deploy.swift",
  },
  yaml: {
    code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: codeglow-config
  namespace: production
data:
  API_KEY: "sk_live_8f3d1c4f7d9a2e"
  PASSWORD: "Tr0ub4dor&3"
  TOKEN: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"`,
    filename: "config.yaml",
  },
  toml: {
    code: `[build]
api_key = "sk_live_8f3d1c4f7d9a2e"
password = "Tr0ub4dor&3"

[deploy]
token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"
region = "us-east-1"`,
    filename: "app.toml",
  },
  graphql: {
    code: `query Deployments($token: String!) {
  deployments(token: $token) {
    id
    status
    url
  }
}

mutation Publish {
  deploy(input: { token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ" }) {
    success
  }
}`,
    filename: "schema.graphql",
  },
  docker: {
    code: `FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV API_KEY=sk_live_8f3d1c4f7d9a2e
ENV PASSWORD=Tr0ub4dor&3
EXPOSE 3000
CMD ["npm", "run", "start"]`,
    filename: "Dockerfile",
  },
  powershell: {
    code: `$apiKey = "sk_live_8f3d1c4f7d9a2e"
$password = "Tr0ub4dor&3"
$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XYZ"

Invoke-RestMethod -Uri "https://api.example.com/release" \`
  -Headers @{ Authorization = "Bearer $token"; "x-api-key" = $apiKey }`,
    filename: "deploy.ps1",
  },
  plaintext: {
    code: `# CodeGlow preview
apiKey = "sk_live_8f3d1c4f7d9a2e"
password = "Tr0ub4dor&3"
email = "hello@codeglow.dev"
status = "ready for export"`,
    filename: "notes.txt",
  },
};

const defaultCode = sampleSnippets.typescript.code;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const redactSecrets = (value: string) => {
  let redacted = value;

  redacted = redacted.replace(
    /(api[_-]?key|secret|token|password|auth)\s*[:=]\s*["']([^"']+)["']/gi,
    (_match, label: string, secret: string) => {
      const mask = "█".repeat(Math.max(secret.length, 8));
      return `${label} = "${mask}"`;
    },
  );

  redacted = redacted.replace(
    /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    (email: string) => "█".repeat(Math.max(email.length, 8)),
  );

  redacted = redacted.replace(
    /(Bearer\s+)([A-Za-z0-9._-]+)/gi,
    (_match, prefix: string) => `${prefix}${"█".repeat(18)}`,
  );

  return redacted;
};

export default function Home() {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("typescript");
  const [theme, setTheme] = useState("one-dark-pro");
  const [windowTitle, setWindowTitle] = useState(sampleSnippets.typescript.filename);
  const [windowStyle, setWindowStyle] = useState<"mac" | "windows" | "minimal">("mac");
  const [background, setBackground] = useState<keyof typeof backgroundMap>("sunset");
  const [padding, setPadding] = useState(28);
  const [radius, setRadius] = useState(24);
  const [shadow, setShadow] = useState<"none" | "soft" | "heavy" | "neon">("heavy");
  const [autoRedact, setAutoRedact] = useState(true);
  const [manualRedactEnabled, setManualRedactEnabled] = useState(false);
  const [manualRedactState, setManualRedactState] = useState(false);
  const [preset, setPreset] = useState<keyof typeof presetRatios>("twitter");
  const [downloadResolution, setDownloadResolution] = useState<keyof typeof exportResolutions>("4K");
  const [highlightedCode, setHighlightedCode] = useState("");
  const [toast, setToast] = useState("");
  const windowRef = useRef<HTMLDivElement | null>(null);

  const applyLanguageSample = (nextLanguage: string) => {
    const nextSnippet = sampleSnippets[nextLanguage];
    if (!nextSnippet) return;

    setLanguage(nextLanguage);
    setWindowTitle(nextSnippet.filename);
    setCode(nextSnippet.code);
    setManualRedactState(false);
  };

  useEffect(() => {
    let active = true;
    const effectiveCode = autoRedact ? redactSecrets(code) : code;

    codeToHtml(effectiveCode, {
      lang: languages.includes(language) ? language : "plaintext",
      theme: themes.includes(theme) ? theme : "one-dark-pro",
    })
      .then((html) => {
        if (active) {
          setHighlightedCode(html);
        }
      })
      .catch(() => {
        if (active) {
          setHighlightedCode(`<pre><code>${escapeHtml(effectiveCode)}</code></pre>`);
        }
      });

    return () => {
      active = false;
    };
  }, [code, language, theme, autoRedact]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const previewStyle = {
    background: backgroundMap[background],
    borderRadius: `${radius}px`,
    padding: `${padding}px`,
    boxShadow:
      shadow === "none"
        ? "none"
        : shadow === "soft"
          ? "0 18px 48px rgba(15, 23, 42, 0.38)"
          : shadow === "heavy"
            ? "0 28px 80px rgba(15, 23, 42, 0.52)"
            : "0 0 0 1px rgba(167, 139, 250, 0.45), 0 0 40px rgba(168, 85, 247, 0.45)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  } as const;

  const handleCopyToClipboard = async () => {
    if (!windowRef.current) return;

    try {
      const blob = await toBlob(windowRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        skipFonts: true,
        backgroundColor: "transparent",
      });

      if (!blob) {
        setToast("Clipboard unsupported");
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type || "image/png"]: blob,
        }),
      ]);

      setToast("Copied to Clipboard!");
    } catch (error) {
      console.error(error);
      setToast("Clipboard failed");
    }
  };

  const getPresetExportSize = (option: keyof typeof exportResolutions) => {
    const base = exportResolutions[option];
    const targetAspect = presetSizes[preset].width / presetSizes[preset].height;

    if (targetAspect >= 1) {
      const width = base.width;
      const height = Math.round(width / targetAspect);
      return { width, height };
    }

    const height = base.height;
    const width = Math.round(height * targetAspect);
    return { width, height };
  };

  const applyManualRedactSelection = () => {
    if (!manualRedactEnabled) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !windowRef.current) return;

    const range = selection.getRangeAt(0);
    if (!windowRef.current || !windowRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      return;
    }

    const textToMask = selectedText;
    setCode((current) => {
      const index = current.indexOf(textToMask);
      if (index === -1) return current;
      return `${current.slice(0, index)}${"█".repeat(Math.max(textToMask.length, 6))}${current.slice(index + textToMask.length)}`;
    });

    setManualRedactState(true);
    selection.removeAllRanges();
    setToast("Selection redacted");
  };

  const handleManualRedactToggle = () => {
    setManualRedactEnabled((value) => !value);
    setToast(manualRedactEnabled ? "Manual redact off" : "Manual redact on");
  };

  const handleDownloadPNG = async () => {
    if (!windowRef.current) return;

    try {
      const { width, height } = getPresetExportSize(downloadResolution);
      const dataUrl = await toPng(windowRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        skipFonts: true,
        backgroundColor: "transparent",
        width,
        height,
      });

      const link = document.createElement("a");
      link.download = "codeglow.png";
      link.href = dataUrl;
      link.click();
      setToast("Downloaded PNG!");
    } catch (error) {
      console.error(error);
      setToast("Export failed");
    }
  };

  const titleDisplay = windowTitle.trim() || "untitled";
  const exportDimensions = getPresetExportSize(downloadResolution);

  const previewContent = (
    <div ref={windowRef} className="relative h-full w-full overflow-hidden border border-white/10" style={previewStyle}>
      <div className="absolute inset-0 opacity-90" />

      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            {windowStyle === "mac" && (
              <>
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </>
            )}
            {windowStyle === "windows" && (
              <div className="flex items-center gap-2">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-zinc-200 text-[9px] font-bold text-zinc-700">×</span>
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-zinc-200 text-[9px] font-bold text-zinc-700">—</span>
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-zinc-200 text-[9px] font-bold text-zinc-700">▢</span>
              </div>
            )}
            {windowStyle === "minimal" && (
              <div className="flex min-w-0 items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-300">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                <span className="truncate">{titleDisplay}</span>
              </div>
            )}
          </div>

          {windowStyle !== "minimal" && (
            <div className="min-w-0 max-w-[60%] truncate rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-200">
              {titleDisplay}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/10 backdrop-blur-sm">
          <pre
            className="h-full w-full overflow-auto p-4 font-mono text-zinc-100"
            style={{
              fontSize: "clamp(9px, 0.9vw, 13px)",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            <code dangerouslySetInnerHTML={{ __html: highlightedCode || escapeHtml(code) }} />
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#070b14] text-zinc-100">
      <div className="mx-auto max-w-[1600px] px-5 py-5 lg:px-8">
        <div className="mb-6 flex min-h-[90px] items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/70 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="flex h-[90px] w-full max-w-[728px] items-center justify-center rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.2),_rgba(15,23,42,0.8)_40%,_rgba(2,6,23,0.9)_100%)] text-xs font-medium tracking-[0.22em] text-zinc-300 uppercase">
            Google AdSense 728x90 Leaderboard
          </div>
        </div>

        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-400 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-white">
                  CodeGlow
                </h1>
              </div>
              <p className="truncate text-sm text-zinc-400">Instant HD Code Screenshots</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-violet-400/70 hover:bg-zinc-800"
            >
              <Clipboard className="h-4 w-4" />
              Copy Image to Clipboard
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>

              <div className="relative">
                <select
                  value={downloadResolution}
                  onChange={(event) => setDownloadResolution(event.target.value as keyof typeof exportResolutions)}
                  className="appearance-none rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 pr-9 text-sm font-medium text-zinc-100 outline-none transition hover:border-violet-400/60"
                >
                  <option value="720p">{getResolutionLabel("720p", preset)}</option>
                  <option value="1080p">{getResolutionLabel("1080p", preset)}</option>
                  <option value="1440p">{getResolutionLabel("1440p", preset)}</option>
                  <option value="4K">{getResolutionLabel("4K", preset)}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="relative">
              <select
                value={preset}
                onChange={(event) => setPreset(event.target.value as keyof typeof presetRatios)}
                className="appearance-none rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 pr-10 text-sm font-medium text-zinc-100 outline-none transition hover:border-violet-400/60"
              >
                <option value="twitter">X/Twitter 16:9</option>
                <option value="linkedin">LinkedIn 4:5</option>
                <option value="instagram">Instagram 9:16</option>
                <option value="square">Square 1:1</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 xl:flex-row">
          <aside className="w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl xl:w-[320px]">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(event) => applyLanguageSample(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-0 transition hover:border-violet-400/60"
                >
                  {languages.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 outline-none transition hover:border-violet-400/60"
                >
                  {themes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Window title
                </label>
                <input
                  value={windowTitle}
                  onChange={(event) => setWindowTitle(event.target.value)}
                  className="min-w-0 w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 hover:border-violet-400/60"
                  placeholder="index.tsx"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Window controls
                </label>
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-zinc-900/70 p-2">
                  {(["mac", "windows", "minimal"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setWindowStyle(style)}
                      className={`rounded-lg px-2 py-2 text-[11px] font-medium capitalize transition ${
                        windowStyle === style
                          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                          : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Background
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(backgroundMap).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBackground(key as keyof typeof backgroundMap)}
                      className={`flex h-12 items-center justify-center rounded-xl border text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                        background === key
                          ? "border-violet-400 bg-violet-500/15 text-violet-200"
                          : "border-white/10 bg-zinc-900/70 text-zinc-300 hover:border-violet-400/40"
                      }`}
                      style={{ background: value }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                    Padding
                  </label>
                  <span className="text-xs text-zinc-300">{padding}px</span>
                </div>
                <input
                  aria-label="Padding"
                  type="range"
                  min={16}
                  max={96}
                  value={padding}
                  onChange={(event) => setPadding(Number(event.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                    Border radius
                  </label>
                  <span className="text-xs text-zinc-300">{radius}px</span>
                </div>
                <input
                  aria-label="Border radius"
                  type="range"
                  min={0}
                  max={24}
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Shadow strength
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["none", "soft", "heavy", "neon"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setShadow(value)}
                      className={`rounded-lg px-2 py-2 text-xs font-medium capitalize transition ${
                        shadow === value
                          ? "bg-violet-500 text-white"
                          : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-violet-300" />
                      <span className="truncate text-sm font-medium text-violet-100">Auto-redact</span>
                    </div>
                    <button
                      type="button"
                      aria-label="Toggle auto-redact"
                      onClick={() => setAutoRedact((value) => !value)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
                        autoRedact ? "border-violet-400 bg-violet-500" : "border-white/15 bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition ${
                          autoRedact ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualRedactToggle}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      manualRedactEnabled
                        ? "border-violet-400 bg-violet-500/25 text-violet-100"
                        : "border-white/10 bg-zinc-900/80 text-zinc-100 hover:border-violet-400/60 hover:bg-zinc-800"
                    }`}
                  >
                    {manualRedactEnabled ? "Manual redact on" : manualRedactState ? "Manual redact paused" : "Manual redact"}
                  </button>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-violet-100/80">
                  Masks API keys, passwords, JWTs, emails, and env-style secrets in preview mode.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="flex h-[250px] w-[300px] items-center justify-center rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_rgba(15,23,42,0.9)_50%,_rgba(2,6,23,0.95)_100%)] text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-300">
                Google AdSense 300x250
              </div>
            </div>
          </aside>

          <section className="flex-1 rounded-2xl border border-white/10 bg-zinc-900/60 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl">
            <div className="flex min-h-[760px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_rgba(9,11,20,0.95)_58%)] p-4 sm:p-5 lg:p-8">
              <div
                className="relative flex items-center justify-center overflow-hidden border border-white/10"
                style={{
                  aspectRatio: presetRatios[preset],
                  width: `min(${exportDimensions.width}px, 100%)`,
                  height: "auto",
                  maxHeight: "76vh",
                }}
                onMouseUp={applyManualRedactSelection}
              >
                {previewContent}
              </div>
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-violet-400/50 bg-violet-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/50 backdrop-blur-sm">
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}
    </main>
  );
}
