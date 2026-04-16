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

// Mapování iconColor → název souboru (blue = #142F4C, black = #000000)
function iconColorName(iconColor: string): 'blue' | 'black' {
  return iconColor === '#000000' ? 'black' : 'blue'
}

// Cesta k předgenerovanému PNG (56×56, zobrazeno jako 28×28)
function getIconPng(key: string, iconColor: string): string {
  return `/images/icons/${key}-${iconColorName(iconColor)}.png`
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

// Připraví HTML pro kopírování: logo + ikony → base64
async function prepareCopyHtml(html: string, logoPath: string, iconPaths: string[]): Promise<string> {
  // Logo → base64
  const logoBase64 = await toBase64(logoPath)
  let result = html.replace(logoPath, logoBase64)
  // Ikony PNG → base64 (všechny unikátní cesty)
  const unique = iconPaths.filter((v, i, a) => a.indexOf(v) === i)
  for (const path of unique) {
    const b64 = await toBase64(path)
    result = result.split(path).join(b64)
  }
  return result
}

// Přesné šířky log při výšce 87 px (vypočteno z originálních rozměrů PNG)
const LOGO_WIDTHS: Record<string, number> = {
  '/images/Bidli.png':           226,
  '/images/Bidli-A.png':         248,
  '/images/Bidli-B.png':         248,
  '/images/Bidli-C.png':         248,
  '/images/Bidli-AB.png':        278,  // odhadnuto — uprav po dodání souboru
  '/images/Bidli-AC.png':        278,  // odhadnuto — uprav po dodání souboru
  '/images/Bidli-BC.png':        278,
  '/images/Bidli-ABC.png':       307,
  '/images/BIG-Capital@300x.png':226,
  '/images/BIG-Invest@300x.png': 226,
}

function buildSignatureHTML(form: FormState, logoSrc: string, color: string, iconColor: string): string {
  const email = `${form.emailUser}${form.emailDomain}`
  const branch = BRANCHES[form.branchIdx]?.address ?? ''
  const pipe = `<span style="color:${color};font-weight:bold;">|</span>`
  const logoWidth = LOGO_WIDTHS[logoSrc] ?? 226
  const logoUrl = logoSrc.includes('BIG-Invest')   ? 'https://www.biginvest.cz/'
                : logoSrc.includes('BIG-Capital')  ? 'https://www.bigprivate.cz/'
                : 'https://www.bidli.cz'

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

        <!-- Mezera před logem (Outlook-safe) -->
        <table cellpadding="0" cellspacing="0" border="0"><tr><td style="height:12px;line-height:12px;font-size:12px;">&nbsp;</td></tr></table>

        <!-- Logo -->
        <p style="margin:0 0 12px 0;">
          <font color="#ffffff"><a href="${logoUrl}" target="_blank" style="display:block;border:0;text-decoration:none;color:#ffffff;line-height:0;font-size:0;"><img src="${logoSrc}" width="${logoWidth}" height="87" alt="Logo" border="0" style="display:block;width:${logoWidth}px;height:87px;border:none;max-width:100%;"></a></font>
        </p>

        <!-- Sociální sítě -->
        ${(() => {
          const links = SOCIAL_PLATFORMS
            .map(p => ({ ...p, url: normalizeUrl(form[p.key]) }))
            .filter(p => p.url)
          if (!links.length) return ''
          const followText = `<p style="margin:0 0 8px 0;font-size:12px;color:#333333;font-family:Arial,sans-serif;">Sledujte mne na sítích nebo na mém webu.</p>`
          const cells = links.map(p => {
            const src = getIconPng(p.key, iconColor)
            // Obrázek 56×56 px zobrazen jako 28×28 (2× retina)
            // <font color="#ffffff"> skryje případný link-underline z Outlooku
            return `<td valign="top" style="padding:0 8px 0 0;vertical-align:top;">` +
              `<font color="#ffffff"><a href="${p.url}" target="_blank" title="${p.label}" style="color:#ffffff;text-decoration:none;border:0;display:block;line-height:0;font-size:0;">` +
              `<img src="${src}" width="28" height="28" border="0" alt="${p.label}" style="display:block;border:0;-ms-interpolation-mode:bicubic;width:28px;height:28px;">` +
              `</a></font></td>`
          }).join('')
          return followText + `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;border-collapse:collapse;"><tr valign="top">${cells}</tr></table>`
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

  // Cesty ke všem ikonám použitým v aktuálním podpisu
  const usedIconPaths = SOCIAL_PLATFORMS
    .filter(p => normalizeUrl(form[p.key]))
    .map(p => getIconPng(p.key, iconColor))

  // execCommand fallback — funguje i bez HTTPS a i v Safari
  // Kopíruje obsah jako rich HTML (div.innerHTML) nebo prostý text (textarea)
  function execCopyRich(html: string) {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;pointer-events:none;'
    el.innerHTML = html
    document.body.appendChild(el)
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    if (sel) { sel.removeAllRanges(); sel.addRange(range) }
    document.execCommand('copy')
    document.body.removeChild(el)
    if (sel) sel.removeAllRanges()
  }

  function execCopyText(text: string) {
    const el = document.createElement('textarea')
    el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;'
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  const handleCopyHTML = async () => {
    // Spusť přípravu ihned — ClipboardItem dostane Promise (Safari to vyžaduje)
    const htmlPromise = prepareCopyHtml(signatureHTML, logoPath, usedIconPaths)
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': htmlPromise.then(h => new Blob([h], { type: 'text/plain' })),
          })
        ])
      } else {
        execCopyText(await htmlPromise)
      }
      setCopyState('copied-html')
      setTimeout(() => setCopyState('idle'), 2500)
    } catch {
      // Poslední záchrana
      try { execCopyText(await htmlPromise) } catch { /* ignore */ }
      setCopyState('copied-html')
      setTimeout(() => setCopyState('idle'), 2500)
    }
  }

  const handleCopyRich = async () => {
    // Spusť přípravu ihned — ClipboardItem dostane Promise, ne hotová data
    // → Safari uzná user-gesture kontext protože ClipboardItem vznikl synchronně
    const htmlPromise = prepareCopyHtml(signatureHTML, logoPath, usedIconPaths)
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html':  htmlPromise.then(h => new Blob([h], { type: 'text/html' })),
            'text/plain': htmlPromise.then(h => new Blob([h], { type: 'text/plain' })),
          })
        ])
        setCopyState('copied-rich')
      } else {
        execCopyRich(await htmlPromise)
        setCopyState('copied-rich')
      }
      setTimeout(() => setCopyState('idle'), 2500)
    } catch {
      // Fallback: execCommand s rich HTML
      try { execCopyRich(await htmlPromise); setCopyState('copied-rich') }
      catch { setCopyError('Nepodařilo se zkopírovat. Zkuste to znovu.') }
      setTimeout(() => setCopyState('idle'), 2500)
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
