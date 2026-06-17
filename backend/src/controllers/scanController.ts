import { Request, Response } from 'express';
import { exec } from 'child_process';
import { writeFile, mkdir, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import prisma from '../lib/prisma';
import { io } from '../index';
import { Severity } from '@prisma/client';

const execAsync = promisify(exec);

// ─── Language extension map ────────────────────────────────────────────────
const LANG_EXT: Record<string, string> = {
  javascript: 'js', typescript: 'ts', python: 'py',
  java: 'java', php: 'php', go: 'go', ruby: 'rb', c: 'c', cpp: 'cpp',
};

// ─── Built-in regex rule engine (runs when semgrep not available) ──────────
interface BuiltinRule {
  id: string;
  pattern: RegExp;
  message: string;
  severity: Severity;
  category: string;
  fix: string;
}

const BUILTIN_RULES: BuiltinRule[] = [
  // SQL Injection
  {
    id: 'sql-injection',
    pattern: /(`|'|")\s*\+\s*(req\.|params\.|query\.|body\.|user\.|input|userId|id|name|email)/gi,
    message: 'Potential SQL Injection: user input directly concatenated into query string.',
    severity: 'CRITICAL',
    category: 'Injection',
    fix: 'Use parameterized queries or an ORM.\n  // Bad:  db.query("SELECT * FROM users WHERE id=" + req.params.id)\n  // Good: db.query("SELECT * FROM users WHERE id=$1", [req.params.id])',
  },
  {
    id: 'sql-injection-format',
    pattern: /query\s*\(\s*[`"'](SELECT|INSERT|UPDATE|DELETE|DROP).*\$\{/gi,
    message: 'SQL Injection via template literal interpolation in query.',
    severity: 'CRITICAL',
    category: 'Injection',
    fix: 'Replace template literals with parameterized queries.',
  },
  // XSS
  {
    id: 'xss-innerhtml',
    pattern: /\.innerHTML\s*=\s*(?!['"`])/gi,
    message: 'Cross-Site Scripting (XSS): Unsanitized data assigned to innerHTML.',
    severity: 'HIGH',
    category: 'XSS',
    fix: 'Use textContent instead of innerHTML, or sanitize with DOMPurify.\n  // Bad:  el.innerHTML = userInput\n  // Good: el.textContent = userInput',
  },
  {
    id: 'xss-dangerouslysetinnerhtml',
    pattern: /dangerouslySetInnerHTML/g,
    message: 'XSS Risk: dangerouslySetInnerHTML bypasses React\'s XSS protection.',
    severity: 'HIGH',
    category: 'XSS',
    fix: 'Sanitize the HTML using DOMPurify before passing to dangerouslySetInnerHTML.',
  },
  {
    id: 'xss-document-write',
    pattern: /document\.(write|writeln)\s*\(/gi,
    message: 'XSS Risk: document.write() with unescaped data can execute arbitrary scripts.',
    severity: 'HIGH',
    category: 'XSS',
    fix: 'Replace document.write() with safe DOM manipulation methods.',
  },
  // Hardcoded Secrets
  {
    id: 'hardcoded-password',
    pattern: /password\s*[:=]\s*['"`][^'"`]{4,}['"`]/gi,
    message: 'Hardcoded Password detected in source code.',
    severity: 'CRITICAL',
    category: 'Secrets',
    fix: 'Move credentials to environment variables.\n  // Bad:  const password = "SuperSecret123"\n  // Good: const password = process.env.DB_PASSWORD',
  },
  {
    id: 'hardcoded-api-key',
    pattern: /(api_key|apikey|api-key|secret_key|access_token|auth_token)\s*[:=]\s*['"`][A-Za-z0-9+/=_\-]{16,}['"`]/gi,
    message: 'Hardcoded API Key or Secret Token found in source code.',
    severity: 'CRITICAL',
    category: 'Secrets',
    fix: 'Use environment variables or a secrets manager (AWS Secrets Manager, Vault).',
  },
  {
    id: 'hardcoded-jwt-secret',
    pattern: /jwt\.sign\s*\([^,]+,\s*['"`][^'"`]{8,}['"`]/gi,
    message: 'Hardcoded JWT secret used directly in jwt.sign().',
    severity: 'CRITICAL',
    category: 'Secrets',
    fix: 'Load JWT secret from environment: jwt.sign(payload, process.env.JWT_SECRET)',
  },
  // Insecure Crypto
  {
    id: 'weak-hash-md5',
    pattern: /createHash\s*\(\s*['"`]md5['"`]\s*\)/gi,
    message: 'Weak cryptographic hash: MD5 is cryptographically broken.',
    severity: 'HIGH',
    category: 'Cryptography',
    fix: 'Use SHA-256 or SHA-3 instead.\n  // Bad:  crypto.createHash("md5")\n  // Good: crypto.createHash("sha256")',
  },
  {
    id: 'weak-hash-sha1',
    pattern: /createHash\s*\(\s*['"`]sha1['"`]\s*\)/gi,
    message: 'Weak cryptographic hash: SHA-1 is deprecated for security use.',
    severity: 'MEDIUM',
    category: 'Cryptography',
    fix: 'Use SHA-256 or stronger.',
  },
  // Insecure Random
  {
    id: 'insecure-random',
    pattern: /Math\.random\s*\(\s*\)/g,
    message: 'Insecure randomness: Math.random() is not cryptographically secure.',
    severity: 'MEDIUM',
    category: 'Cryptography',
    fix: 'Use crypto.randomBytes() or crypto.getRandomValues() for security-sensitive operations.',
  },
  // Command Injection
  {
    id: 'command-injection',
    pattern: /(exec|execSync|spawn|spawnSync|system)\s*\([^)]*(?:req\.|params\.|query\.|body\.|input|userInput)/gi,
    message: 'Command Injection: User input passed directly to shell command.',
    severity: 'CRITICAL',
    category: 'Injection',
    fix: 'Validate and whitelist inputs. Use execFile() with arg arrays instead of exec().',
  },
  // Path Traversal
  {
    id: 'path-traversal',
    pattern: /(readFile|readFileSync|createReadStream|writeFile)\s*\([^)]*(?:req\.|params\.|query\.|body\.)/gi,
    message: 'Path Traversal: User-controlled input used in file path without sanitization.',
    severity: 'HIGH',
    category: 'Path Traversal',
    fix: 'Validate file paths with path.resolve() and ensure they stay within the intended directory.',
  },
  // Eval
  {
    id: 'eval-injection',
    pattern: /\beval\s*\(/g,
    message: 'Code Injection: eval() executes arbitrary code and is a severe security risk.',
    severity: 'CRITICAL',
    category: 'Injection',
    fix: 'Remove eval(). Use safer alternatives like JSON.parse() for data or Function constructors carefully.',
  },
  // Prototype Pollution
  {
    id: 'prototype-pollution',
    pattern: /\.__proto__\s*=/g,
    message: 'Prototype Pollution: Direct assignment to __proto__ can corrupt Object prototype.',
    severity: 'HIGH',
    category: 'Injection',
    fix: 'Use Object.create(null) for maps, or validate merged objects with hasOwnProperty checks.',
  },
  // Insecure HTTP
  {
    id: 'insecure-http',
    pattern: /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/gi,
    message: 'Insecure HTTP URL: Plaintext HTTP transmits data without encryption.',
    severity: 'MEDIUM',
    category: 'Transport Security',
    fix: 'Use HTTPS for all external communications.',
  },
  // NoSQL Injection
  {
    id: 'nosql-injection',
    pattern: /\$where\s*:|\.find\s*\(\s*\{[^}]*(?:req\.|params\.|query\.|body\.)/gi,
    message: 'NoSQL Injection: User input used directly in MongoDB query.',
    severity: 'CRITICAL',
    category: 'Injection',
    fix: 'Sanitize inputs and use mongoose schema validation to prevent operator injection.',
  },
  // SSRF
  {
    id: 'ssrf',
    pattern: /(fetch|axios\.get|axios\.post|http\.get|request)\s*\([^)]*(?:req\.|params\.|query\.|body\.)/gi,
    message: 'Server-Side Request Forgery (SSRF): User-controlled URL passed to HTTP request.',
    severity: 'HIGH',
    category: 'SSRF',
    fix: 'Validate and whitelist allowed URLs/domains. Block internal IP ranges.',
  },
  // Missing CORS
  {
    id: 'cors-wildcard',
    pattern: /Access-Control-Allow-Origin['":\s]+\*/g,
    message: 'Insecure CORS: Wildcard (*) allows any origin to make cross-origin requests.',
    severity: 'MEDIUM',
    category: 'Misconfiguration',
    fix: 'Specify allowed origins explicitly: Access-Control-Allow-Origin: https://yourdomain.com',
  },
  // Python specific
  {
    id: 'python-pickle',
    pattern: /pickle\.(loads|load)\s*\(/g,
    message: 'Insecure Deserialization: pickle.loads() can execute arbitrary code.',
    severity: 'CRITICAL',
    category: 'Deserialization',
    fix: 'Use JSON or MessagePack for serialization instead of pickle.',
  },
  {
    id: 'python-shell-injection',
    pattern: /os\.(system|popen)\s*\([^)]*(?:input|request\.|args\.|param)/gi,
    message: 'Shell Injection via os.system/popen with user-controlled input.',
    severity: 'CRITICAL',
    category: 'Injection',
    fix: 'Use subprocess.run() with a list of arguments instead of shell=True.',
  },
];

// ─── Run built-in scanner ──────────────────────────────────────────────────
function runBuiltinScanner(code: string): Array<{
  ruleId: string; message: string; severity: Severity;
  category: string; fix: string; line: number; code: string;
}> {
  const lines = code.split('\n');
  const results: ReturnType<typeof runBuiltinScanner> = [];
  const seen = new Set<string>();

  for (const rule of BUILTIN_RULES) {
    rule.pattern.lastIndex = 0;
    lines.forEach((line, idx) => {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(line)) {
        const key = `${rule.id}:${idx}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            ruleId: rule.id,
            message: rule.message,
            severity: rule.severity,
            category: rule.category,
            fix: rule.fix,
            line: idx + 1,
            code: line.trim(),
          });
        }
      }
    });
  }
  return results;
}

// ─── Try semgrep, fall back to built-in ───────────────────────────────────
async function runSemgrep(filePath: string, code: string): Promise<ReturnType<typeof runBuiltinScanner>> {
  try {
    const { stdout } = await execAsync(
      `semgrep --config=auto --json --quiet "${filePath}"`,
      { timeout: 30000 }
    );
    const raw = JSON.parse(stdout || '{}');
    if (!raw.results?.length) return runBuiltinScanner(code);

    return (raw.results as any[]).map(r => ({
      ruleId: r.check_id?.split('.').pop() || r.check_id,
      message: r.extra?.message || 'Potential security issue',
      severity: mapSemgrepSeverity(r.extra?.severity),
      category: r.extra?.metadata?.category || 'Security',
      fix: r.extra?.fix || r.extra?.metadata?.fix || '',
      line: r.start?.line || 1,
      code: r.extra?.lines?.trim() || '',
    }));
  } catch {
    // semgrep not installed or timed out — use built-in engine
    return runBuiltinScanner(code);
  }
}

function mapSemgrepSeverity(s: string): Severity {
  const map: Record<string, Severity> = { ERROR: 'CRITICAL', WARNING: 'HIGH', INFO: 'MEDIUM' };
  return map[s?.toUpperCase()] ?? 'MEDIUM';
}

function calcScore(findings: ReturnType<typeof runBuiltinScanner>): number {
  const deduct: Record<Severity, number> = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 3 };
  const total = findings.reduce((acc, f) => acc + (deduct[f.severity] || 0), 0);
  return Math.max(0, 100 - total);
}

// ─── Controllers ──────────────────────────────────────────────────────────

export const submitScan = async (req: Request, res: Response): Promise<void> => {
  const { code, language, filename } = req.body;

  if (!code?.trim()) { res.status(400).json({ error: 'No code provided' }); return; }
  if (code.length > 100_000) { res.status(400).json({ error: 'Code exceeds 100KB limit' }); return; }

  const ext = LANG_EXT[language] || 'txt';
  const scanId = uuidv4();
  const scanDir = join(process.cwd(), 'tmp', 'scans', scanId);
  const filePath = join(scanDir, `${filename || 'scan'}.${ext}`);

  const scan = await prisma.codeScan.create({
    data: {
      id: scanId,
      userId: req.user!.userId,
      language,
      filename: filename || `scan.${ext}`,
      sourceCode: code,
      status: 'RUNNING',
    },
  });

  // Respond immediately, run analysis async
  res.status(201).json({ scanId: scan.id, status: 'RUNNING' });

  // Async scan
  (async () => {
    try {
      await mkdir(scanDir, { recursive: true });
      await writeFile(filePath, code, 'utf8');

      io.to(`user:${req.user!.userId}`).emit('scan:started', { scanId });

      const rawFindings = await runSemgrep(filePath, code);
      const score = calcScore(rawFindings);

      const severityCounts = rawFindings.reduce((acc, f) => {
        acc[f.severity] = (acc[f.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const summary = {
        total: rawFindings.length,
        critical: severityCounts.CRITICAL || 0,
        high: severityCounts.HIGH || 0,
        medium: severityCounts.MEDIUM || 0,
        low: severityCounts.LOW || 0,
        score,
        engine: 'builtin',
      };

      // Store findings
      if (rawFindings.length > 0) {
        await prisma.scanFinding.createMany({
          data: rawFindings.map(f => ({
            scanId,
            severity: f.severity,
            ruleId: f.ruleId,
            message: f.message,
            line: f.line,
            code: f.code,
            fix: f.fix,
            category: f.category,
          })),
        });
      }

      await prisma.codeScan.update({
        where: { id: scanId },
        data: { status: 'COMPLETED', score, summary, completedAt: new Date() },
      });

      // Award security score points
      if (rawFindings.length > 0) {
        await prisma.user.update({
          where: { id: req.user!.userId },
          data: { securityScore: { increment: 50 } },
        });
      }

      io.to(`user:${req.user!.userId}`).emit('scan:complete', {
        scanId,
        findings: rawFindings,
        summary,
      });
    } catch (err) {
      await prisma.codeScan.update({
        where: { id: scanId },
        data: { status: 'FAILED' },
      });
      io.to(`user:${req.user!.userId}`).emit('scan:error', { scanId, error: 'Scan failed' });
    } finally {
      rm(scanDir, { recursive: true, force: true }).catch(() => {});
    }
  })();
};

export const getScans = async (req: Request, res: Response): Promise<void> => {
  const scans = await prisma.codeScan.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true, language: true, filename: true, status: true,
      score: true, summary: true, createdAt: true, completedAt: true,
      _count: { select: { findings: true } },
    },
  });
  res.json(scans);
};

export const getScan = async (req: Request, res: Response): Promise<void> => {
  const scan = await prisma.codeScan.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { findings: { orderBy: [{ severity: 'asc' }, { line: 'asc' }] } },
  });
  if (!scan) { res.status(404).json({ error: 'Scan not found' }); return; }
  res.json(scan);
};
