'use client'

import { useState, useCallback, useRef } from 'react'
import {
  DIVISIONS,
  POSITIONS,
  BRANCHES,
  EMAIL_DOMAINS,
  DISCLAIMER,
  getLogo,
  type Division,
} from '@/lib/config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  divisionId: string
  firstName: string
  lastName: string
  position: string
  company: string
  phone: string
  emailUser: string
  emailDomain: string
  branchIdx: number
  isSpecialist: boolean
  isPatriot: boolean
  isEC: boolean
  // Sociální sítě — vše volitelné
  linkedin: string
  facebook: string
  instagram: string
  youtube: string
  tiktok: string
  website: string
}

type CopyState = 'idle' | 'copied-html' | 'copied-rich'

const SOCIAL_PLATFORMS = [
  { key: 'linkedin'  as const, label: 'LinkedIn',  color: '#0077B5', placeholder: 'https://linkedin.com/in/...' },
  { key: 'facebook'  as const, label: 'Facebook',  color: '#1877F2', placeholder: 'https://facebook.com/...'   },
  { key: 'instagram' as const, label: 'Instagram', color: '#E4405F', placeholder: 'https://instagram.com/...'  },
  { key: 'youtube'   as const, label: 'YouTube',   color: '#FF0000', placeholder: 'https://youtube.com/...'    },
  { key: 'tiktok'    as const, label: 'TikTok',    color: '#000000', placeholder: 'https://tiktok.com/@...'    },
  { key: 'website'   as const, label: 'Web',       color: '#475569', placeholder: 'https://...'                },
]

