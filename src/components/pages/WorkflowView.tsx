'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import {
  WORKFLOWS,
  ROLE_META,
  type Workflow,
  type WorkflowStep,
  type WorkflowTask,
  type RoleId,
  type ConnectorConfig,
} from '@/data/workflows';

// ── Layout constants ─────────────────────────────────────────────

const CARD_W = 320;
const TRIGGER_W = 140;
const BRANCH_W = 160;
const GAP_X = 80;
const BRANCH_GAP = 40;

// Column X positions (7 columns now)
const COL0 = 50;                                    // Incoming Lead
const COL1 = COL0 + TRIGGER_W + GAP_X;              // Branch cards (Message / Call)
const COL2 = COL1 + BRANCH_W + GAP_X;               // Step 1 (DM / Director)
const COL3 = COL2 + CARD_W + GAP_X;                 // Step 2 Qualification (Agent)
const COL4 = COL3 + CARD_W + GAP_X * 3;             // Step 3 — triple gap for condition boxes
const COL5 = COL4 + CARD_W + GAP_X * 2;             // Step 4 Publishing (DM) — double gap for condition box
const COL6 = COL5 + CARD_W + GAP_X * 2;             // Step 5 Follow-ups / Links — double gap for condition boxes

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
// StepCards/LinkStepCards have paddingTop=14 for the role sticker, so their
// visual center is 7px lower than the geometric center of the DOM element.
const STEP_PAD_OFFSET = 7;
const rightOf = (p: { x: number; y: number; w: number; h: number }, isStep = false) =>
  ({ x: p.x + p.w, y: p.y + p.h / 2 + (isStep ? STEP_PAD_OFFSET : 0) });
const leftOf = (p: { x: number; y: number; h: number }, isStep = false) =>
  ({ x: p.x, y: p.y + p.h / 2 + (isStep ? STEP_PAD_OFFSET : 0) });

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
    crm: <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75m16.5 3.75v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" /></svg>,
  };
  return icons[icon] || <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx={12} cy={12} r={9}/></svg>;
}

// ── Involves Avatar ──────────────────────────────────────────────

function SingleAvatar({ id, isDark }: { id: RoleId | 'lead' | 'partner'; isDark: boolean }) {
  if (id === 'lead') {
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)' }}
        title="Lead / Owner"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
    );
  }
  if (id === 'partner') {
    const partnerColor = '#ef4444';
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0"
        style={{ background: `${partnerColor}20`, color: partnerColor }}
        title="Partner"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
    );
  }
  const meta = ROLE_META[id];
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0"
      style={{ background: `${meta.color}20`, color: meta.color }}
      title={meta.label}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
  );
}

