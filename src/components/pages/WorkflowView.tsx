'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import {
  WORKFLOWS,
  ROLE_META,
  type Workflow,
  type WorkflowStep,
} from '@/data/workflows';

// ── Layout constants ─────────────────────────────────────────────

const CARD_W = 270;
const TRIGGER_W = 140;
const BRANCH_W = 160;
const GAP_X = 80;
const BRANCH_GAP = 40;

// Column X positions (7 columns now)
const COL0 = 50;                                    // Incoming Lead
const COL1 = COL0 + TRIGGER_W + GAP_X;              // Branch cards (Message / Call)
const COL2 = COL1 + BRANCH_W + GAP_X;               // Step 1 (DM / Director)
const COL3 = COL2 + CARD_W + GAP_X;                 // Step 2 Qualification (Agent)
const COL4 = COL3 + CARD_W + GAP_X;                 // Step 3 Meeting (Agent)
const COL5 = COL4 + CARD_W + GAP_X;                 // Step 4 Publishing (DM)
const COL6 = COL5 + CARD_W + GAP_X;                 // Step 5 Follow-ups

// Initial estimated card heights
const H_TRIGGER = 80;
const H_BRANCH_TOP = 140;
const H_BRANCH_BOT = 90;
const H_STEP1_DM = 340;
const H_STEP1_DIR = 400;
const H_STEP2 = 260;
const H_STEP3 = 200;
const H_STEP4 = 430;
const H_FOLLOW_DM = 175;
const H_FOLLOW_AGT = 160;

// Helper: center-right and center-left points of a positioned card
const rightOf = (p: { x: number; y: number; w: number; h: number }) => ({ x: p.x + p.w, y: p.y + p.h / 2 });
const leftOf = (p: { x: number; y: number; h: number }) => ({ x: p.x, y: p.y + p.h / 2 });

// ── Trigger Icons ────────────────────────────────────────────────

function TriggerIcon({ icon, className }: { icon: string; className?: string }) {
  const c = className || 'w-4 h-4';
  const icons: Record<string, React.ReactNode> = {
    whatsapp: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    email: <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>,
    website: <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"/></svg>,
    facebook: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    phone: <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>,
    social: <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>,
  };
  return icons[icon] || <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx={12} cy={12} r={9}/></svg>;
}

// ── Tool Tag ─────────────────────────────────────────────────────

function ToolTag({ name, isDark }: { name: string; isDark: boolean }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium"
      style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
      }}
    >
      {name}
    </span>
  );
}

// ── Step Card ────────────────────────────────────────────────────

