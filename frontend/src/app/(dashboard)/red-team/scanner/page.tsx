'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Code2,
  History,
  Play,
  RotateCcw,
  TerminalSquare,
} from 'lucide-react';
import type { editor } from 'monaco-editor';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { cn, formatDate, severityColor } from '@/lib/utils';
import { CodeScan, ScanFinding, ScanSummary, Severity } from '@/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type ScanLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'php' | 'go' | 'ruby' | 'c' | 'cpp';

type ScanHistoryItem = Pick<CodeScan, 'id' | 'language' | 'filename' | 'status' | 'score' | 'summary' | 'createdAt' | 'completedAt'> & {
  _count?: { findings: number };
};

type ScanSubmitResponse = { scanId: string; status: 'RUNNING' };
type ScanFindingPayload = Omit<ScanFinding, 'id' | 'scanId'>;
type ScanStartedPayload = { scanId: string };
type ScanCompletePayload = { scanId: string; findings: ScanFindingPayload[]; summary: ScanSummary };
type ScanErrorPayload = { scanId: string; error: string };

type ServerToClientEvents = {
  'scan:started': (payload: ScanStartedPayload) => void;
  'scan:complete': (payload: ScanCompletePayload) => void;
  'scan:error': (payload: ScanErrorPayload) => void;
};

type ClientToServerEvents = Record<string, never>;
type ScannerSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type LogTone = 'info' | 'success' | 'error';

interface LogLine {
  tone: LogTone;
  text: string;
}

interface FindingCardProps {
  finding: ScanFinding;
}

const LANGUAGE_OPTIONS: Array<{ value: ScanLanguage; label: string }> = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
];

const INITIAL_CODE = `function handleCheckout(userInput) {
  const query = "SELECT * FROM orders WHERE id = " + userInput.id;
  const token = "sk_live_demo_secret_token_123456";

  return fetch('http://api.example.com/payments?token=' + token)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('output').innerHTML = data;
      return eval(userInput.script);
    });
}`;

const TERMINAL_LINES: LogLine[] = [
  { tone: 'info', text: '[INFO] Connecting...' },
  { tone: 'info', text: '[INFO] Uploading...' },
  { tone: 'info', text: '[INFO] Parsing...' },
  { tone: 'info', text: '[INFO] Static analysis...' },
  { tone: 'info', text: '[INFO] Evaluating...' },
  { tone: 'success', text: '[SUCCESS] Scan complete.' },
];

function calculateScoreFromSummary(summary?: ScanSummary | null): number {
  if (!summary) return 0;
  return Math.max(0, Math.min(100, summary.score ?? 100 - (summary.critical * 25 + summary.high * 15 + summary.medium * 8 + summary.low * 3)));
}

function scoreLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate Risk';
  return 'High Risk';
}

function scoreRingAccent(score: number) {
  if (score >= 90) return '#00ff41';
  if (score >= 70) return '#00ccff';
  if (score >= 50) return '#ffaa00';
  return '#ff0033';
}

function scoreRingStyle(score: number) {
  return {
    background: `conic-gradient(${scoreRingAccent(score)} ${score}%, rgba(26,26,46,0.8) ${score}% 100%)`,
  };
}

function toneClass(tone: LogTone) {
  if (tone === 'success') return 'text-[#00ff41]';
  if (tone === 'error') return 'text-[#ff0033]';
  return 'text-[#00ccff]';
}

function severityLabel(severity: Severity) {
  return severity === 'CRITICAL' ? 'CRITICAL' : severity;
}