function InvolvesAvatar({ involves, isDark }: { involves: (RoleId | 'lead' | 'partner') | (RoleId | 'lead' | 'partner')[]; isDark: boolean }) {
  const ids = Array.isArray(involves) ? involves : [involves];
  return (
    <div className="flex shrink-0" style={{ gap: 0 }}>
      {ids.map((id, i) => (
        <div key={i} style={i > 0 ? { marginLeft: -6 } : undefined}>
          <SingleAvatar id={id} isDark={isDark} />
        </div>
      ))}
    </div>
  );
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

      {/* Tasks — sub-cards */}
      {hasTasks && (
        <div className="px-3 pb-3 pt-1 space-y-1.5">
          {step.tasks.map((task, i) => (
            <div
              key={i}
              className="rounded-lg px-2.5 py-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.015)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded shrink-0"
                  style={{
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'}`,
                  }}
                />
                <span className="text-[10px] font-medium leading-tight min-w-0" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)' }}>{task.label}</span>
                {task.tools && task.tools.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {task.tools.map((t, j) => <ToolTag key={j} name={t} isDark={isDark} />)}
                  </div>
                )}
                <div className="flex-1" />
                {task.involves && (
                  <InvolvesAvatar involves={task.involves} isDark={isDark} />
                )}
              </div>
            </div>
          ))}
        </div>
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

// ── Link Step Card (links to another workflow) ──────────────────

function LinkStepCard({ step, isDark, onNavigate }: { step: WorkflowStep; isDark: boolean; onNavigate?: (workflowId: string) => void }) {
  const meta = ROLE_META[step.responsible];
  const targetWorkflow = WORKFLOWS.find(w => w.id === step.linkTo);
  const targetTitle = targetWorkflow?.title || step.linkTo || '';

  return (
    <div
      className="relative cursor-pointer group"
      style={{ width: CARD_W, paddingTop: 14 }}
      onClick={() => step.linkTo && onNavigate?.(step.linkTo)}
    >
      {/* Role sticker tag */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-t-md text-[11px] font-bold tracking-wide whitespace-nowrap"
        style={{ background: meta.color, color: '#fff' }}
      >
        {meta.label}
      </div>

      <div
        className="card overflow-hidden transition-all duration-200 group-hover:scale-[1.02]"
        style={{
          width: CARD_W,
          borderTop: `3px solid ${meta.color}`,
          border: `2px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'}`,
          borderTopWidth: 3,
          borderTopStyle: 'solid',
          borderTopColor: meta.color,
        }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: `${meta.color}20`, color: meta.color }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-extrabold uppercase tracking-wide block" style={{ color: isDark ? '#fff' : '#1e293b' }}>
                {step.title}
              </span>
              <span className="text-[9px] font-medium block mt-0.5 group-hover:underline" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)' }}>
                Go to workflow: {targetTitle}
              </span>
            </div>
          </div>
        </div>
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
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: `${workflow.color}20`, color: workflow.color }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
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

function ZoomControls({ isDark, canvasW, canvasH, containerRef }: {
  isDark: boolean;
  canvasW: number;
  canvasH: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { zoomIn, zoomOut, centerView } = useControls();
  const s = {
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.15)'}`,
    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.6)',
    boxShadow: isDark ? 'none' : '0 1px 4px rgba(15,23,42,0.08)',
  };

  const handleFit = () => {
    if (!containerRef.current || canvasW <= 0 || canvasH <= 0) {
      centerView(0.5, 300);
      return;
    }
    const cw = containerRef.current.offsetWidth;
    const ch = containerRef.current.offsetHeight;
    const scaleX = cw / canvasW;
    const scaleY = ch / canvasH;
    const fitScale = Math.min(scaleX, scaleY) * 0.9;
    const clampedScale = Math.max(0.15, Math.min(fitScale, 1.2));
    centerView(clampedScale, 300);
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1">
      <button onClick={() => zoomIn()} className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity" style={s}>+</button>
      <button onClick={() => zoomOut()} className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity" style={s}>−</button>
      <button onClick={handleFit} className="h-10 px-3 rounded-lg flex items-center justify-center text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity" style={s}>Fit</button>
    </div>
  );
}

// ── Dynamic position computation ────────────────────────────────

type CardKey = 'trigger' | 'branchTop' | 'branchBot' | 'step1Top' | 'step1Bot' | 'step2' | 'step3' | 'step3bis' | 'step4' | 'step4bis' | 'step5' | 'step5bis' | 'step6' | 'step6bis' | 'step7' | 'step7bis' | 'step8' | 'step8bis' | 'step9' | 'step5Top' | 'step5Bot';

interface CardPos { x: number; y: number; w: number; h: number }

function computePositions(heights: Record<CardKey, number>): Record<CardKey, CardPos> {
  const ht = heights;
  const hasStep3bis = ht.step3bis > 0;
  const hasStep4bis = ht.step4bis > 0;
  const hasStep5 = ht.step5 > 0;
  const hasStep5bis = ht.step5bis > 0;
  const hasStep6 = ht.step6 > 0;
  const hasStep6bis = ht.step6bis > 0;
  const hasStep7 = ht.step7 > 0;
  const hasStep7bis = ht.step7bis > 0;
  const hasStep8 = ht.step8 > 0;
  const hasStep8bis = ht.step8bis > 0;
  const hasStep9 = ht.step9 > 0;
  const hasEnd = ht.step5Top > 0 || ht.step5Bot > 0;

  // Dynamic column positions for step5+
  const COL_STEP5 = COL5 + CARD_W + GAP_X * 2;
  const COL_STEP6 = COL_STEP5 + CARD_W + GAP_X * 2;
  const COL_STEP7 = COL_STEP6 + CARD_W + GAP_X * 2;
  const COL_STEP8 = COL_STEP7 + CARD_W + GAP_X * 2;
  const COL_STEP9 = COL_STEP8 + CARD_W + GAP_X * 2;
  // End column shifts right based on which steps exist
  const COL_END = hasStep9 ? COL_STEP9 + CARD_W + GAP_X * 2
    : hasStep8 ? COL_STEP8 + CARD_W + GAP_X * 2
    : hasStep7 ? COL_STEP7 + CARD_W + GAP_X * 2
    : hasStep6 ? COL_STEP6 + CARD_W + GAP_X * 2
    : hasStep5 ? COL_STEP5 + CARD_W + GAP_X * 2
    : COL6;

  // Find the tallest column to determine CENTER_Y
  const col0H = ht.trigger;
  const col1H = ht.branchTop + BRANCH_GAP + ht.branchBot;
  const col2H = ht.step1Top + BRANCH_GAP + ht.step1Bot;
  const col3H = ht.step2;
  const col4H = hasStep3bis ? ht.step3 + BRANCH_GAP + ht.step3bis : ht.step3;
  const col5H = hasStep4bis ? ht.step4 + BRANCH_GAP + ht.step4bis : ht.step4;
  const col6H = hasStep5bis ? ht.step5 + BRANCH_GAP + ht.step5bis : (hasStep5 ? ht.step5 : 0);
  const col7H = hasStep6bis ? ht.step6 + BRANCH_GAP + ht.step6bis : (hasStep6 ? ht.step6 : 0);
  const col8H = hasStep7bis ? ht.step7 + BRANCH_GAP + ht.step7bis : (hasStep7 ? ht.step7 : 0);
  const col9H = hasStep8bis ? ht.step8 + BRANCH_GAP + ht.step8bis : (hasStep8 ? ht.step8 : 0);
  const col10H = hasStep9 ? ht.step9 : 0;
  const colEndH = hasEnd ? ht.step5Top + BRANCH_GAP + ht.step5Bot : 0;
  const maxH = Math.max(col0H, col1H, col2H, col3H, col4H, col5H, col6H, col7H, col8H, col9H, col10H, colEndH);
  const cy = maxH / 2 + 40;

  const single = (h: number) => cy - h / 2;
  const pair = (hTop: number, hBot: number) => {
    const total = hTop + BRANCH_GAP + hBot;
    const topY = cy - total / 2;
    return { topY, botY: topY + hTop + BRANCH_GAP };
  };

  const br = pair(ht.branchTop, ht.branchBot);
  const s1 = pair(ht.step1Top, ht.step1Bot);
  const sEnd = hasEnd ? pair(ht.step5Top, ht.step5Bot) : { topY: 0, botY: 0 };

  // Step3 and step3bis: pair if step3bis exists, otherwise single
  const s3 = hasStep3bis ? pair(ht.step3, ht.step3bis) : null;
  // Step4 and step4bis: pair if step4bis exists, otherwise single
  const s4 = hasStep4bis ? pair(ht.step4, ht.step4bis) : null;
  // Step5 and step5bis: pair if step5bis exists, otherwise single
  const s5inline = hasStep5bis ? pair(ht.step5, ht.step5bis) : null;
  // Step6 and step6bis: pair if step6bis exists, otherwise single
  const s6 = hasStep6bis ? pair(ht.step6, ht.step6bis) : null;
  // Step7 and step7bis: pair if step7bis exists, otherwise single
  const s7 = hasStep7bis ? pair(ht.step7, ht.step7bis) : null;
  // Step8 and step8bis: pair if step8bis exists, otherwise single
  const s8 = hasStep8bis ? pair(ht.step8, ht.step8bis) : null;

  return {
    trigger:   { x: COL0, y: single(ht.trigger), w: TRIGGER_W, h: ht.trigger },
    branchTop: { x: COL1, y: br.topY, w: BRANCH_W, h: ht.branchTop },
    branchBot: { x: COL1, y: br.botY, w: BRANCH_W, h: ht.branchBot },
    step1Top:  { x: COL2, y: s1.topY, w: CARD_W, h: ht.step1Top },
    step1Bot:  { x: COL2, y: s1.botY, w: CARD_W, h: ht.step1Bot },
    step2:     { x: COL3, y: single(ht.step2), w: CARD_W, h: ht.step2 },
    step3:     { x: COL4, y: s3 ? s3.topY : single(ht.step3), w: CARD_W, h: ht.step3 },
    step3bis:  { x: COL4, y: s3 ? s3.botY : single(0), w: CARD_W, h: ht.step3bis },
    step4:     { x: COL5, y: s4 ? s4.topY : single(ht.step4), w: CARD_W, h: ht.step4 },
    step4bis:  { x: COL5, y: s4 ? s4.botY : single(0), w: CARD_W, h: ht.step4bis },
    step5:     { x: COL_STEP5, y: s5inline ? s5inline.topY : (hasStep5 ? single(ht.step5) : single(0)), w: CARD_W, h: ht.step5 },
    step5bis:  { x: COL_STEP5, y: s5inline ? s5inline.botY : single(0), w: CARD_W, h: ht.step5bis },
    step6:     { x: COL_STEP6, y: s6 ? s6.topY : (hasStep6 ? single(ht.step6) : single(0)), w: CARD_W, h: ht.step6 },
    step6bis:  { x: COL_STEP6, y: s6 ? s6.botY : single(0), w: CARD_W, h: ht.step6bis },
    step7:     { x: COL_STEP7, y: s7 ? s7.topY : (hasStep7 ? single(ht.step7) : single(0)), w: CARD_W, h: ht.step7 },
    step7bis:  { x: COL_STEP7, y: s7 ? s7.botY : single(0), w: CARD_W, h: ht.step7bis },
    step8:     { x: COL_STEP8, y: s8 ? s8.topY : (hasStep8 ? single(ht.step8) : single(0)), w: CARD_W, h: ht.step8 },
    step8bis:  { x: COL_STEP8, y: s8 ? s8.botY : single(0), w: CARD_W, h: ht.step8bis },
    step9:     { x: COL_STEP9, y: hasStep9 ? single(ht.step9) : single(0), w: CARD_W, h: ht.step9 },
    step5Top:  { x: COL_END, y: sEnd.topY, w: CARD_W, h: ht.step5Top },
    step5Bot:  { x: COL_END, y: sEnd.botY, w: CARD_W, h: ht.step5Bot },
  };
}

// ── Dynamic Connectors ──────────────────────────────────────────

function ConditionBox({ x, y, label, borderColor, isDark, stroke }: {
  x: number; y: number; label: string; borderColor: string; isDark: boolean; stroke: string;
}) {
  // Split into 2 lines if label is long
  const MAX_SINGLE_LINE = 14;
  const needsWrap = label.length > MAX_SINGLE_LINE;
  let line1 = label;
  let line2 = '';
  if (needsWrap) {
    const mid = Math.floor(label.length / 2);
    const spaceAfter = label.indexOf(' ', mid);
    const spaceBefore = label.lastIndexOf(' ', mid);
    const splitAt = spaceAfter !== -1 ? spaceAfter
      : spaceBefore !== -1 ? spaceBefore
      : mid;
    line1 = label.slice(0, splitAt);
    line2 = label.slice(splitAt + 1);
  }

  const longestLine = needsWrap ? Math.max(line1.length, line2.length) : label.length;
  const boxW = Math.max(longestLine * 8 + 24, 60);
  const boxH = needsWrap ? 32 : 22;
  const textFill = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)';

  return (
    <>
      <rect x={x - boxW / 2} y={y - boxH / 2} width={boxW} height={boxH} rx={6}
        fill={isDark ? 'rgba(6,7,10,0.9)' : 'rgba(255,255,255,0.9)'} stroke={stroke} strokeWidth={1} />
      <line x1={x - boxW / 2 + 6} y1={y - boxH / 2} x2={x + boxW / 2 - 6} y2={y - boxH / 2}
        stroke={borderColor} strokeWidth={2.5} />
      {needsWrap ? (
        <>
          <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="middle"
            fill={textFill} fontSize={9} fontWeight={600} fontFamily="system-ui, sans-serif" letterSpacing="0.05em">
            {line1}
          </text>
          <text x={x} y={y + 8} textAnchor="middle" dominantBaseline="middle"
            fill={textFill} fontSize={9} fontWeight={600} fontFamily="system-ui, sans-serif" letterSpacing="0.05em">
            {line2}
          </text>
        </>
      ) : (
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
          fill={textFill} fontSize={9} fontWeight={600} fontFamily="system-ui, sans-serif" letterSpacing="0.05em">
          {label}
        </text>
      )}
    </>
  );
}

