import { css } from 'lit'

export default css`

  ha-card {
    --bar-height: 1.5rem;
    height: 100%;
  }

  clock-weather-card-today {
    display: flex;
  }

  clock-weather-card-today-left {
    display: flex;
    width: 35%;
    align-items: center;
    justify-content: center;
  }

  .grow-img {
    max-width: 100%;
    max-height: 100%;
  }

  clock-weather-card-today-right {
    display: flex;
    width: 65%;
    justify-content: space-around;
    align-items: center;
  }

  clock-weather-card-today-right-wrap {
    display: flex;
    flex-direction: column;
  }

  clock-weather-card-today-right-wrap-top {
    width: 100%;
    text-align: end;
    display: block;
  }

  clock-weather-card-today-right-wrap-center {
    display: flex;
    height: 4rem;
    font-size: 3.5rem;
    white-space: nowrap;
    align-items: center;
    justify-content: center;
  }

  clock-weather-card-today-right-wrap-bottom {
    display: flex;
    justify-content: start;
  }

  clock-weather-card-forecast {
    display: block;
  }

  clock-weather-card-forecast-row {
    display: grid;
    grid-template-columns: var(--col-one-size) 2rem 2.1rem auto 2.1rem;
    align-items: center;
    grid-gap: 0.5rem;
  }

  forecast-text {
    text-align: var(--text-align);
    white-space: nowrap;
    text-overflow: clip;
  }

  forecast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  forecast-temperature-bar {
    position: relative;
    width: 100%;
    height: var(--bar-height);
    border-radius: calc(var(--bar-height) / 2);
    overflow: hidden;
  }

  forecast-temperature-bar-background {
    left: 0%;
    right: 100%;
    width: 100%;
    opacity: 0.25;
    background: var(--light-primary-color);
  }

  forecast-temperature-bar-current-indicator-dot {
    --border-width: 2px;
    background-color: var(--primary-text-color);
    border-radius: 50%;
    width: var(--bar-height);
    box-shadow: inset 0 0 0 var(--border-width) var(--text-light-primary-color);
    margin-left: calc(var(--move-right) * -1 * var(--bar-height));
  }

  forecast-temperature-bar-range {
    border-radius: calc(var(--bar-height) / 2);
    left: var(--start-percent);
    right: calc(100% - var(--end-percent));
    background: linear-gradient(to right, var(--gradient));
    overflow: hidden;
    min-width: var(--bar-height);
    margin-left: calc(var(--move-right) * -1 * var(--bar-height));
  }

  forecast-temperature-bar-current-indicator {
    opacity: 0.75;
    left: var(--position);
  }

  forecast-temperature-bar-current-indicator,
  forecast-temperature-bar-current-indicator-dot,
  forecast-temperature-bar-background,
  forecast-temperature-bar-range {
    height: 100%;
    position: absolute;
  }

  aqi {
    padding: 2px;
    border-radius: 5px;
  }

  /* --- fork: řádek s datem nese i ikonky výstrah --- */
  clock-weather-card-today-right-wrap-bottom {
    align-items: center;
  }

  /* --- fork: kompaktní režim (compact: true) ---
     Today sekci nahrazuje jeden řádek: velké hodiny, ikona počasí,
     velká teplota (stejná velikost jako hodiny), ikonky výstrah vpravo. */
  ha-card.compact {
    --bar-height: 1.2rem;
  }

  ha-card.compact .card-content {
    padding-top: 8px;
    padding-bottom: 8px;
    container-type: inline-size;
  }

  .compact-today {
    display: flex;
    align-items: center;
    gap: clamp(0.3rem, 1.6cqw, 0.7rem);
    margin-bottom: 0.4rem;
  }

  .compact-today .compact-right {
    display: flex;
    align-items: center;
    gap: clamp(0.4rem, 2cqw, 0.8rem);
    margin-left: auto;
  }

  .compact-today .compact-clock-text,
  .compact-today .compact-temp {
    font-size: 3rem;
    font-size: clamp(1.7rem, 9.9cqw, 3.45rem);
    line-height: 1.15;
    white-space: nowrap;
  }

  .compact-today .compact-icon {
    height: 3.6rem;
    height: clamp(2.5rem, 11.5cqw, 4.15rem);
    width: auto;
  }

  .compact-today .compact-stack {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.15rem;
    font-size: 1.25rem;
    font-size: clamp(0.9rem, 4.2cqw, 1.25rem);
    line-height: 1.15;
    white-space: nowrap;
    color: var(--secondary-text-color);
  }

  ha-card.compact clock-weather-card-forecast-row {
    grid-gap: 0.35rem;
  }
`
