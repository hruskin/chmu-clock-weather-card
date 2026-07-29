# ČHMÚ Clock Weather Card

Fork karty [clock-weather-card](https://github.com/pkissling/clock-weather-card)
(v2.9.4, MIT) rozšířený o **výstrahy ČHMÚ**: barevný proužek nad počasím
a rozklikávací popup s plnými texty výstrah. Navrženo pro integraci
[ha-chmu-meteogram](https://github.com/hruskin/ha-chmu-meteogram) (>= 0.5.0).

![Základ karty (upstream clock-weather-card)](.github/assets/card.gif)

*(GIF ukazuje upstream základ; fork navíc zobrazuje barevný proužek výstrah
nad sekcí počasí a po kliknutí popup s plnými texty.)*

## Co přidává oproti originálu

- `alert_entity` — binary_sensor výstrah z integrace ha-chmu-meteogram
- **Výstrahy jako ikonky** (`alert_display: icons`, výchozí): kruhové ikonky
  obarvené podle závažnosti, zabírají nulovou výšku navíc. `alert_display: bar`
  zobrazí místo nich proužek přes celou šířku s titulkem („Zátěž teplem · Bouřky")
- Klik/tap otevře nativní `ha-dialog` s detailem každé výstrahy:
  název, závažnost, platnost od–do, popis a doporučení
- **`compact: true`** — horní sekce se smrskne do jednoho řádku: vlevo ikona
  počasí a teplota, vpravo blok vlhkost a tlak (poloviční velikost, pod sebou) ·
  ikonky výstrah · hodiny úplně vpravo. Písmo i ikona se plynule přizpůsobují
  šířce karty. Řádky předpovědi zůstávají beze změny
- **GUI editor** — kartu lze nastavit klikáním, bez psaní YAML
- Bez výstrahy se karta chová přesně jako originál
- Žádná závislost na browser_mod

Vše ostatní (hodiny, předpověď, konfigurace) je beze změny — viz
[dokumentace originálu](https://github.com/pkissling/clock-weather-card#readme).

## Instalace (HACS)

1. HACS → ⋮ → Custom repositories → `https://github.com/hruskin/chmu-clock-weather-card`,
   Category: **Dashboard**
2. Nainstalovat, obnovit stránku (Ctrl+F5)

Karta se registruje jako **`custom:chmu-clock-weather-card`** — jiné jméno než
originál, takže obě karty mohou být nainstalované vedle sebe.

## Konfigurace

Nejjednodušší je použít **GUI editor** (Přidat kartu → ČHMÚ Clock Weather Card).
YAML ekvivalent:

```yaml
type: custom:chmu-clock-weather-card
entity: weather.chmu_home_predpoved
alert_entity: binary_sensor.chmu_home_vystrahy_chmu
compact: true
locale: cs
hourly_forecast: true
```

| Volba | Výchozí | Popis |
|---|---|---|
| `alert_entity` | — | binary_sensor výstrah; bez něj se výstrahy nezobrazují |
| `alert_display` | `icons` | `icons` = ikonky, `bar` = proužek přes šířku |
| `compact` | `false` | jednořádková horní sekce s vlhkostí a tlakem |

Vlhkost a tlak se v compact režimu berou z atributů weather entity
(`humidity`, `pressure`); pokud je entita nemá, sloupec se nezobrazí.

`alert_entity` je volitelné — bez něj se karta chová jako upstream verze.
Očekává atributy `alert_count`, `headline`, `color`, `alert_icon` a `alerts[]`
(s `label`, `icon`, `severity`, `description`, `instruction`, `start`, `end`),
které poskytuje binary_sensor z ha-chmu-meteogram.

## Vývoj

```bash
yarn install
yarn build        # dist/chmu-clock-weather-card.js
```

Rebase na novější upstream:

```bash
git fetch upstream
git rebase v2.X.Y   # fork-only změny: src/alerts.ts + pár řádků v hlavních souborech
```

## Licence

MIT — původní karta © Patrick Kissling, ikony © Bas Milius, úpravy © hruskin.