function StepCard({ step, isDark }: {
  step: WorkflowStep; isDark: boolean;
}) {
  const meta = ROLE_META[step.responsible];
  const hasTasks = step.tasks.length > 0;
  const isFollowUp = step.id.includes('followup');

  return (
    <div className="relative" style={{ width: CARD_W, paddingTop: 14 }}>
      {/* Role sticker tag — centered above the card border */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-t-md text-[11px] font-bold tracking-wide whitespace-nowrap"
        style={{ background: meta.color, color: '#fff' }}
      >
        {meta.label}
      </div>

      <div
        className="card overflow-hidden"
        style={{ width: CARD_W, borderTop: `3px solid ${meta.color}` }}
      >
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-[14px] font-extrabold shrink-0"
            style={{ background: `${meta.color}20`, color: meta.color }}
          >
            {isFollowUp ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            ) : step.stepNumber}
          </div>
          <span className="text-sm font-extrabold flex-1 truncate uppercase tracking-wide" style={{ color: isDark ? '#fff' : '#1e293b' }}>
            {step.title}
          </span>
        </div>

        {/* Gate condition */}
        {step.gateCondition && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md mt-2 text-[9px] font-semibold"
            style={{ background: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.15)' }}
          >
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            IF: {step.gateCondition}
          </div>
        )}

        {/* Recurrence */}
        {step.recurrence && (
          <div className="flex items-start gap-2 mt-2">
            <div
              className="px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1 shrink-0"
              style={{ background: `${meta.color}15`, color: meta.color }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {step.recurrence.frequency}
            </div>
            <div>
              <span className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)' }}>
                {step.recurrence.task}
              </span>
              {step.recurrence.tools && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {step.recurrence.tools.map((t, i) => <ToolTag key={i} name={t} isDark={isDark} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tasks — always visible */}
      {hasTasks && (
        <>
          <div className="mx-4 h-px" style={{ background: isDark ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' : 'linear-gradient(to right, transparent, rgba(15,23,42,0.06), transparent)' }} />
          <div className="px-4 py-3 space-y-2">
            {step.tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: meta.color }} />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)' }}>{task.label}</span>
                  {task.description && <span className="text-[10px] ml-1" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)' }}>({task.description})</span>}
                  {task.tools && task.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {task.tools.map((t, j) => <ToolTag key={j} name={t} isDark={isDark} />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Handoff */}
      {step.handoff && (
        <div
          className="px-4 py-2 flex items-center gap-2 text-[10px]"
          style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}`, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)' }}
        >
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: ROLE_META[step.handoff.from].color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span className="flex-1">{step.handoff.task}</span>
          <span className="text-[8px] font-bold shrink-0" style={{ color: ROLE_META[step.handoff.to].color }}>
            {ROLE_META[step.handoff.to].label}
          </span>
        </div>
      )}
      </div>
    </div>
  );
}

// ── Trigger Node (just "Incoming Lead" label) ───────────────────

function TriggerNode({ workflow, isDark }: { workflow: Workflow; isDark: boolean }) {
  return (
    <div className="card overflow-hidden" style={{ width: TRIGGER_W, borderTop: `3px solid ${workflow.color}` }}>
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-extrabold shrink-0" style={{ background: `${workflow.color}20`, color: workflow.color }}>0</div>
          <span className="text-sm font-extrabold uppercase tracking-wide" style={{ color: isDark ? '#fff' : '#1e293b' }}>Incoming Lead</span>
        </div>
      </div>
    </div>
  );
}

// ── Branch Card (channel group: Message or Call) ────────────────

function BranchCard({ label, color, triggers, isDark }: {
  label: string; color: string;
  triggers: { label: string; icon: string }[];
  isDark: boolean;
}) {
  const pillStyle = {
    background: isDark ? `${color}10` : `${color}06`,
    color,
    border: `1px solid ${color}20`,
  };

  return (
    <div className="card overflow-hidden" style={{ width: BRANCH_W, borderTop: `3px solid ${color}` }}>
      <div className="px-3 pt-3 pb-1">
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color }}>{label}</div>
        <div className="flex flex-wrap gap-1 pb-2">
          {triggers.map((t, i) => (
            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium" style={pillStyle}>
              <TriggerIcon icon={t.icon} className="w-2.5 h-2.5" />{t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Zoom Controls ────────────────────────────────────────────────

function ZoomControls({ isDark }: { isDark: boolean }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const s = {
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
  };
  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1">
      <button onClick={() => zoomIn()} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity" style={s}>+</button>
      <button onClick={() => zoomOut()} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity" style={s}>−</button>
      <button onClick={() => resetTransform()} className="h-8 px-2.5 rounded-lg flex items-center justify-center text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity" style={s}>Fit</button>
    </div>
  );
}

// ── Dynamic position computation ────────────────────────────────

type CardKey = 'trigger' | 'branchTop' | 'branchBot' | 'step1Top' | 'step1Bot' | 'step2' | 'step3' | 'step4' | 'step5Top' | 'step5Bot';

interface CardPos { x: number; y: number; w: number; h: number }

function computePositions(heights: Record<CardKey, number>): Record<CardKey, CardPos> {
  const ht = heights;

  // Find the tallest column to determine CENTER_Y
  const col0H = ht.trigger;
  const col1H = ht.branchTop + BRANCH_GAP + ht.branchBot;
  const col2H = ht.step1Top + BRANCH_GAP + ht.step1Bot;
  const col3H = ht.step2;
  const col4H = ht.step3;
  const col5H = ht.step4;
  const col6H = ht.step5Top + BRANCH_GAP + ht.step5Bot;
  const maxH = Math.max(col0H, col1H, col2H, col3H, col4H, col5H, col6H);
  const cy = maxH / 2 + 40;

  const single = (h: number) => cy - h / 2;
  const pair = (hTop: number, hBot: number) => {
    const total = hTop + BRANCH_GAP + hBot;
    const topY = cy - total / 2;
    return { topY, botY: topY + hTop + BRANCH_GAP };
  };

  const br = pair(ht.branchTop, ht.branchBot);
  const s1 = pair(ht.step1Top, ht.step1Bot);
  const s5 = pair(ht.step5Top, ht.step5Bot);

  return {
    trigger:   { x: COL0, y: single(ht.trigger), w: TRIGGER_W, h: ht.trigger },
    branchTop: { x: COL1, y: br.topY, w: BRANCH_W, h: ht.branchTop },
    branchBot: { x: COL1, y: br.botY, w: BRANCH_W, h: ht.branchBot },
    step1Top:  { x: COL2, y: s1.topY, w: CARD_W, h: ht.step1Top },
    step1Bot:  { x: COL2, y: s1.botY, w: CARD_W, h: ht.step1Bot },
    step2:     { x: COL3, y: single(ht.step2), w: CARD_W, h: ht.step2 },
    step3:     { x: COL4, y: single(ht.step3), w: CARD_W, h: ht.step3 },
    step4:     { x: COL5, y: single(ht.step4), w: CARD_W, h: ht.step4 },
    step5Top:  { x: COL6, y: s5.topY, w: CARD_W, h: ht.step5Top },
    step5Bot:  { x: COL6, y: s5.botY, w: CARD_W, h: ht.step5Bot },
  };
}

// ── Dynamic Connectors ──────────────────────────────────────────

function DynamicConnectors({ pos, isDark }: { pos: Record<CardKey, CardPos>; isDark: boolean }) {
  const stroke = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)';
  const arrow = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)';

  const trigR = rightOf(pos.trigger);
  const brTopL = leftOf(pos.branchTop);
  const brTopR = rightOf(pos.branchTop);
  const brBotL = leftOf(pos.branchBot);
  const brBotR = rightOf(pos.branchBot);
  const s1TopL = leftOf(pos.step1Top);
  const s1TopR = rightOf(pos.step1Top);
  const s1BotL = leftOf(pos.step1Bot);
  const s1BotR = rightOf(pos.step1Bot);
  const s2L = leftOf(pos.step2);
  const s2R = rightOf(pos.step2);
  const s3L = leftOf(pos.step3);
  const s3R = rightOf(pos.step3);
  const s4L = leftOf(pos.step4);
  const s4R = rightOf(pos.step4);
  const s5TopL = leftOf(pos.step5Top);
  const s5BotL = leftOf(pos.step5Bot);

  const mid01 = (trigR.x + brTopL.x) / 2;
  const mid23 = (s1TopR.x + s2L.x) / 2;
  const mid56 = (s4R.x + s5TopL.x) / 2;

  const maxX = Math.max(...Object.values(pos).map(p => p.x + p.w)) + 60;
  const maxY = Math.max(...Object.values(pos).map(p => p.y + p.h)) + 60;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: maxX, height: maxY }}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <path d="M0 0L7 2.5L0 5z" fill={arrow} />
        </marker>
      </defs>

      {/* Trigger → Branch cards (forking = dashed) */}
      <path d={`M ${trigR.x} ${trigR.y} C ${mid01} ${trigR.y}, ${mid01} ${brTopL.y}, ${brTopL.x} ${brTopL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
      <path d={`M ${trigR.x} ${trigR.y} C ${mid01} ${trigR.y}, ${mid01} ${brBotL.y}, ${brBotL.x} ${brBotL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />

      {/* Branch top → Step 1 top (straight, solid — same lane) */}
      <line x1={brTopR.x} y1={brTopR.y} x2={s1TopL.x} y2={s1TopL.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
      {/* Branch bottom → Step 1 bottom (straight, solid — same lane) */}
      <line x1={brBotR.x} y1={brBotR.y} x2={s1BotL.x} y2={s1BotL.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* Step 1 → Step 2 (merging = dashed) */}
      <path d={`M ${s1TopR.x} ${s1TopR.y} C ${mid23} ${s1TopR.y}, ${mid23} ${s2L.y}, ${s2L.x} ${s2L.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
      <path d={`M ${s1BotR.x} ${s1BotR.y} C ${mid23} ${s1BotR.y}, ${mid23} ${s2L.y}, ${s2L.x} ${s2L.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />

      {/* Step 2 → Step 3 Meeting (single to single = solid) */}
      <line x1={s2R.x} y1={s2R.y} x2={s3L.x} y2={s3L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* Step 3 Meeting → Step 4 Publishing (single to single = solid) */}
      <line x1={s3R.x} y1={s3R.y} x2={s4L.x} y2={s4L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* Step 4 Publishing → Step 5 Follow-ups (forking = dashed) */}
      <path d={`M ${s4R.x} ${s4R.y} C ${mid56} ${s4R.y}, ${mid56} ${s5TopL.y}, ${s5TopL.x} ${s5TopL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
      <path d={`M ${s4R.x} ${s4R.y} C ${mid56} ${s4R.y}, ${mid56} ${s5BotL.y}, ${s5BotL.x} ${s5BotL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
    </svg>
  );
}

// ── Canvas ───────────────────────────────────────────────────────

function WorkflowCanvas({ workflow, isDark }: { workflow: Workflow; isDark: boolean }) {
  const [pos, setPos] = useState<Record<CardKey, CardPos>>(() =>
    computePositions({
      trigger: H_TRIGGER, branchTop: H_BRANCH_TOP, branchBot: H_BRANCH_BOT,
      step1Top: H_STEP1_DM, step1Bot: H_STEP1_DIR,
      step2: H_STEP2, step3: H_STEP3, step4: H_STEP4,
      step5Top: H_FOLLOW_DM, step5Bot: H_FOLLOW_AGT,
    })
  );

  const refs = {
    trigger: useRef<HTMLDivElement>(null),
    branchTop: useRef<HTMLDivElement>(null),
    branchBot: useRef<HTMLDivElement>(null),
    step1Top: useRef<HTMLDivElement>(null),
    step1Bot: useRef<HTMLDivElement>(null),
    step2: useRef<HTMLDivElement>(null),
    step3: useRef<HTMLDivElement>(null),
    step4: useRef<HTMLDivElement>(null),
    step5Top: useRef<HTMLDivElement>(null),
    step5Bot: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const heights: Record<CardKey, number> = {
        trigger: refs.trigger.current?.offsetHeight || H_TRIGGER,
        branchTop: refs.branchTop.current?.offsetHeight || H_BRANCH_TOP,
        branchBot: refs.branchBot.current?.offsetHeight || H_BRANCH_BOT,
        step1Top: refs.step1Top.current?.offsetHeight || H_STEP1_DM,
        step1Bot: refs.step1Bot.current?.offsetHeight || H_STEP1_DIR,
        step2: refs.step2.current?.offsetHeight || H_STEP2,
        step3: refs.step3.current?.offsetHeight || H_STEP3,
        step4: refs.step4.current?.offsetHeight || H_STEP4,
        step5Top: refs.step5Top.current?.offsetHeight || H_FOLLOW_DM,
        step5Bot: refs.step5Bot.current?.offsetHeight || H_FOLLOW_AGT,
      };
      setPos(computePositions(heights));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const find = (id: string) => workflow.steps.find(s => s.id === id)!;

  const digital = workflow.triggers.filter(t => t.channel !== 'direct');
  const direct = workflow.triggers.filter(t => t.channel === 'direct');

  const canvasW = Math.max(...Object.values(pos).map(p => p.x + p.w)) + 60;
  const canvasH = Math.max(...Object.values(pos).map(p => p.y + p.h)) + 60;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        height: 'calc(100vh - 180px)',
        minHeight: 550,
        background: isDark
          ? 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.008) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(15,23,42,0.008) 0%, transparent 70%)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}`,
      }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)' : 'radial-gradient(rgba(15,23,42,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      <TransformWrapper initialScale={0.65} minScale={0.2} maxScale={2.5} initialPositionX={20} initialPositionY={10} limitToBounds={false} panning={{ velocityDisabled: true }}>
        <ZoomControls isDark={isDark} />
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: canvasW, height: canvasH }}>

          <DynamicConnectors pos={pos} isDark={isDark} />

          {/* COL 0: Trigger */}
          <div ref={refs.trigger} className="absolute" style={{ left: pos.trigger.x, top: pos.trigger.y }}>
            <TriggerNode workflow={workflow} isDark={isDark} />
          </div>

          {/* COL 1 top: Message branch */}
          <div ref={refs.branchTop} className="absolute" style={{ left: pos.branchTop.x, top: pos.branchTop.y }}>
            <BranchCard label="Message" color="#8b5cf6" triggers={digital} isDark={isDark} />
          </div>

          {/* COL 1 bottom: Call branch */}
          <div ref={refs.branchBot} className="absolute" style={{ left: pos.branchBot.x, top: pos.branchBot.y }}>
            <BranchCard label="Call" color="#d4a853" triggers={direct} isDark={isDark} />
          </div>

          {/* COL 2 top: DM Processing */}
          <div ref={refs.step1Top} className="absolute" style={{ left: pos.step1Top.x, top: pos.step1Top.y }}>
            <StepCard step={find('step-1b')} isDark={isDark} />
          </div>

          {/* COL 2 bottom: Director Processing */}
          <div ref={refs.step1Bot} className="absolute" style={{ left: pos.step1Bot.x, top: pos.step1Bot.y }}>
            <StepCard step={find('step-1a')} isDark={isDark} />
          </div>

          {/* COL 3: Agent Qualification */}
          <div ref={refs.step2} className="absolute" style={{ left: pos.step2.x, top: pos.step2.y }}>
            <StepCard step={find('step-2')} isDark={isDark} />
          </div>

          {/* COL 4: Agent Meeting */}
          <div ref={refs.step3} className="absolute" style={{ left: pos.step3.x, top: pos.step3.y }}>
            <StepCard step={find('step-3')} isDark={isDark} />
          </div>

          {/* COL 5: DM Publishing */}
          <div ref={refs.step4} className="absolute" style={{ left: pos.step4.x, top: pos.step4.y }}>
            <StepCard step={find('step-4')} isDark={isDark} />
          </div>

          {/* COL 6 top: DM Follow-Up */}
          <div ref={refs.step5Top} className="absolute" style={{ left: pos.step5Top.x, top: pos.step5Top.y }}>
            <StepCard step={find('followup-dm')} isDark={isDark} />
          </div>

          {/* COL 6 bottom: Agent Follow-Up */}
          <div ref={refs.step5Bot} className="absolute" style={{ left: pos.step5Bot.x, top: pos.step5Bot.y }}>
            <StepCard step={find('followup-agent')} isDark={isDark} />
          </div>

        </TransformComponent>
      </TransformWrapper>

      {/* Hints */}
      <div className="absolute bottom-4 left-4 z-20 text-[10px] flex items-center gap-3" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)' }}>
        <span>Scroll to zoom</span>
        <span>Drag to pan</span>
      </div>
    </div>
  );
}

// ── Main View ────────────────────────────────────────────────────

export default function WorkflowView() {
  const { isDark } = useTheme();
  const [activeWorkflowId, setActiveWorkflowId] = useState(WORKFLOWS[0].id);
  const activeWorkflow = WORKFLOWS.find(w => w.id === activeWorkflowId) || WORKFLOWS[0];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${activeWorkflow.color}20, ${activeWorkflow.color}08)`, border: `1px solid ${activeWorkflow.color}15` }}>
            <svg className="w-5 h-5" style={{ color: activeWorkflow.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: isDark ? '#fff' : '#1e293b' }}>{activeWorkflow.title}</h2>
            <p className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)' }}>{activeWorkflow.subtitle}</p>
          </div>
        </div>
        {WORKFLOWS.length > 1 && (
          <div className="flex items-center gap-2">
            {WORKFLOWS.map(w => (
              <button key={w.id} onClick={() => setActiveWorkflowId(w.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 shrink-0 cursor-pointer"
                style={{ background: w.id === activeWorkflowId ? `${w.color}12` : 'transparent', border: `1px solid ${w.id === activeWorkflowId ? `${w.color}25` : 'transparent'}`, color: w.id === activeWorkflowId ? w.color : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)') }}
              >{w.title}</button>
            ))}
          </div>
        )}
      </div>
      <WorkflowCanvas workflow={activeWorkflow} isDark={isDark} />
    </div>
  );
}