function DynamicConnectors({ pos, isDark, workflow }: { pos: Record<CardKey, CardPos>; isDark: boolean; workflow: Workflow }) {
  const stroke = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)';
  const arrow = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)';
  const neutralBorder = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.25)';
  const conn = workflow.connectors || {};

  const trigR = rightOf(pos.trigger);
  const brTopL = leftOf(pos.branchTop);
  const brTopR = rightOf(pos.branchTop);
  const brBotL = leftOf(pos.branchBot);
  const brBotR = rightOf(pos.branchBot);
  const s1TopL = leftOf(pos.step1Top, true);
  const s1TopR = rightOf(pos.step1Top, true);
  const s1BotL = leftOf(pos.step1Bot, true);
  const s1BotR = rightOf(pos.step1Bot, true);
  const s2L = leftOf(pos.step2, true);
  const s2R = rightOf(pos.step2, true);
  const s3L = leftOf(pos.step3, true);
  const s3R = rightOf(pos.step3, true);
  const s3bisL = leftOf(pos.step3bis, true);
  const s3bisR = rightOf(pos.step3bis, true);
  const s4L = leftOf(pos.step4, true);
  const s4R = rightOf(pos.step4, true);
  const s4bisL = leftOf(pos.step4bis, true);
  const s4bisR = rightOf(pos.step4bis, true);
  const s5L = leftOf(pos.step5, true);
  const s5R = rightOf(pos.step5, true);
  const s5bisL = leftOf(pos.step5bis, true);
  const s5bisR = rightOf(pos.step5bis, true);
  const s6L = leftOf(pos.step6, true);
  const s6R = rightOf(pos.step6, true);
  const s6bisL = leftOf(pos.step6bis, true);
  const s6bisR = rightOf(pos.step6bis, true);
  const s7L = leftOf(pos.step7, true);
  const s7R = rightOf(pos.step7, true);
  const s7bisL = leftOf(pos.step7bis, true);
  const s7bisR = rightOf(pos.step7bis, true);
  const s8L = leftOf(pos.step8, true);
  const s8R = rightOf(pos.step8, true);
  const s8bisL = leftOf(pos.step8bis, true);
  const s8bisR = rightOf(pos.step8bis, true);
  const s9L = leftOf(pos.step9, true);
  const s9R = rightOf(pos.step9, true);
  const s5TopL = leftOf(pos.step5Top, true);
  const s5BotL = leftOf(pos.step5Bot, true);

  const mid01 = (trigR.x + brTopL.x) / 2;
  const mid23 = (s1TopR.x + s2L.x) / 2;

  const maxX = Math.max(...Object.values(pos).map(p => p.x + p.w)) + 60;
  const maxY = Math.max(...Object.values(pos).map(p => p.y + p.h)) + 60;

  // Determine branching patterns
  const hasConditionalFork = !!(conn.step4_step5Top || conn.step4_step5Bot);
  const hasStep3bis = !!(conn.step2_step3bis);
  const hasStep4bis = !!(conn.step3_step4bis);
  const step4IsLink = !!workflow.steps.find(s => s.id === 'step-4')?.linkTo;
  const hasStep1_step2 = !!(conn.step1_step2);

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

      {/* Branch top → Step 1 top (Message → DM) */}
      {(() => {
        const midBr = (brTopR.x + s1TopL.x) / 2;
        const midX = midBr;
        const midY = (brTopR.y + s1TopL.y) / 2;
        return (
          <>
            <path d={`M ${brTopR.x} ${brTopR.y} C ${midBr} ${brTopR.y}, ${midBr} ${s1TopL.y}, ${s1TopL.x} ${s1TopL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label="REGULAR" borderColor={neutralBorder} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}
      {/* Branch top → Step 1 bottom (VIP) */}
      {(() => {
        const midBr = (brTopR.x + s1BotL.x) / 2;
        const midX = midBr;
        const midY = (brTopR.y + s1BotL.y) / 2;
        return (
          <>
            <path d={`M ${brTopR.x} ${brTopR.y} C ${midBr} ${brTopR.y}, ${midBr} ${s1BotL.y}, ${s1BotL.x} ${s1BotL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label="VIP" borderColor={neutralBorder} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}
      {/* Branch bottom → Step 1 bottom (Call → Director) */}
      {(() => {
        const midBr = (brBotR.x + s1BotL.x) / 2;
        const midX = midBr;
        const midY = (brBotR.y + s1BotL.y) / 2;
        return (
          <>
            <path d={`M ${brBotR.x} ${brBotR.y} C ${midBr} ${brBotR.y}, ${midBr} ${s1BotL.y}, ${s1BotL.x} ${s1BotL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label="ALL" borderColor={neutralBorder} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 1 → Step 2 (merging = dashed) + optional condition box */}
      {(() => {
        const midX = (s1TopR.x + s2L.x) / 2;
        const midY = s2L.y;
        return (
          <>
            <path d={`M ${s1TopR.x} ${s1TopR.y} C ${mid23} ${s1TopR.y}, ${mid23} ${s2L.y}, ${s2L.x} ${s2L.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <path d={`M ${s1BotR.x} ${s1BotR.y} C ${mid23} ${s1BotR.y}, ${mid23} ${s2L.y}, ${s2L.x} ${s2L.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            {hasStep1_step2 && (
              <ConditionBox x={midX} y={midY} label={conn.step1_step2!.label} borderColor={conn.step1_step2!.color} isDark={isDark} stroke={stroke} />
            )}
          </>
        );
      })()}

      {/* Step 2 → Step 3 with configurable condition box */}
      {(() => {
        const c = conn.step2_step3 || { label: 'QUALIFIED', color: '#22c55e' };
        const midX = (s2R.x + s3L.x) / 2;
        const midY = (s2R.y + s3L.y) / 2;
        return (
          <>
            <line x1={s2R.x} y1={s2R.y} x2={s3L.x} y2={s3L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 2 → Step 3bis (e.g. "NOT AVAILABLE OR REFUSED") — grey line, red condition box border */}
      {hasStep3bis && (() => {
        const c = conn.step2_step3bis!;
        const midX = (s2R.x + s3bisL.x) / 2;
        const midY = (s2R.y + s3bisL.y) / 2;
        return (
          <>
            <path d={`M ${s2R.x} ${s2R.y} C ${midX} ${s2R.y}, ${midX} ${s3bisL.y}, ${s3bisL.x} ${s3bisL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 3 → Step 4 with optional condition box */}
      {(() => {
        const c = conn.step3_step4;
        const midX = (s3R.x + s4L.x) / 2;
        const midY = (s3R.y + s4L.y) / 2;
        return (
          <>
            <line x1={s3R.x} y1={s3R.y} x2={s4L.x} y2={s4L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            {c && <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />}
          </>
        );
      })()}

      {/* Step 3 → Step 4bis (e.g. "NO MATCH") — grey line, red condition box border */}
      {hasStep4bis && (() => {
        const c = conn.step3_step4bis!;
        const midX = (s3R.x + s4bisL.x) / 2;
        const midY = (s3R.y + s4bisL.y) / 2;
        return (
          <>
            <path d={`M ${s3R.x} ${s3R.y} C ${midX} ${s3R.y}, ${midX} ${s4bisL.y}, ${s4bisL.x} ${s4bisL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 4bis → Step 5bis (e.g. Follow Up Owner → Property Hunting) */}
      {conn.step4bis_step5bis && pos.step5bis.h > 0 && (() => {
        const mid = (s4bisR.x + s5bisL.x) / 2;
        return (
          <path d={`M ${s4bisR.x} ${s4bisR.y} C ${mid} ${s4bisR.y}, ${mid} ${s5bisL.y}, ${s5bisL.x} ${s5bisL.y}`}
            stroke={stroke} strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
        );
      })()}

      {/* Step 4bis → End cards (only if no step5bis exists) */}
      {hasStep4bis && !conn.step4bis_step5bis && (pos.step5Bot.h > 0 || pos.step5Top.h > 0) && (() => {
        const target = pos.step5Bot.h > 0 ? s5BotL : s5TopL;
        const mid = (s4bisR.x + target.x) / 2;
        return (
          <path d={`M ${s4bisR.x} ${s4bisR.y} C ${mid} ${s4bisR.y}, ${mid} ${target.y}, ${target.x} ${target.y}`}
            stroke={stroke} strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
        );
      })()}

      {/* Step 4 → Step 5 (forking or conditional) — skip if step4 is a link or no step5 cards */}
      {step4IsLink || !!conn.step4_step5 || (pos.step5Top.h === 0 && pos.step5Bot.h === 0) ? null : hasConditionalFork ? (
        <>
          {/* Step 4 → Step 5 Top with condition */}
          {conn.step4_step5Top && (() => {
            const c = conn.step4_step5Top!;
            const mid56 = (s4R.x + s5TopL.x) / 2;
            const midY = (s4R.y + s5TopL.y) / 2;
            return (
              <>
                <path d={`M ${s4R.x} ${s4R.y} C ${mid56} ${s4R.y}, ${mid56} ${s5TopL.y}, ${s5TopL.x} ${s5TopL.y}`}
                  stroke={stroke} strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
                <ConditionBox x={mid56} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
              </>
            );
          })()}
          {/* Step 4 → Step 5 Bot with condition */}
          {conn.step4_step5Bot && (() => {
            const c = conn.step4_step5Bot!;
            const mid56 = (s4R.x + s5BotL.x) / 2;
            const midY = (s4R.y + s5BotL.y) / 2;
            return (
              <>
                <path d={`M ${s4R.x} ${s4R.y} C ${mid56} ${s4R.y}, ${mid56} ${s5BotL.y}, ${s5BotL.x} ${s5BotL.y}`}
                  stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
                <ConditionBox x={mid56} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
              </>
            );
          })()}
        </>
      ) : (
        <>
          {/* Default: plain forking dashed lines */}
          {(() => {
            const mid56 = (s4R.x + s5TopL.x) / 2;
            return (
              <>
                <path d={`M ${s4R.x} ${s4R.y} C ${mid56} ${s4R.y}, ${mid56} ${s5TopL.y}, ${s5TopL.x} ${s5TopL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
                <path d={`M ${s4R.x} ${s4R.y} C ${mid56} ${s4R.y}, ${mid56} ${s5BotL.y}, ${s5BotL.x} ${s5BotL.y}`} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
              </>
            );
          })()}
        </>
      )}

      {/* Step 4 → Step 5 (inline continuation, e.g. Scheduling→Tenant Viewing) */}
      {conn.step4_step5 && pos.step5.h > 0 && (() => {
        const c = conn.step4_step5!;
        const midX = (s4R.x + s5L.x) / 2;
        const midY = (s4R.y + s5L.y) / 2;
        return (
          <>
            <line x1={s4R.x} y1={s4R.y} x2={s5L.x} y2={s5L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 5 → Step 6 (inline continuation, e.g. Tenant Viewing→Post Viewing) */}
      {conn.step5_step6 && pos.step5.h > 0 && pos.step6.h > 0 && (() => {
        const c = conn.step5_step6!;
        const midX = (s5R.x + s6L.x) / 2;
        const midY = (s5R.y + s6L.y) / 2;
        return (
          <>
            <line x1={s5R.x} y1={s5R.y} x2={s6L.x} y2={s6L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 6 → End Top (e.g. Post Viewing→Offer Management) */}
      {conn.step6_endTop && pos.step6.h > 0 && pos.step5Top.h > 0 && (() => {
        const c = conn.step6_endTop!;
        const midX = (s6R.x + s5TopL.x) / 2;
        const midY = (s6R.y + s5TopL.y) / 2;
        return (
          <>
            <path d={`M ${s6R.x} ${s6R.y} C ${midX} ${s6R.y}, ${midX} ${s5TopL.y}, ${s5TopL.x} ${s5TopL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 6 → End Bot (e.g. Post Viewing→Follow-Up) */}
      {conn.step6_endBot && pos.step6.h > 0 && pos.step5Bot.h > 0 && (() => {
        const c = conn.step6_endBot!;
        const midX = (s6R.x + s5BotL.x) / 2;
        const midY = (s6R.y + s5BotL.y) / 2;
        return (
          <>
            <path d={`M ${s6R.x} ${s6R.y} C ${midX} ${s6R.y}, ${midX} ${s5BotL.y}, ${s5BotL.x} ${s5BotL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 5 → Step 6bis (fork bottom, e.g. NOT AVAILABLE OR REFUSED PROFILE) */}
      {conn.step5_step6bis && pos.step5.h > 0 && pos.step6bis.h > 0 && (() => {
        const c = conn.step5_step6bis!;
        const midX = (s5R.x + s6bisL.x) / 2;
        const midY = (s5R.y + s6bisL.y) / 2;
        return (
          <>
            <path d={`M ${s5R.x} ${s5R.y} C ${midX} ${s5R.y}, ${midX} ${s6bisL.y}, ${s6bisL.x} ${s6bisL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 6 → Step 7 (inline continuation, e.g. Confirm with Tenant→Scheduling) */}
      {conn.step6_step7 && pos.step6.h > 0 && pos.step7.h > 0 && (() => {
        const c = conn.step6_step7!;
        const midX = (s6R.x + s7L.x) / 2;
        const midY = (s6R.y + s7L.y) / 2;
        return (
          <>
            <line x1={s6R.x} y1={s6R.y} x2={s7L.x} y2={s7L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 6 → Step 7bis (fork bottom, e.g. NOT INTERESTED) */}
      {conn.step6_step7bis && pos.step6.h > 0 && pos.step7bis.h > 0 && (() => {
        const c = conn.step6_step7bis!;
        const midX = (s6R.x + s7bisL.x) / 2;
        const midY = (s6R.y + s7bisL.y) / 2;
        return (
          <>
            <path d={`M ${s6R.x} ${s6R.y} C ${midX} ${s6R.y}, ${midX} ${s7bisL.y}, ${s7bisL.x} ${s7bisL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 7 → Step 8 (inline continuation, e.g. Scheduling→Tenant Viewing) */}
      {conn.step7_step8 && pos.step7.h > 0 && pos.step8.h > 0 && (() => {
        const c = conn.step7_step8!;
        const midX = (s7R.x + s8L.x) / 2;
        const midY = (s7R.y + s8L.y) / 2;
        return (
          <>
            <line x1={s7R.x} y1={s7R.y} x2={s8L.x} y2={s8L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 7bis → Step 8bis (e.g. Follow Up Owner → Property Hunting) */}
      {conn.step7bis_step8bis && pos.step7bis.h > 0 && pos.step8bis.h > 0 && (() => {
        const mid = (s7bisR.x + s8bisL.x) / 2;
        return (
          <path d={`M ${s7bisR.x} ${s7bisR.y} C ${mid} ${s7bisR.y}, ${mid} ${s8bisL.y}, ${s8bisL.x} ${s8bisL.y}`}
            stroke={stroke} strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
        );
      })()}

      {/* Step 8 → Step 9 (inline continuation, e.g. Tenant Viewing→Post Viewing) */}
      {conn.step8_step9 && pos.step8.h > 0 && pos.step9.h > 0 && (() => {
        const c = conn.step8_step9!;
        const midX = (s8R.x + s9L.x) / 2;
        const midY = (s8R.y + s9L.y) / 2;
        return (
          <>
            <line x1={s8R.x} y1={s8R.y} x2={s9L.x} y2={s9L.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 9 → End Top (e.g. Post Viewing→Offer Management) */}
      {conn.step9_endTop && pos.step9.h > 0 && pos.step5Top.h > 0 && (() => {
        const c = conn.step9_endTop!;
        const midX = (s9R.x + s5TopL.x) / 2;
        const midY = (s9R.y + s5TopL.y) / 2;
        return (
          <>
            <path d={`M ${s9R.x} ${s9R.y} C ${midX} ${s9R.y}, ${midX} ${s5TopL.y}, ${s5TopL.x} ${s5TopL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}

      {/* Step 9 → End Bot (e.g. Post Viewing→Property Hunting) */}
      {conn.step9_endBot && pos.step9.h > 0 && pos.step5Bot.h > 0 && (() => {
        const c = conn.step9_endBot!;
        const midX = (s9R.x + s5BotL.x) / 2;
        const midY = (s9R.y + s5BotL.y) / 2;
        return (
          <>
            <path d={`M ${s9R.x} ${s9R.y} C ${midX} ${s9R.y}, ${midX} ${s5BotL.y}, ${s5BotL.x} ${s5BotL.y}`}
              stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray="6 4" markerEnd="url(#arr)" />
            <ConditionBox x={midX} y={midY} label={c.label} borderColor={c.color} isDark={isDark} stroke={stroke} />
          </>
        );
      })()}
    </svg>
  );
}

// ── Canvas ───────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function WorkflowCanvas({ workflow, isDark, onNavigate }: { workflow: Workflow; isDark: boolean; onNavigate?: (workflowId: string) => void }) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialScale, setInitialScale] = useState(isMobile ? 0.3 : 0.55);
  const hasFollowupDm = !!workflow.steps.find(s => s.id === 'followup-dm');
  const hasFollowupAgent = !!workflow.steps.find(s => s.id === 'followup-agent');
  const hasInlineStep5 = !!workflow.steps.find(s => s.id === 'step-5');
  const hasInlineStep5bis = !!workflow.steps.find(s => s.id === 'step-5bis');
  const hasInlineStep6 = !!workflow.steps.find(s => s.id === 'step-6');
  const hasInlineStep6bis = !!workflow.steps.find(s => s.id === 'step-6bis');
  const hasInlineStep7 = !!workflow.steps.find(s => s.id === 'step-7');
  const hasInlineStep7bis = !!workflow.steps.find(s => s.id === 'step-7bis');
  const hasInlineStep8 = !!workflow.steps.find(s => s.id === 'step-8');
  const hasInlineStep8bis = !!workflow.steps.find(s => s.id === 'step-8bis');
  const hasInlineStep9 = !!workflow.steps.find(s => s.id === 'step-9');
  const [pos, setPos] = useState<Record<CardKey, CardPos>>(() =>
    computePositions({
      trigger: H_TRIGGER, branchTop: H_BRANCH_TOP, branchBot: H_BRANCH_BOT,
      step1Top: H_STEP1_DM, step1Bot: H_STEP1_DIR,
      step2: H_STEP2, step3: H_STEP3, step3bis: 0, step4: H_STEP4, step4bis: 0,
      step5: hasInlineStep5 ? H_STEP4 : 0, step5bis: hasInlineStep5bis ? H_FOLLOW_DM : 0,
      step6: hasInlineStep6 ? H_STEP3 : 0, step6bis: hasInlineStep6bis ? H_STEP3 : 0,
      step7: hasInlineStep7 ? H_STEP4 : 0, step7bis: hasInlineStep7bis ? H_FOLLOW_AGT : 0,
      step8: hasInlineStep8 ? H_STEP4 : 0, step8bis: hasInlineStep8bis ? H_FOLLOW_DM : 0,
      step9: hasInlineStep9 ? H_STEP3 : 0,
      step5Top: hasFollowupDm ? H_FOLLOW_DM : 0, step5Bot: hasFollowupAgent ? H_FOLLOW_AGT : 0,
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
    step3bis: useRef<HTMLDivElement>(null),
    step4: useRef<HTMLDivElement>(null),
    step4bis: useRef<HTMLDivElement>(null),
    step5: useRef<HTMLDivElement>(null),
    step5bis: useRef<HTMLDivElement>(null),
    step6: useRef<HTMLDivElement>(null),
    step6bis: useRef<HTMLDivElement>(null),
    step7: useRef<HTMLDivElement>(null),
    step7bis: useRef<HTMLDivElement>(null),
    step8: useRef<HTMLDivElement>(null),
    step8bis: useRef<HTMLDivElement>(null),
    step9: useRef<HTMLDivElement>(null),
    step5Top: useRef<HTMLDivElement>(null),
    step5Bot: useRef<HTMLDivElement>(null),
  };

  // Re-measure card heights when workflow changes (different cards have different sizes)
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
        step3bis: refs.step3bis.current?.offsetHeight || 0,
        step4: refs.step4.current?.offsetHeight || H_STEP4,
        step4bis: refs.step4bis.current?.offsetHeight || 0,
        step5: refs.step5.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-5') ? H_STEP4 : 0),
        step5bis: refs.step5bis.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-5bis') ? H_FOLLOW_DM : 0),
        step6: refs.step6.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-6') ? H_STEP3 : 0),
        step6bis: refs.step6bis.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-6bis') ? H_STEP3 : 0),
        step7: refs.step7.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-7') ? H_STEP4 : 0),
        step7bis: refs.step7bis.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-7bis') ? H_FOLLOW_AGT : 0),
        step8: refs.step8.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-8') ? H_STEP4 : 0),
        step8bis: refs.step8bis.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-8bis') ? H_FOLLOW_DM : 0),
        step9: refs.step9.current?.offsetHeight || (workflow.steps.find(s => s.id === 'step-9') ? H_STEP3 : 0),
        step5Top: refs.step5Top.current?.offsetHeight || (workflow.steps.find(s => s.id === 'followup-dm') ? H_FOLLOW_DM : 0),
        step5Bot: refs.step5Bot.current?.offsetHeight || (workflow.steps.find(s => s.id === 'followup-agent') ? H_FOLLOW_AGT : 0),
      };
      const newPos = computePositions(heights);
      setPos(newPos);

      // Compute per-workflow initial scale from measured positions
      if (containerRef.current) {
        const measuredW = Math.max(...Object.values(newPos).map(p => p.x + p.w)) + 60;
        const measuredH = Math.max(...Object.values(newPos).map(p => p.y + p.h)) + 60;
        const cw = containerRef.current.offsetWidth;
        const ch = containerRef.current.offsetHeight;
        const scaleX = cw / measuredW;
        const scaleY = ch / measuredH;
        const fitScale = Math.min(scaleX, scaleY) * 0.9;
        setInitialScale(isMobile ? Math.min(fitScale, 0.5) : Math.max(0.2, Math.min(fitScale, 1.2)));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [workflow.id]);

  const find = (id: string) => workflow.steps.find(s => s.id === id)!;

  const digital = workflow.triggers.filter(t => t.channel !== 'direct');
  const direct = workflow.triggers.filter(t => t.channel === 'direct');

  const canvasW = Math.max(...Object.values(pos).map(p => p.x + p.w)) + 60;
  const canvasH = Math.max(...Object.values(pos).map(p => p.y + p.h)) + 60;

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden"
      style={{
        height: 'calc(100vh - 180px)',
        minHeight: 550,
        background: isDark
          ? 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.008) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(15,23,42,0.008) 0%, transparent 70%)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.1)'}`,
      }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)' : 'radial-gradient(rgba(15,23,42,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      <TransformWrapper key={`${initialScale}-${workflow.id}`} initialScale={initialScale} minScale={0.15} maxScale={2.5} centerOnInit centerZoomedOut limitToBounds={false} panning={{ velocityDisabled: true }}>
        <ZoomControls isDark={isDark} canvasW={canvasW} canvasH={canvasH} containerRef={containerRef} />
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: canvasW, height: canvasH }}>

          <DynamicConnectors pos={pos} isDark={isDark} workflow={workflow} />

          {/* COL 0: Trigger */}
          <div ref={refs.trigger} className="absolute" style={{ left: pos.trigger.x, top: pos.trigger.y }}>
            <TriggerNode workflow={workflow} isDark={isDark} />
          </div>

          {/* COL 1 top: Message branch */}
          <div ref={refs.branchTop} className="absolute" style={{ left: pos.branchTop.x, top: pos.branchTop.y }}>
            <BranchCard label="Message" color="#9a6b3a" triggers={digital} isDark={isDark} />
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

          {/* COL 4 top: Step 3 */}
          <div ref={refs.step3} className="absolute" style={{ left: pos.step3.x, top: pos.step3.y }}>
            <StepCard step={find('step-3')} isDark={isDark} />
          </div>

          {/* COL 4 bottom: Step 3bis (conditional, only for some workflows) */}
          {workflow.steps.find(s => s.id === 'step-3bis') && (
            <div ref={refs.step3bis} className="absolute" style={{ left: pos.step3bis.x, top: pos.step3bis.y }}>
              <StepCard step={find('step-3bis')} isDark={isDark} />
            </div>
          )}

          {/* COL 5 top: Step 4 (or Link if linkTo) */}
          <div ref={refs.step4} className="absolute" style={{ left: pos.step4.x, top: pos.step4.y }}>
            {find('step-4').linkTo
              ? <LinkStepCard step={find('step-4')} isDark={isDark} onNavigate={onNavigate} />
              : <StepCard step={find('step-4')} isDark={isDark} />
            }
          </div>

          {/* COL 5 bottom: Step 4bis (conditional, only for some workflows) */}
          {workflow.steps.find(s => s.id === 'step-4bis') && (
            <div ref={refs.step4bis} className="absolute" style={{ left: pos.step4bis.x, top: pos.step4bis.y }}>
              {find('step-4bis').linkTo
                ? <LinkStepCard step={find('step-4bis')} isDark={isDark} onNavigate={onNavigate} />
                : <StepCard step={find('step-4bis')} isDark={isDark} />
              }
            </div>
          )}

          {/* Step 5 (inline, e.g. Tenant Viewing) */}
          {workflow.steps.find(s => s.id === 'step-5') && (
            <div ref={refs.step5} className="absolute" style={{ left: pos.step5.x, top: pos.step5.y }}>
              <StepCard step={find('step-5')} isDark={isDark} />
            </div>
          )}

          {/* Step 5bis (e.g. Property Hunting link, under Step 5) */}
          {workflow.steps.find(s => s.id === 'step-5bis') && (
            <div ref={refs.step5bis} className="absolute" style={{ left: pos.step5bis.x, top: pos.step5bis.y }}>
              {find('step-5bis').linkTo
                ? <LinkStepCard step={find('step-5bis')} isDark={isDark} onNavigate={onNavigate} />
                : <StepCard step={find('step-5bis')} isDark={isDark} />
              }
            </div>
          )}

          {/* Step 6 (inline, e.g. Confirm with Tenant) */}
          {workflow.steps.find(s => s.id === 'step-6') && (
            <div ref={refs.step6} className="absolute" style={{ left: pos.step6.x, top: pos.step6.y }}>
              <StepCard step={find('step-6')} isDark={isDark} />
            </div>
          )}

          {/* Step 6bis (e.g. Follow Up - Tenant) */}
          {workflow.steps.find(s => s.id === 'step-6bis') && (
            <div ref={refs.step6bis} className="absolute" style={{ left: pos.step6bis.x, top: pos.step6bis.y }}>
              <StepCard step={find('step-6bis')} isDark={isDark} />
            </div>
          )}

          {/* Step 7 (inline, e.g. Scheduling) */}
          {workflow.steps.find(s => s.id === 'step-7') && (
            <div ref={refs.step7} className="absolute" style={{ left: pos.step7.x, top: pos.step7.y }}>
              <StepCard step={find('step-7')} isDark={isDark} />
            </div>
          )}

          {/* Step 7bis (e.g. Follow Up - Owner) */}
          {workflow.steps.find(s => s.id === 'step-7bis') && (
            <div ref={refs.step7bis} className="absolute" style={{ left: pos.step7bis.x, top: pos.step7bis.y }}>
              <StepCard step={find('step-7bis')} isDark={isDark} />
            </div>
          )}

          {/* Step 8 (inline, e.g. Tenant Viewing) */}
          {workflow.steps.find(s => s.id === 'step-8') && (
            <div ref={refs.step8} className="absolute" style={{ left: pos.step8.x, top: pos.step8.y }}>
              <StepCard step={find('step-8')} isDark={isDark} />
            </div>
          )}

          {/* Step 8bis (e.g. Property Hunting link) */}
          {workflow.steps.find(s => s.id === 'step-8bis') && (
            <div ref={refs.step8bis} className="absolute" style={{ left: pos.step8bis.x, top: pos.step8bis.y }}>
              {find('step-8bis').linkTo
                ? <LinkStepCard step={find('step-8bis')} isDark={isDark} onNavigate={onNavigate} />
                : <StepCard step={find('step-8bis')} isDark={isDark} />
              }
            </div>
          )}

          {/* Step 9 (inline, e.g. Post Viewing) */}
          {workflow.steps.find(s => s.id === 'step-9') && (
            <div ref={refs.step9} className="absolute" style={{ left: pos.step9.x, top: pos.step9.y }}>
              <StepCard step={find('step-9')} isDark={isDark} />
            </div>
          )}

          {/* End column top: Follow-Up or Link (conditional) */}
          {workflow.steps.find(s => s.id === 'followup-dm') && (
            <div ref={refs.step5Top} className="absolute" style={{ left: pos.step5Top.x, top: pos.step5Top.y }}>
              {find('followup-dm').linkTo
                ? <LinkStepCard step={find('followup-dm')} isDark={isDark} onNavigate={onNavigate} />
                : <StepCard step={find('followup-dm')} isDark={isDark} />
              }
            </div>
          )}

          {/* COL 6 bottom: Follow-Up or Link (conditional) */}
          {workflow.steps.find(s => s.id === 'followup-agent') && (
            <div ref={refs.step5Bot} className="absolute" style={{ left: pos.step5Bot.x, top: pos.step5Bot.y }}>
              {find('followup-agent').linkTo
                ? <LinkStepCard step={find('followup-agent')} isDark={isDark} onNavigate={onNavigate} />
                : <StepCard step={find('followup-agent')} isDark={isDark} />
              }
            </div>
          )}

        </TransformComponent>
      </TransformWrapper>

      {/* Hints */}
      <div className="absolute bottom-4 left-4 z-20 text-[10px] flex items-center gap-3" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)' }}>
        <span className="hidden md:inline">Scroll to zoom</span>
        <span className="md:hidden">Pinch to zoom</span>
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

        {/* Workflow Tabs */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)'}`,
          }}
        >
          {WORKFLOWS.map((w) => {
            const active = activeWorkflowId === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setActiveWorkflowId(w.id)}
                className="px-4 py-2 text-[11px] font-semibold tracking-wide transition-all duration-300 relative cursor-pointer"
                style={{
                  color: active ? w.color : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)'),
                  background: active ? `${w.color}12` : 'transparent',
                }}
              >
                {active && (
                  <div
                    className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full"
                    style={{ background: w.color }}
                  />
                )}
                {w.title}
              </button>
            );
          })}
        </div>
      </div>
      <WorkflowCanvas workflow={activeWorkflow} isDark={isDark} onNavigate={setActiveWorkflowId} />
    </div>
  );
}
