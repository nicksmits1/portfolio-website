---
id: electricity
name: 'Energy-efficient electricity forecasting'
where: 'McGill, ECSE 552'
with: 'Loïc Duchesne, William Zimmerman, Bassem Mikhail'
period: '2025-01 to 2025-04'
topics: [sciml]
methods: [Supervised learning, Time-series forecasting]
tools: [TensorFlow, LightGBM]
source: 'Report "Energy Efficient Day-Ahead Electricity Forecasting" (Duchesne, Zimmerman, Mikhail, Smits; local, OneDrive McGill/ECSE 552); team project files on Google Drive (notebooks, saved forecasts, ERCOT and NOAA data), shared by Nicolas 2026-11-19'
disclosure: 'course team project, credited as such. The data is public (ERCOT, NOAA). The report is not hosted: it lists the team members'' email addresses; ask Nicolas before adding it. Code is not public.'
short: Price forecasting
when: Jan – Apr 2025
year: 2025
rail:
  - ["18.07", "test RMSE in $/MWh, CNN-LSTM, best deep model"]
  - ["24 h", "of hourly Houston prices forecast at once"]
  - ["−12%", "energy per epoch from compound scaling"]
  - ["2021–24", "hourly ERCOT price and load, NOAA weather"]
figures:
  trade: { kind: trade }
  forecast: { kind: forecast }
  ablation: { kind: scale, data: electricity, caption: "Test RMSE of the CNN-LSTM with one component removed at a time." }
order: [trade, Formulation, Data, Models, forecast, Compound scaling, Results, ablation]
---
Which deep network forecasts tomorrow's Houston electricity prices best per joule of GPU energy?

## Facts
- Task: forecast the next 24 hourly day-ahead settlement point prices (SPP) for ERCOT's Houston zone from the past 24 hours of price, load, weather (air temperature, wind speed) and cyclical time features.
- Data: ERCOT hourly load and day-ahead prices, NOAA ISD-Lite weather, 2021 to 2024; last 10% (2024-08-30 to 2024-12-31) held out, evaluated in sliding windows.
- Table 2 (10% test set): CNN-LSTM RMSE 18.07, MAE 9.37; LSTM 20.10, 9.52; Transformer 48.6, 26.75.
- Table 1 ablation (RMSE / MAE): full CNN-LSTM 18.07 / 9.37; no convolutions 21.67 / 9.75; no time encoding 20.60 / 9.70; neither 22.31 / 10.55; no LSTM after concatenation 28.66 / 23.29.
- Energy per epoch measured with Zeus on Colab T4 GPUs. Table 4, CNN-LSTM (β: J per epoch, RMSE): 1: 329.16, 16.3; 1.1: 315.67, 17.11; 1.3: 323.92, 17.56; 1.5: 297.95, 18.02; 1.7: 294.51, 19.93; 1.9: 288.50, 22.40; 2.1: 284.76, 26.95. Table 3, LSTM: 1: 504.33, 20.10; 1.1: 472.06, 37.48; 1.3: 435.56, 58.63; 1.5: 327.66, 70.75. The baseline RMSEs in Tables 3 and 4 come from the energy runs, not the Table 2 runs.
- Constraint from the report: energy savings may cost at most a 10% rise in RMSE.
- RNN: ruled out for cost, an order of magnitude slower per step (337 ms against 26 ms) and over 800 J per epoch.
- Last test day, 2024-12-31 (team's saved forecasts against ERCOT prices): RMSE CNN-LSTM 6.96, LSTM 5.66, RNN 12.77, Transformer 15.65. SARIMA (4.28) and SARIMA-LightGBM (4.88) did best on that one day; their forecasts were not saved.

## Sections
### Formulation
Each morning, the day-ahead market clears a price for every hour of tomorrow. The model reads the past 24 hours of price, load, weather and time features and returns all 24 next-day prices at once, as one vector, so errors do not compound hour by hour. Training uses the Huber loss, which behaves like squared error on ordinary hours and like absolute error on the rare price spikes.

### Data
Four years of hourly ERCOT load and day-ahead prices for the Houston zone, joined with NOAA air temperature and wind speed. Hour, weekday and month enter as sine and cosine pairs, so 23:00 sits next to 00:00. The last 10% of the series, about four months, is held out and scored in sliding windows.

### Models
The team compared an RNN, an LSTM, a CNN-LSTM, an Informer-style Transformer, SARIMA and a SARIMA model with LightGBM fitted to its residuals. The CNN-LSTM puts two causal one-dimensional convolutions in front of stacked LSTMs, which picks up sharp local changes the LSTM alone smooths over. A second input carries tomorrow's time encodings into the decoder.

### Compound scaling
To cut energy, the networks shrink the way EfficientNet scales them, with depth multiplied by $\alpha^{-\phi}$ and width by $\beta^{-\phi}$:
$$d' = d\,\alpha^{-\phi}, \qquad w' = w\,\beta^{-\phi}$$
Energy per epoch was measured with Zeus on Colab T4 GPUs, the same hardware anyone can rent.

### Results
The CNN-LSTM had the lowest error of the deep models, 18.07 $/MWh RMSE against the LSTM's 20.10, and caught the size and timing of evening price spikes that the LSTM overshot or smoothed. It also degraded gracefully when shrunk: at β = 1.1 it used 4% less energy within the 10% error budget, and at β = 1.9 it used 12% less, at a cost in accuracy. The LSTM's error nearly doubled at the first step.

## Visual
Lead (`trade`, `src/scripts/trade.ts`): energy per epoch against RMSE for both scaled families, from Tables 3 and 4; the CNN-LSTM in coral, the LSTM in the foreground colour, the 10% error budget above each baseline as a band, and a stepper through β that marks each run and names it ("Width scaled 1.3"). Reduced motion: every point drawn, the baseline marked.
Supporting: `forecast` (`src/scripts/forecast.ts`): the four saved deep-model forecasts for 2024-12-31 against the actual ERCOT price, drawn hour by hour; SARIMA left out because its forecast was not saved. `ablation` reuses the scale figure (Table 1).
Order: trade; "Formulation"; "Data"; "Models"; forecast; "Compound scaling" with the scaling law; "Results"; ablation.
Report not hosted (see disclosure); no further reading block until it may be.
