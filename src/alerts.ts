/**
 * Proužek s výstrahami ČHMÚ + detailní popup (fork-only feature).
 *
 * Samostatný element, aby zásah do upstream souborů byl minimální (usnadňuje
 * rebase na nové verze clock-weather-card). Čte atributy binary_sensoru
 * z integrace ha-chmu-meteogram (>= 0.5.0):
 *   alert_count, headline, color, alert_icon,
 *   alerts[]: { label, icon, severity, description, instruction, start, end }
 */
import { LitElement, html, css, type TemplateResult, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { type HomeAssistant } from 'custom-card-helpers'
import { DateTime } from 'luxon'

interface ChmuAlert {
  label?: string
  icon?: string
  severity?: string
  description?: string
  instruction?: string
  start?: string | null
  end?: string | null
}

const SEVERITY_COLORS: Record<string, string> = {
  Minor: '#f9a825',
  Moderate: '#ef6c00',
  Severe: '#c62828',
  Extreme: '#6a1b9a'
}

const SEVERITY_LABELS: Record<string, string> = {
  Minor: 'nízká',
  Moderate: 'střední',
  Severe: 'vysoká',
  Extreme: 'extrémní'
}

// color atribut integrace → skutečná barva
const NAMED_COLORS: Record<string, string> = {
  yellow: SEVERITY_COLORS.Minor,
  orange: SEVERITY_COLORS.Moderate,
  red: SEVERITY_COLORS.Severe,
  purple: SEVERITY_COLORS.Extreme
}

const MAX_CHIPS = 4

@customElement('chmu-alert-bar')
export class ChmuAlertBar extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @property() public entityId!: string
  @property() public locale?: string
  // 'bar' = plný proužek, 'chips' = jen kruhové ikonky (kompaktní)
  @property({ reflect: true }) public variant: 'bar' | 'chips' = 'bar'

  @state() private dialogOpen = false

  // Karta (ha-card) má vlastní action handler (tap = more-info počasí).
  // Kliky uvnitř alert baru i dialogu nesmí probublat, jinak se otevřou
  // dva popupy najednou.
  private readonly stopProp = (e: Event): void => { e.stopPropagation() }

  public connectedCallback (): void {
    super.connectedCallback()
    this.addEventListener('click', this.stopProp)
    this.addEventListener('keydown', this.stopProp)
  }

  public disconnectedCallback (): void {
    this.removeEventListener('click', this.stopProp)
    this.removeEventListener('keydown', this.stopProp)
    super.disconnectedCallback()
  }

  protected render (): TemplateResult | typeof nothing {
    const entity = this.hass?.states[this.entityId]
    if (!entity || entity.state !== 'on') {
      return nothing
    }
    const attrs = entity.attributes
    const body = this.variant === 'chips' ? this.renderChips(attrs) : this.renderBar(attrs)
    return html`
      ${body}
      ${this.dialogOpen ? this.renderDialog(attrs) : nothing}
    `
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderBar (attrs: Record<string, any>): TemplateResult {
    const count = (attrs.alert_count as number | undefined) ?? 0
    const headline = (attrs.headline as string | undefined) ?? ''
    const icon = (attrs.alert_icon as string | undefined) ?? 'mdi:alert'
    const color = NAMED_COLORS[(attrs.color as string | undefined) ?? ''] ?? SEVERITY_COLORS.Moderate

    return html`
      <div
        class="alert-bar"
        style="--chmu-alert-color: ${color}"
        role="button"
        tabindex="0"
        @click=${() => { this.dialogOpen = true }}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') this.dialogOpen = true }}
      >
        <ha-icon class="alert-icon" .icon=${icon}></ha-icon>
        <div class="alert-texts">
          <span class="alert-title">${this.countLabel(count)}</span>
          ${headline ? html`<span class="alert-headline">${headline}</span>` : nothing}
        </div>
        <ha-icon class="alert-chevron" icon="mdi:chevron-right"></ha-icon>
      </div>
    `
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderChips (attrs: Record<string, any>): TemplateResult {
    const alerts = (attrs.alerts as ChmuAlert[] | undefined) ?? []
    const shown = alerts.slice(0, MAX_CHIPS)
    const extra = alerts.length - shown.length
    const headline = (attrs.headline as string | undefined) ?? ''

    return html`
      <div
        class="chips"
        role="button"
        tabindex="0"
        title=${headline}
        aria-label=${this.countLabel(alerts.length)}
        @click=${() => { this.dialogOpen = true }}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') this.dialogOpen = true }}
      >
        ${shown.map(a => {
          const color = SEVERITY_COLORS[a.severity ?? ''] ?? SEVERITY_COLORS.Moderate
          return html`
            <span class="chip" style="--chmu-alert-color: ${color}">
              <ha-icon .icon=${a.icon ?? 'mdi:alert'}></ha-icon>
            </span>`
        })}
        ${extra > 0 ? html`<span class="chip chip-more">+${extra}</span>` : nothing}
      </div>
    `
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderDialog (attrs: Record<string, any>): TemplateResult {
    const alerts = (attrs.alerts as ChmuAlert[] | undefined) ?? []
    const area = [attrs.area, attrs.orp ? `ORP ${attrs.orp}` : null]
      .filter(Boolean)
      .join(' · ')

    return html`
      <ha-dialog
        open
        hideActions
        @closed=${() => { this.dialogOpen = false }}
        .heading=${'Výstrahy ČHMÚ'}
      >
        <div class="dialog-content">
          ${alerts.map(a => this.renderAlert(a))}
          <div class="dialog-footer">${area ? `${area} · ` : ''}Data: ČHMÚ</div>
        </div>
      </ha-dialog>
    `
  }

  private renderAlert (a: ChmuAlert): TemplateResult {
    const color = SEVERITY_COLORS[a.severity ?? ''] ?? SEVERITY_COLORS.Moderate
    const severity = SEVERITY_LABELS[a.severity ?? ''] ?? a.severity ?? ''
    return html`
      <div class="dialog-alert" style="--chmu-alert-color: ${color}">
        <div class="dialog-alert-head">
          <ha-icon .icon=${a.icon ?? 'mdi:alert'}></ha-icon>
          <span class="dialog-alert-label">${a.label ?? ''}</span>
          <span class="dialog-alert-severity">${severity}</span>
        </div>
        ${this.formatRange(a.start, a.end)}
        ${a.description ? html`<p class="dialog-alert-desc">${a.description}</p>` : nothing}
        ${a.instruction ? html`<p class="dialog-alert-instr"><b>Doporučení:</b> ${a.instruction}</p>` : nothing}
      </div>
    `
  }

  private formatRange (start?: string | null, end?: string | null): TemplateResult | typeof nothing {
    const fmt = (iso: string): string =>
      DateTime.fromISO(iso).setLocale(this.locale ?? 'cs').toFormat('d. M. HH:mm')
    if (!start && !end) {
      return nothing
    }
    const from = start ? fmt(start) : '…'
    const to = end ? fmt(end) : '…'
    return html`<div class="dialog-alert-range">${from} – ${to}</div>`
  }

  private countLabel (count: number): string {
    if (count === 1) return '1 výstraha ČHMÚ'
    if (count >= 2 && count <= 4) return `${count} výstrahy ČHMÚ`
    return `${count} výstrah ČHMÚ`
  }

  static readonly styles = css`
    :host {
      display: block;
    }
    :host([variant='chips']) {
      display: inline-flex;
      margin-left: auto;
    }
    .chips {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
    .chips:focus-visible {
      outline: 2px solid var(--primary-color);
      border-radius: 12px;
    }
    .chip {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--chmu-alert-color) 18%, transparent);
    }
    .chip ha-icon {
      --mdc-icon-size: 15px;
      color: var(--chmu-alert-color);
    }
    .chip-more {
      background: color-mix(in srgb, var(--secondary-text-color) 15%, transparent);
      color: var(--secondary-text-color);
      font-size: 0.7rem;
      font-weight: 600;
    }
    .alert-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.75rem;
      padding: 0.45rem 0.6rem;
      border-radius: 8px;
      border-left: 4px solid var(--chmu-alert-color);
      background: color-mix(in srgb, var(--chmu-alert-color) 12%, transparent);
      cursor: pointer;
    }
    .alert-bar:focus-visible {
      outline: 2px solid var(--chmu-alert-color);
    }
    .alert-icon {
      color: var(--chmu-alert-color);
      flex-shrink: 0;
    }
    .alert-texts {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .alert-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--primary-text-color);
    }
    .alert-headline {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .alert-chevron {
      color: var(--secondary-text-color);
      flex-shrink: 0;
    }
    ha-dialog {
      --mdc-dialog-max-width: 560px;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .dialog-alert {
      border-left: 4px solid var(--chmu-alert-color);
      padding: 0.25rem 0 0.25rem 0.75rem;
    }
    .dialog-alert-head {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .dialog-alert-head ha-icon {
      color: var(--chmu-alert-color);
    }
    .dialog-alert-label {
      font-weight: 600;
      flex: 1;
    }
    .dialog-alert-severity {
      font-size: 0.8rem;
      color: var(--chmu-alert-color);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .dialog-alert-range {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
      margin-top: 0.15rem;
    }
    .dialog-alert-desc {
      margin: 0.5rem 0 0;
    }
    .dialog-alert-instr {
      margin: 0.5rem 0 0;
      font-size: 0.9rem;
      color: var(--secondary-text-color);
    }
    .dialog-footer {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
      text-align: right;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'chmu-alert-bar': ChmuAlertBar
  }
}
