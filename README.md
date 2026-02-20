# AQTra Integration

Billing integration for AQTra licenses with cost calculation based on instance size (cloudlets count).

## Structure

```
intergrations/aqtra/
├── add_aqtra_grids.yaml          # JPS package for adding tariffs and grids
├── cs/
│   ├── wizard/
│   │   └── ui.js                 # UI for installation wizard
│   └── local/
│       ├── Constants.js          # Constants (prices, tiers, discounts)
│       └── CurrencyRates.js     # Currency handling
└── README.md                     # Documentation
```

## Pricing Model

### License Billing
AQTra uses license billing model (`type: "LICENCE"`), where license cost depends on instance size (cloudlets count).

### Tariff Grid (GRADUATED Strategy)
Calculation based on instance size with automatic discount application:

| Cloudlets | Price per hour | Price per month | Discount |
|-----------|-----------------|-----------------|----------|
| 1-7       | $0.00043        | $0.31250        | 0%       |
| 8-14      | $0.00043        | $0.30938        | 1%       |
| 15-29     | $0.00043        | $0.30625        | 2%       |
| 30-59     | $0.00042        | $0.30313        | 3%       |
| 60-119    | $0.00041        | $0.29688        | 5%       |
| 120-239   | $0.00041        | $0.29375        | 6%       |
| 240+      | $0.00040        | $0.29063        | 7%       |

### Free Tier
- Configured via `free` parameter in tariff tiers
- Default: **0 cloudlets** (all cloudlets are billable)

## Installation

### Рекомендуемая схема: тарифы как отдельное приложение

**Шаг 1.** Хостер один раз устанавливает тарифы как отдельное приложение (через Marketplace или CLI):

```bash
jelastic marketplace install add_aqtra_grids.yaml
```

Так тарифы появляются в системе на уровне хостера.

**Шаг 2.** Основной пакет AQTra (`manifest.yaml`) при установке только подключает ноды к уже существующим тарифам — вызовов `installTariffs` в нём нет.

### Альтернатива: тарифы внутри основного пакета

Если нужно, чтобы тарифы ставились при каждой установке продукта, добавьте в `manifest.yaml`:

```yaml
onInstall:
  - installTariffs
  # ... other steps ...

actions:
  installTariffs:
    jps: add_aqtra_grids.yaml
    settings:
      hoster: true
      allResellers: false
```

**Важно:** Файл `add_aqtra_grids.yaml` должен быть доступен (в том же репозитории или по полному URL).

См. `INTEGRATION_EXAMPLE.yaml` для полного примера.

## How It Works

1. **Automatic Billing:**
   - Jelastic billing system automatically calculates license cost based on tariff
   - Uses `GRADUATED` strategy with tiers based on cloudlets count
   - Calculation happens automatically during each billing cycle

2. **Instance Size Detection:**
   - System uses `CLOUDLETS_LIMIT` as secondary resource to determine tier
   - Price is selected based on current cloudlets count of the node

3. **Discount Application:**
   - Discounts are built into tier prices (different prices for different cloudlet ranges)
   - System automatically applies correct tier based on instance size

## License Binding

License is bound to node through billing options in format:
```javascript
billingOptions = [{ name: "aqtra", value: "1" }]
```

This should be set in your main AQTra JPS package when installing the product.

## Configuration

### Changing Free Tier
Edit `add_aqtra_grids.yaml`, modify `free` parameter in tiers:
```yaml
tiers: [
  {
    "free": 4,  # First 4 cloudlets are free
    "value": 1,
    "currencyPrice": 0.00043
  },
  ...
]
```

### Changing Prices and Tiers
Edit `add_aqtra_grids.yaml`:
```yaml
tiers: [
  {
    "free": 0,
    "value": 1,           # Tier start (cloudlets)
    "currencyPrice": 0.00043  # Price per hour per cloudlet
  },
  ...
]
```

## Technical Details

### Tariff Configuration
- **Type:** `LICENCE` - defines what is being billed (license billing, not external resource)
- **Strategy:** `GRADUATED` - defines how price is calculated (graduated pricing with tiers based on cloudlets)
- **Secondary Resource:** `CLOUDLETS_LIMIT` - used to determine instance size for tier selection

**Note:** `type` and `strategy` are different concepts:
- `type: LICENCE` means we're billing for a license (like BitNinja), not an external resource (like CDN traffic)
- `strategy: GRADUATED` means the price varies based on tiers (unlike BitNinja which uses `FLAT` strategy with fixed price)

### Automatic Calculation
- Billing happens automatically through Jelastic tariff system
- No additional scripts required for calculation
- Cost is calculated based on current instance size (cloudlets)

## Compatibility

- Requires Jelastic version 5.9.2 or higher
- Uses API: `jelastic.billing.pricing` for tariff management
- Works with Jelastic automatic billing system

## Differences from Other Integrations

- **BitNinja:** `type: LICENCE`, `strategy: FLAT` (fixed price per license)
- **AQTra:** `type: LICENCE`, `strategy: GRADUATED` (price depends on instance size via tiers)
- **CDN:** `type: EXTERNAL`, uses scheduled tasks for billing calculation