function FindingCard({ finding }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden border border-[#1a1a2e] bg-black/30"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left font-mono transition-colors hover:bg-[#00ccff]/5"
      >
        <span className={cn('mt-1 inline-flex h-2 w-2 shrink-0 rounded-full', severityColor[finding.severity].split(' ')[0] === 'text-[#ff0033]' ? 'bg-[#ff0033]' : finding.severity === 'HIGH' ? 'bg-[#ff6600]' : finding.severity === 'MEDIUM' ? 'bg-[#ffaa00]' : 'bg-[#00ff41]')} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#00ff41]">{finding.ruleId}</p>
            <span className="text-[10px] tracking-wider text-[#333355]">LINE {finding.line ?? 'N/A'}</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed tracking-wider text-[#0a8a3e]">{finding.message}</p>
        </div>
        <Badge className={severityColor[finding.severity]}>{severityLabel(finding.severity)}</Badge>
        {expanded ? <ChevronDown className="mt-1 h-3.5 w-3.5 shrink-0 text-[#333355]" /> : <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#333355]" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              <div>
                <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-[#333355]">VULNERABLE_SNIPPET</p>
                <pre className="overflow-x-auto border border-[#1a1a2e] bg-black/70 p-3 font-mono text-[11px] whitespace-pre-wrap break-words text-[#ffb3c1]">
                  {finding.code || 'No snippet captured.'}
                </pre>
              </div>
              <div>
                <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-[#333355]">FIX_SUGGESTION</p>
                <pre className="overflow-x-auto border border-[#1a1a2e] bg-black/70 p-3 font-mono text-[11px] whitespace-pre-wrap break-words text-[#b7ffd1]">
                  {finding.fix || 'No fix suggestion available.'}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Gauge({ score }: { score: number }) {
  const accent = scoreRingAccent(score);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-36 w-36 shrink-0 rounded-full p-2" style={scoreRingStyle(score)}>
        <div className="absolute inset-4 flex items-center justify-center rounded-full border border-[#1a1a2e] bg-[#030712]">
          <div className="text-center font-mono">
            <p className="text-3xl font-bold" style={{ color: accent }}>{score}</p>
            <p className="mt-1 text-[9px] tracking-[0.2em] text-[#333355]">SCORE</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 font-mono">
        <Badge className={cn('w-fit', score >= 90 ? 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/20' : score >= 70 ? 'text-[#00ccff] bg-[#00ccff]/10 border-[#00ccff]/20' : score >= 50 ? 'text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/20' : 'text-[#ff0033] bg-[#ff0033]/10 border-[#ff0033]/20')}>
          {scoreLabel(score)}
        </Badge>
        <div className="grid grid-cols-2 gap-2 text-[10px] tracking-wider text-[#333355]">
          <span>90-100 EXCELLENT</span>
          <span>70-89 GOOD</span>
          <span>50-69 MODERATE RISK</span>
          <span>0-49 HIGH RISK</span>
        </div>
      </div>
    </div>
  );
}

function TerminalPanel({ logs, scanning, error }: { logs: LogLine[]; scanning: boolean; error: string | null }) {
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs, scanning, error]);

  return (
    <Card className="border-[#00ccff]/20 bg-[#0a0a0f]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-3.5 w-3.5 text-[#00ccff]" />
          <CardTitle>TERMINAL PANEL</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={terminalRef} className="max-h-64 overflow-y-auto border border-[#1a1a2e] bg-black/70 p-4 font-mono text-[11px] leading-relaxed">
          {logs.map((line, index) => (
            <div key={`${line.text}-${index}`} className={cn('flex items-start gap-2', toneClass(line.tone))}>
              <span className="shrink-0 text-[#333355]">[{String(index + 1).padStart(2, '0')}]</span>
              <span className="break-words">{line.text}</span>
            </div>
          ))}
          {scanning && (
            <div className="mt-2 flex items-center gap-2 text-[#00ccff]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ccff]" />
              <span>Scanning in progress...</span>
            </div>
          )}
          {error && <div className="mt-2 text-[#ff0033]">[ERROR] {error}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryItem({ item }: { item: ScanHistoryItem }) {
  const findingCount = item._count?.findings ?? item.summary?.total ?? 0;
  const score = calculateScoreFromSummary(item.summary);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 border border-[#1a1a2e] bg-black/20 px-3 py-2 font-mono text-[10px]"
    >
      <div className={cn('h-2.5 w-2.5 rounded-full', item.status === 'COMPLETED' ? 'bg-[#00ff41]' : item.status === 'RUNNING' ? 'animate-pulse bg-[#ffaa00]' : 'bg-[#333355]')} />
      <div className="min-w-0 flex-1">
        <p className="truncate tracking-wider text-[#00ccff]">{item.filename}</p>
        <p className="tracking-wider text-[#333355]">{item.language.toUpperCase()} · {formatDate(item.createdAt)}</p>
      </div>
      <div className="text-right">
        <p className="text-[#00ff41]">{score} SCORE</p>
        <p className="text-[#333355]">{findingCount} FINDINGS</p>
      </div>
    </motion.div>
  );
}

export default function CodeScannerPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState(INITIAL_CODE);
  const [language, setLanguage] = useState<ScanLanguage>('javascript');
  const [scanId, setScanId] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<LogLine[]>([]);
  const [findings, setFindings] = useState<ScanFinding[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [editorHeight, setEditorHeight] = useState(550);

  const socketRef = useRef<ScannerSocket | null>(null);

  const { data: history = [], isLoading: historyLoading } = useQuery<ScanHistoryItem[]>({
    queryKey: ['code-scans'],
    queryFn: () => api.get<ScanHistoryItem[]>('/scans').then((response) => response.data),
  });

  const score = useMemo(() => calculateScoreFromSummary(summary), [summary]);

  const resetScannerState = () => {
    setScanId(null);
    setTerminalLogs([]);
    setFindings([]);
    setSummary(null);
    setScanning(false);
    setScanError(null);
  };

  const pushBaselineLogs = () => {
    setTerminalLogs(TERMINAL_LINES.slice(0, 5));
  };

  const connectSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return null;

    const token = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('scan:started', ({ scanId: startedScanId }) => {
      setScanId(startedScanId);
      setScanning(true);
      setScanError(null);
      pushBaselineLogs();
    });

    socket.on('scan:complete', ({ scanId: completedScanId, findings: completedFindings, summary: completedSummary }) => {
      setScanId(completedScanId);
      setScanning(false);
      setScanError(null);
      setFindings(completedFindings.map((finding: ScanFindingPayload) => ({
        ...finding,
        id: `${completedScanId}-${finding.ruleId}-${finding.line ?? 0}`,
        scanId: completedScanId,
      })));
      setSummary(completedSummary);
      setTerminalLogs([...TERMINAL_LINES]);
      void queryClient.invalidateQueries({ queryKey: ['code-scans'] });
    });

    socket.on('scan:error', ({ error }) => {
      setScanning(false);
      setScanError(error);
      setTerminalLogs((currentLogs) => [...currentLogs, { tone: 'error', text: `[ERROR] ${error}` }]);
      void queryClient.invalidateQueries({ queryKey: ['code-scans'] });
    });

    socketRef.current = socket;
    return socket;
  }, [queryClient]);

  useEffect(() => {
    const socket = connectSocket();

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [connectSocket]);

  const scanMutation = useMutation({
    mutationFn: async (payload: { code: string; language: ScanLanguage }) => {
      const response = await api.post<ScanSubmitResponse>('/scans', {
        code: payload.code,
        language: payload.language,
        filename: 'scan.js',
      });
      return response.data;
    },
    onMutate: () => {
      setTerminalLogs([{ tone: 'info', text: '[INFO] Connecting...' }]);
      setFindings([]);
      setSummary(null);
      setScanError(null);
      setScanning(true);
    },
    onSuccess: (response) => {
      setScanId(response.scanId);
      connectSocket();
    },
    onError: (error) => {
      setScanning(false);
      setScanError(error instanceof Error ? error.message : 'Unable to start scan');
      setTerminalLogs((currentLogs) => [...currentLogs, { tone: 'error', text: '[ERROR] Scan request failed.' }]);
    },
  });

  const handleNewScan = () => {
    resetScannerState();
    setCode(INITIAL_CODE);
  };

  const handleOpenHistoryItem = async (historyScanId: string) => {
    setScanning(false);
    setScanError(null);
    setTerminalLogs([{ tone: 'info', text: `[INFO] Loading scan ${historyScanId}...` }]);

    try {
      const response = await api.get<CodeScan>(`/scans/${historyScanId}`);
      const loadedScan = response.data;
      setScanId(loadedScan.id);
      setFindings((loadedScan.findings || []).map((finding) => ({ ...finding })));
      setSummary(loadedScan.summary || null);
      setTerminalLogs([...TERMINAL_LINES]);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Unable to load scan history item');
      setTerminalLogs((currentLogs) => [...currentLogs, { tone: 'error', text: '[ERROR] Unable to load scan history item.' }]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-0 flex-1 flex-col bg-[#030712]"
    >
      <Header title="CODE VULNERABILITY SCANNER" subtitle="STATIC ANALYSIS, LIVE TELEMETRY, AND PRIORITIZED REMEDIATION" />

      <div className="min-h-0 p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass border-[#00ccff]/15 bg-[#0a0a0f]/90">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>SOURCE_ANALYZER</CardTitle>
                    <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-[#333355]">MONACO EDITOR // LIVE CODE PAYLOAD</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as ScanLanguage)}
                      className="border border-[#1a1a2e] bg-black/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#00ff41] outline-none"
                    >
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <Badge className="text-[#00ccff] bg-[#00ccff]/10 border-[#00ccff]/20">SCAN.JS</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-hidden border border-[#1a1a2e] bg-black/50">
                  <MonacoEditor
                    height={`${editorHeight}px`}
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value ?? '')}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      fontFamily: 'monospace',
                      tabSize: 2,
                    }}
                    onMount={(mountedEditor: editor.IStandaloneCodeEditor) => {
                      const node = mountedEditor.getDomNode();
                      const height = node?.parentElement?.getBoundingClientRect().height;
                      if (height && height > 0) setEditorHeight(height);
                    }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#333355]">
                    <Code2 className="h-3.5 w-3.5 text-[#00ccff]" />
                    STATIC_ANALYSIS_READY
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={handleNewScan}>
                      <RotateCcw className="h-3 w-3" />
                      [ NEW SCAN ]
                    </Button>
                    <Button onClick={() => scanMutation.mutate({ code, language })} isLoading={scanMutation.isPending || scanning} disabled={!code.trim()}>
                      <Play className="h-3 w-3" />
                      [ SCAN FOR VULNERABILITIES ]
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <section className="space-y-4 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:pr-1">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass border-[#00ccff]/15 bg-[#0a0a0f]/90">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>SECURITY_SCORE</CardTitle>
                    <Badge className={cn('border', score >= 90 ? 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/20' : score >= 70 ? 'text-[#00ccff] bg-[#00ccff]/10 border-[#00ccff]/20' : score >= 50 ? 'text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/20' : 'text-[#ff0033] bg-[#ff0033]/10 border-[#ff0033]/20')}>
                      {scoreLabel(score)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Gauge score={score} />
                  <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] tracking-wider text-[#333355]">
                    <span>SCAN ID: {scanId ?? 'PENDING'}</span>
                    <span>STATUS: {scanning ? 'RUNNING' : 'IDLE'}</span>
                    <span>FINDINGS: {findings.length}</span>
                    <span>LANGUAGE: {language.toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <TerminalPanel logs={terminalLogs.length > 0 ? terminalLogs : TERMINAL_LINES.slice(0, 1)} scanning={scanning} error={scanError} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass border-[#ff0033]/15 bg-[#0a0a0f]/90">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#ff0033]" />
                    <CardTitle>FINDINGS</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {findings.length > 0 ? (
                    <div className="space-y-2">
                      {findings.map((finding) => (
                        <FindingCard key={finding.id} finding={finding} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-[#1a1a2e] bg-black/20 px-4 py-8 text-center font-mono text-[10px] tracking-wider text-[#333355]">
                      NO FINDINGS YET. RUN A SCAN TO REVIEW SECURITY OUTPUT.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="glass border-[#00ff41]/15 bg-[#0a0a0f]/90">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-[#00ff41]" />
                    <CardTitle>SCAN_HISTORY</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }, (_, index) => (
                        <div key={index} className="h-12 animate-pulse border border-[#1a1a2e] bg-black/30" />
                      ))}
                    </div>
                  ) : history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <button key={item.id} type="button" onClick={() => handleOpenHistoryItem(item.id)} className="w-full text-left">
                          <HistoryItem item={item} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-[#1a1a2e] bg-black/20 px-4 py-8 text-center font-mono text-[10px] tracking-wider text-[#333355]">
                      NO SCANS YET. START YOUR FIRST ANALYSIS ABOVE.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}