function normalizeUrl(url: string): string {
  if (!url.trim()) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

// Kruhové SVG ikony — bílé pozadí, barevný rámeček a piktogram (barva dle divize)
function getSocialIcon(key: string, c: string): string {
  const icons: Record<string, string> = {
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="${c}" stroke-width="1.5"/><rect x="8" y="12" width="2.5" height="8" fill="${c}"/><circle cx="9.25" cy="9.75" r="1.5" fill="${c}"/><path fill="${c}" d="M13.5 12h2.3v1.1c.4-.7 1.2-1.3 2.4-1.3 2.3 0 2.8 1.5 2.8 3.5V20h-2.5v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V20h-2.5V12z"/></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="${c}" stroke-width="1.5"/><path fill="${c}" d="M15.5 9H17V7h-2c-2 0-3 1.3-3 3v1.5H10V14h2v8h2.5v-8h2l.5-2.5h-2.5V10c0-.3.2-.5.5-.5h.5z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="${c}" stroke-width="1.5"/><rect x="8" y="8" width="12" height="12" rx="3.5" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="14" cy="14" r="3" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="18.2" cy="9.8" r="1" fill="${c}"/></svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="${c}" stroke-width="1.5"/><path fill="${c}" d="M22 14s0-2.8-.4-4.2a2 2 0 00-1.4-1.4C18.9 8 14 8 14 8s-4.9 0-6.2.4a2 2 0 00-1.4 1.4C6 11.2 6 14 6 14s0 2.8.4 4.2a2 2 0 001.4 1.4C9.1 20 14 20 14 20s4.9 0 6.2-.4a2 2 0 001.4-1.4C22 16.8 22 14 22 14zm-9.5 3v-6l4.5 3-4.5 3z"/></svg>`,
    tiktok: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="${c}" stroke-width="1.5"/><path fill="${c}" d="M19.5 10.2a3.8 3.8 0 01-3.8-3.8h-2.3v9c0 1.2-1 2.2-2.2 2.2a2.2 2.2 0 01-2.2-2.2c0-1.2 1-2.2 2.2-2.2.2 0 .4 0 .6.1V10.9a4.7 4.7 0 00-.6 0 4.6 4.6 0 00-4.6 4.6 4.6 4.6 0 004.6 4.6 4.6 4.6 0 004.6-4.6v-5a6.1 6.1 0 003.6 1.2v-2.3a3.8 3.8 0 01-1.9-.2z"/></svg>`,
    website: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="${c}" stroke-width="1.5"/><circle cx="14" cy="14" r="6.5" fill="none" stroke="${c}" stroke-width="1.3"/><ellipse cx="14" cy="14" rx="2.8" ry="6.5" fill="none" stroke="${c}" stroke-width="1.3"/><line x1="7.5" y1="14" x2="20.5" y2="14" stroke="${c}" stroke-width="1.3"/><line x1="8.5" y1="10.5" x2="19.5" y2="10.5" stroke="${c}" stroke-width="1.3"/><line x1="8.5" y1="17.5" x2="19.5" y2="17.5" stroke="${c}" stroke-width="1.3"/></svg>`,
  }
  return icons[key] ?? ''
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function toBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function buildSignatureHTML(form: FormState, logoSrc: string, color: string, iconColor: string): string {
  const email = `${form.emailUser}${form.emailDomain}`
  const branch = BRANCHES[form.branchIdx]?.address ?? ''
  const pipe = `<span style="color:${color};font-weight:bold;">|</span>`

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#333333;line-height:1.4;">
  <tbody>
    <tr>
      <td style="padding:0;vertical-align:top;">

        <!-- Jméno -->
        <p style="margin:0 0 5px 0;font-size:14px;font-weight:bold;color:#333333;">${form.firstName} ${form.lastName}</p>

        <!-- Pozice | Firma -->
        <p style="margin:0 0 10px 0;font-size:13px;color:#333333;">${form.position} ${pipe} ${form.company}</p>

        <!-- Kontakty -->
        <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#333333;">
          <tbody>
            <tr>
              <td style="padding:1px 6px 1px 0;font-weight:bold;color:${color};white-space:nowrap;">|</td>
              <td style="padding:1px 0;">${form.phone}</td>
            </tr>
            <tr>
              <td style="padding:1px 6px 1px 0;font-weight:bold;color:${color};white-space:nowrap;">|</td>
              <td style="padding:1px 0;"><a href="mailto:${email}" style="color:#333333;text-decoration:none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:1px 6px 1px 0;font-weight:bold;color:${color};white-space:nowrap;">|</td>
              <td style="padding:1px 0;">${branch}</td>
            </tr>
          </tbody>
        </table>

        <!-- Logo -->
        <p style="margin:14px 0 12px 0;">
          <img src="${logoSrc}" height="87" alt="Logo" style="display:block;height:87px;border:none;">
        </p>

        <!-- Sociální sítě -->
        ${(() => {
          const links = SOCIAL_PLATFORMS
            .map(p => ({ ...p, url: normalizeUrl(form[p.key]) }))
            .filter(p => p.url)
          if (!links.length) return ''
          const badges = links.map(p => {
            const svg = getSocialIcon(p.key, iconColor)
            const src = `data:image/svg+xml;base64,${btoa(svg)}`
            return `<a href="${p.url}" target="_blank" title="${p.label}" style="display:inline-block;margin-right:6px;text-decoration:none;"><img src="${src}" width="28" height="28" alt="${p.label}" style="display:block;border:none;border-radius:50%;"></a>`
          }).join('')
          return `<p style="margin:0 0 12px 0;">${badges}</p>`
        })()}

        <!-- Disclaimer -->
        <p style="margin:0;font-size:11px;color:#999999;max-width:520px;line-height:1.5;">${DISCLAIMER}</p>

      </td>
    </tr>
  </tbody>
</table>`
}

// ─── Component ────────────────────────────────────────────────────────────────

const DEFAULT_FORM: FormState = {
  divisionId: '',
  firstName: '',
  lastName: '',
  position: '',
  company: '',
  phone: '',
  emailUser: '',
  emailDomain: '@bidli.cz',
  branchIdx: 0,
  isSpecialist: false,
  isPatriot: false,
  isEC: false,
  linkedin: '',
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  website: '',
}

export default function SignatureGenerator() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [copyError, setCopyError] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  // ── Derived values ───────────────────────────────────────────────────────

  const selectedDivision: Division | undefined = DIVISIONS.find(d => d.id === form.divisionId)
  const color = selectedDivision?.color ?? '#EF8625'
  const iconColor = selectedDivision?.hideBadges ? '#000000' : '#142F4C'
  const logoPath = selectedDivision
    ? getLogo(selectedDivision, form.isSpecialist, form.isPatriot, form.isEC)
    : '/images/Bidli.png'
  const showBadges = selectedDivision ? !selectedDivision.hideBadges : true
  const availableCompanies = selectedDivision?.companies ?? []

  const isValid =
    form.divisionId &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.position &&
    form.company &&
    form.phone.trim() &&
    form.emailUser.trim() &&
    form.branchIdx >= 0

  // ── Handlers ─────────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleDivisionChange = (divId: string) => {
    const div = DIVISIONS.find(d => d.id === divId)
    setForm(prev => ({
      ...prev,
      divisionId: divId,
      company: div?.companies[0] ?? '',
      isSpecialist: false,
      isPatriot: false,
      isEC: false,
    }))
  }

  const signatureHTML = isValid
    ? buildSignatureHTML(form, logoPath, color, iconColor)
    : ''

  const handleCopyHTML = async () => {
    try {
      // Replace image src with base64 for self-contained HTML
      const base64 = await toBase64(logoPath)
      const html = signatureHTML.replace(logoPath, base64)
      await navigator.clipboard.writeText(html)
      setCopyState('copied-html')
      setTimeout(() => setCopyState('idle'), 2500)
    } catch (e) {
      setCopyError('Nepodařilo se zkopírovat. Zkuste to znovu.')
    }
  }

  const handleCopyRich = async () => {
    try {
      const base64 = await toBase64(logoPath)
      const html = signatureHTML.replace(logoPath, base64)
      const blob = new Blob([html], { type: 'text/html' })
      const item = new ClipboardItem({ 'text/html': blob })
      await navigator.clipboard.write([item])
      setCopyState('copied-rich')
      setTimeout(() => setCopyState('idle'), 2500)
    } catch (e) {
      // Fallback: try plain writeText
      try {
        const base64 = await toBase64(logoPath)
        const html = signatureHTML.replace(logoPath, base64)
        await navigator.clipboard.writeText(html)
        setCopyState('copied-html')
        setTimeout(() => setCopyState('idle'), 2500)
      } catch {
        setCopyError('Nepodařilo se zkopírovat. Zkuste to znovu.')
      }
    }
  }

  // ── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header style={{ backgroundColor: '#142F4C' }} className="shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/Bidli-logo.svg" alt="BIDLI" className="h-8 brightness-0 invert" />
          <h1 className="text-white text-lg font-semibold tracking-wide">
            Generátor podpisů
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 flex-col lg:flex-row">
        {/* ── FORM COLUMN ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* SEKCE 1 — Divize */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              1. Vyberte divizi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DIVISIONS.map(div => {
                const selected = form.divisionId === div.id
                return (
                  <button
                    key={div.id}
                    onClick={() => handleDivisionChange(div.id)}
                    className={`
                      rounded-xl border-2 px-4 py-3 text-left transition-all text-sm font-medium
                      ${selected
                        ? 'text-white shadow-md scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                    style={
                      selected
                        ? { backgroundColor: div.color, borderColor: div.color }
                        : {}
                    }
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{div.label}</span>
                      {selected && <span className="text-white/80 text-xs">✓</span>}
                    </span>
                  </button>
                )
              })}
            </div>
            {/* Color preview */}
            {selectedDivision && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span
                  className="inline-block w-4 h-4 rounded-full border border-slate-200"
                  style={{ backgroundColor: selectedDivision.color }}
                />
                Barva oddělovačů: <code className="font-mono">{selectedDivision.color}</code>
              </div>
            )}
          </section>

          {/* SEKCE 2 — Osobní údaje */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              2. Osobní údaje
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Jméno */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Jméno *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="Jan"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F4C] focus:border-transparent"
                />
              </div>

              {/* Příjmení */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Příjmení *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="Novák"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F4C] focus:border-transparent"
                />
              </div>

              {/* Pozice */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pozice *</label>
                <input
                  type="text"
                  list="positions-list"
                  value={form.position}
                  onChange={e => set('position', e.target.value)}
                  placeholder="Zadejte nebo vyberte pozici…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F4C] focus:border-transparent"
                />
                <datalist id="positions-list">
                  {POSITIONS.map(p => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              {/* Firma */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Firma *</label>
                <select
                  value={form.company}
                  onChange={e => set('company', e.target.value)}
                  disabled={!form.divisionId}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F4C] focus:border-transparent bg-white disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">— nejprve vyberte divizi —</option>
                  {availableCompanies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Telefon *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+420 123 456 789"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F4C] focus:border-transparent"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">E-mail *</label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <input
                    type="text"
                    value={form.emailUser}
                    onChange={e => set('emailUser', e.target.value.replace(/\s/g, ''))}
                    placeholder="jan.novak"
                    className="flex-1 px-3 py-2 text-sm focus:outline-none min-w-0"
                  />
                  <select
                    value={form.emailDomain}
                    onChange={e => set('emailDomain', e.target.value)}
                    className="border-l border-slate-300 bg-slate-50 px-2 py-2 text-sm focus:outline-none text-slate-600"
                  >
                    {EMAIL_DOMAINS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pobočka */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Pobočka *</label>
                <select
                  value={form.branchIdx}
                  onChange={e => set('branchIdx', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F4C] focus:border-transparent bg-white"
                >
                  {BRANCHES.map((b, i) => (
                    <option key={i} value={i}>{b.label} — {b.address}</option>
                  ))}
                </select>
              </div>

            </div>
          </section>

          {/* SEKCE 3 — Odznaky (pouze pro non-BIG divize) */}
          {showBadges && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                3. Odznaky
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Výběr odznaků určuje verzi loga BIDLI v podpisu.
              </p>
              <div className="space-y-3">
                {[
                  { key: 'isSpecialist' as const, label: 'Certifikovaný specialista', badge: 'A' },
                  { key: 'isPatriot' as const, label: 'Patriot', badge: 'B' },
                  { key: 'isEC' as const, label: 'Člen EC', badge: 'C' },
                ].map(({ key, label, badge }) => (
                  <label
                    key={key}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                      ${form[key]
                        ? 'border-[#142F4C] bg-[#142F4C]/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={e => set(key, e.target.checked)}
                      className="w-4 h-4 rounded accent-[#142F4C]"
                    />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                      {badge}
                    </span>
                  </label>
                ))}
              </div>

              {/* Logo preview hint */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                <span className="font-medium">Použité logo:</span>{' '}
                <code className="font-mono">
                  {logoPath.replace('/images/', '')}
                </code>
              </div>
            </section>
          )}

          {/* SEKCE 4 — Sociální sítě */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
              {showBadges ? '4.' : '3.'} Sociální sítě a web
            </h2>
            <p className="text-xs text-slate-400 mb-4">Vše volitelné — zobrazí se pouze vyplněné.</p>
            <div className="space-y-3">
              {SOCIAL_PLATFORMS.map(({ key, label, color, placeholder }) => (
                <div key={key} className="flex items-center gap-3">
                  <span
                    className="flex-shrink-0 w-16 text-center text-xs font-bold text-slate-600 bg-slate-100 py-1 rounded"
                  >
                    {label}
                  </span>
                  <input
                    type="url"
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#142F4C] focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── PREVIEW COLUMN ── */}
        <div className="w-full lg:w-[480px] flex-shrink-0">
          <div className="sticky top-6 space-y-4">

            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Náhled podpisu
            </h2>

            {/* Preview box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Email chrome */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-slate-400 font-mono">Nová zpráva</span>
              </div>

              {/* Signature preview */}
              <div className="p-6 min-h-[280px]" ref={previewRef}>
                {isValid ? (
                  <div
                    className="signature-preview"
                    dangerouslySetInnerHTML={{ __html: signatureHTML }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-slate-400 text-sm">
                      Vyplňte formulář vlevo<br />a zde se zobrazí náhled podpisu.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Copy buttons */}
            {isValid && (
              <div className="space-y-3">
                {copyError && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{copyError}</p>
                )}

                {/* Primary: copy rich (for paste into email) */}
                <button
                  onClick={handleCopyRich}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-sm text-white transition-all active:scale-95"
                  style={{ backgroundColor: color }}
                >
                  {copyState === 'copied-rich' ? (
                    <><span>✓</span> Zkopírováno!</>
                  ) : (
                    <><span>📋</span> Kopírovat podpis (Ctrl+V do e-mailu)</>
                  )}
                </button>

                {/* Secondary: copy HTML source */}
                <button
                  onClick={handleCopyHTML}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-medium text-sm text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                >
                  {copyState === 'copied-html' ? (
                    <><span>✓</span> HTML zkopírováno!</>
                  ) : (
                    <><span>📄</span> Kopírovat HTML kód (pro nastavení podpisu)</>
                  )}
                </button>

                {/* Help text */}
                <div className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 space-y-1">
                  <p>
                    <strong className="text-slate-600">Kopírovat podpis</strong> —
                    vložte (Ctrl+V) přímo do těla e-mailu nebo do nastavení podpisu v Outlooku / Gmailu.
                  </p>
                  <p>
                    <strong className="text-slate-600">Kopírovat HTML</strong> —
                    vložte do pole pro HTML podpis v nastavení e-mailového klienta.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
