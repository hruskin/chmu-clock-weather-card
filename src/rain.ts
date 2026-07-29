/**
 * Dešťový nowcast chip (fork-only feature).
 *
 * Čte radarové entity z integrace ha-chmu-meteogram:
 *   binary_sensor …_prsi          → prší teď
 *   binary_sensor …_bude_prset    → déšť se blíží
 *   sensor …_dest_za              → za kolik minut začne
 *   sensor …_intenzita_srazek     → mm/h
 *
 * Zobrazí se jen když je co hlásit; jinak nerenderuje nic.
 */
import { LitElement, html, css, type TemplateResult, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { type HomeAssistant } from 'custom-card-helpers'

const UNAVAILABLE = new Set(['unknown', 'unavailable', 'none', ''])

@customElement('chmu-rain-chip')
export class ChmuRainChip extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @property() public rainEntity?: string
  @property() public rainExpectedEntity?: string
  @property() public rainEtaEntity?: string
  @property() public rainIntensityEntity?: string
  @property() public locale?: string

  /** Odráží se do atributu, aby karta poznala, že chip zabírá místo. */
  @property({ type: Boolean, reflect: true }) public active = false

  protected updated (_changed: PropertyValues): void {
    const shown = this.shadowRoot?.querySelector('.chip') != null
    if (shown !== this.active) {
      this.active = shown
    }
  }

  protected render (): TemplateResult | typeof nothing {
    if (!this.hass) {
      return nothing
    }
    if (this.isOn(this.rainEntity)) {
      return this.chip('raining', 'mdi:weather-pouring', this.intensityLines() ?? ['Prší', ''])
    }
    if (this.isOn(this.rainExpectedEntity)) {
      return this.chip('expected', 'mdi:weather-rainy', this.etaLines() ?? ['Bude', 'pršet'])
    }
    return nothing
  }

  /** Dvouřádkový chip — užší než jeden dlouhý řádek, takže netlačí na zbytek. */
  private chip (
    kind: 'raining' | 'expected',
    icon: string,
    [primary, secondary]: [string, string]
  ): TemplateResult {
    const title = secondary ? `${primary} ${secondary}` : primary
    return html`
      <div class="chip ${kind}" title=${title}>
        <ha-icon .icon=${icon}></ha-icon>
        <div class="lines">
          <span>${primary}</span>
          ${secondary ? html`<span>${secondary}</span>` : nothing}
        </div>
      </div>
    `
  }

  private isOn (entityId?: string): boolean {
    if (!entityId) {
      return false
    }
    return this.hass.states[entityId]?.state === 'on'
  }

  /** Číselný stav entity, nebo null když chybí/není dostupná. */
  private numeric (entityId?: string): { value: number, unit: string } | null {
    if (!entityId) {
      return null
    }
    const state = this.hass.states[entityId]
    if (!state || UNAVAILABLE.has(state.state)) {
      return null
    }
    const value = Number(state.state)
    if (!Number.isFinite(value)) {
      return null
    }
    return { value, unit: (state.attributes.unit_of_measurement as string | undefined) ?? '' }
  }

  private etaLines (): [string, string] | null {
    const eta = this.numeric(this.rainEtaEntity)
    if (eta === null) {
      return null
    }
    const minutes = Math.max(0, Math.round(eta.value))
    if (minutes < 1) {
      return ['za', 'chvíli']
    }
    if (minutes < 60) {
      return [`za ${minutes}`, 'min']
    }
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return [`za ${hours} h`, rest === 0 ? '' : `${rest} min`]
  }

  private intensityLines (): [string, string] | null {
    const intensity = this.numeric(this.rainIntensityEntity)
    if (intensity === null || intensity.value <= 0) {
      return null
    }
    const formatted = intensity.value.toLocaleString(this.locale ?? 'cs', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })
    return [formatted, intensity.unit]
  }

  static readonly styles = css`
    :host {
      display: none;
    }
    :host([active]) {
      display: inline-flex;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      border-radius: 10px;
      padding: 3px 7px 3px 4px;
      white-space: nowrap;
      font-size: var(--chmu-rain-font, 0.78rem);
      font-weight: 500;
      line-height: 1.15;
      color: var(--primary-text-color);
      background: color-mix(in srgb, var(--chmu-rain-color) 16%, transparent);
    }
    .lines {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .chip.raining {
      background: color-mix(in srgb, var(--chmu-rain-color) 30%, transparent);
    }
    .chip ha-icon {
      --mdc-icon-size: 1.35em;
      color: var(--chmu-rain-color);
      display: flex;
    }
    .expected {
      --chmu-rain-color: #3081d0;
    }
    .raining {
      --chmu-rain-color: #1565c0;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'chmu-rain-chip': ChmuRainChip
  }
}
