/**
 * GUI editor karty (fork-only). Používá <ha-form> z HA frontendu,
 * takže se vzhledově chová jako editory vestavěných karet.
 */
import { LitElement, html, type TemplateResult, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { fireEvent, type HomeAssistant, type LovelaceCardEditor } from 'custom-card-helpers'
import { type ClockWeatherCardConfig } from './types'

interface SchemaItem {
  name: string
  required?: boolean
  type?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selector?: Record<string, any>
  schema?: SchemaItem[]
}

const SCHEMA: SchemaItem[] = [
  { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
  { name: 'alert_entity', selector: { entity: { domain: 'binary_sensor' } } },
  { name: 'compact', selector: { boolean: {} } },
  {
    name: 'alert_display',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'icons', label: 'Ikonky' },
          { value: 'bar', label: 'Proužek' }
        ]
      }
    }
  },
  { name: 'hourly_forecast', selector: { boolean: {} } },
  { name: 'forecast_rows', selector: { number: { min: 1, max: 14, mode: 'box' } } },
  { name: 'locale', selector: { text: {} } },
  {
    name: 'time_format',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: '24', label: '24 h' },
          { value: '12', label: '12 h' }
        ]
      }
    }
  },
  { name: 'hide_today_section', selector: { boolean: {} } },
  { name: 'hide_forecast_section', selector: { boolean: {} } },
  { name: 'hide_clock', selector: { boolean: {} } },
  { name: 'hide_date', selector: { boolean: {} } },
  { name: 'show_humidity', selector: { boolean: {} } },
  { name: 'show_decimal', selector: { boolean: {} } },
  {
    name: 'sensors',
    type: 'expandable',
    schema: [
      {
        name: 'temperature_sensor',
        selector: { entity: { domain: 'sensor', device_class: 'temperature' } }
      },
      {
        name: 'humidity_sensor',
        selector: { entity: { domain: 'sensor', device_class: 'humidity' } }
      }
    ]
  },
  {
    name: 'rain',
    type: 'expandable',
    schema: [
      { name: 'rain_entity', selector: { entity: { domain: 'binary_sensor' } } },
      { name: 'rain_expected_entity', selector: { entity: { domain: 'binary_sensor' } } },
      { name: 'rain_eta_entity', selector: { entity: { domain: 'sensor' } } },
      { name: 'rain_intensity_entity', selector: { entity: { domain: 'sensor' } } }
    ]
  }
]

const LABELS: Record<string, string> = {
  entity: 'Weather entita',
  alert_entity: 'Entita výstrah (binary_sensor)',
  compact: 'Kompaktní layout (hodiny · ikona · teplota)',
  alert_display: 'Zobrazení výstrah',
  hourly_forecast: 'Hodinová předpověď',
  forecast_rows: 'Počet řádků předpovědi',
  locale: 'Locale (např. cs)',
  time_format: 'Formát času',
  hide_today_section: 'Skrýt horní sekci',
  hide_forecast_section: 'Skrýt předpověď',
  hide_clock: 'Skrýt hodiny',
  hide_date: 'Skrýt datum',
  show_humidity: 'Zobrazit vlhkost (plný layout)',
  show_decimal: 'Teplota s desetinami',
  sensors: 'Vlastní čidla',
  temperature_sensor: 'Čidlo teploty (místo hodnoty z modelu)',
  humidity_sensor: 'Čidlo vlhkosti (místo hodnoty z modelu)',
  rain: 'Dešťový chip (meteoradar)',
  rain_entity: 'Prší (binary_sensor)',
  rain_expected_entity: 'Bude pršet (binary_sensor)',
  rain_eta_entity: 'Déšť za (sensor, min)',
  rain_intensity_entity: 'Intenzita srážek (sensor, mm/h)'
}

@customElement('chmu-clock-weather-card-editor')
export class ChmuClockWeatherCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private config?: ClockWeatherCardConfig

  public setConfig (config: ClockWeatherCardConfig): void {
    this.config = config
  }

  protected render (): TemplateResult | typeof nothing {
    if (!this.hass || !this.config) {
      return nothing
    }
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${SCHEMA}
        .computeLabel=${(s: SchemaItem) => LABELS[s.name] ?? s.name}
        @value-changed=${this.valueChanged}
      ></ha-form>
    `
  }

  private valueChanged (ev: CustomEvent): void {
    const config = (ev.detail as { value: ClockWeatherCardConfig }).value
    fireEvent(this, 'config-changed', { config })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chmu-clock-weather-card-editor': ChmuClockWeatherCardEditor
  }
}
