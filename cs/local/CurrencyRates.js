include_once com.hivext.scripting.local.Logger;
include_once com.hivext.scripting.local.Constants;
include_once com.hivext.scripting.local.ResponseCodes;

// Import Constants for DEFAULT_CURRENCY
include_once com.hivext.scripting.local.Constants;

function CurrencyRates() {
    this.convertCurrency = function convertCurrency(cost, uid) {
        var rates,
            resp;

        resp = this.getCurrencyRates(uid);
        if (resp.result != 0) return resp;

        if (resp.currency == DEFAULT_CURRENCY) return {
            result: 0,
            cost: cost,
            costWithSign: resp.currencySign + cost
        }

        rates = resp.rates;
        for (var i = 0; i < rates.length; i++) {
            if (rates[i].code == resp.currency) {
                var cost = cost / rates[i].usdRate;
                var n = 1;
                while (n * cost < 100) {
                    n *= 10;
                }
                cost = Math.round(cost * n) / n;
                return {
                    result: 0,
                    cost: cost,
                    costWithSign: resp.currencySign + cost
                }
            }
        }
        return {
            result: ResponseCodes.CURRENCY_RATE_ERROR
        }
    };

    this.getCurrencyRates = function getCurrencyRates(uid) {
        var ratesResp,
            currency,
            resp;

        resp = this.getCurrencySettings(uid);
        if (resp.result != 0) return resp;

        currency = resp.currency;
        if (currency == "&#36;") currency = DEFAULT_CURRENCY;

        if (currency != DEFAULT_CURRENCY) {
            ratesResp = this.getRates();
            if (ratesResp.result != 0) return ratesResp;

            resp.rates = ratesResp.rates;
        }

        return resp;
    };

    this.getCurrencySettings = function getCurrencySettings(uid) {
        var jbillingType = "jbilling";
        var currencySetting = "external.billing.currency";
        var currencySymbol = "currency.symbol";

        var resp = jelastic.billing.reseller.GetResellerByUid(appid + "/cluster", signature, uid || user.uid);
        if (resp.result != 0) return resp;

        var resellerId = resp.object ? resp.object.id : 0;

        resp = jelastic.administration.config.GetConfigKeyByResellerId(appid + "/cluster", signature, jbillingType, currencySetting, resellerId);
        if (resp.result != 0) return resp;

        var currency = resp.value || resp.default_value;
        var currencySign = "";

        if (currency) {
            resp = jelastic.administration.config.GetConfigKeyByResellerId(appid + "/cluster", signature, jbillingType, currencySymbol, resellerId);
            if (resp.result != 0) return resp;
            currencySign = resp.value || resp.default_value;
        }

        if (!currency || !currencySign) {
            resp = api.dev.scripting.Eval("dashboard", session, "settings/GetHosterSettings");
            if (resp.result != 0) return resp;

            resp = resp.data;
            currency = resp.response.currency;
            currencySign = resp.response.currencySign;
        }

        return {
            result: 0,
            currency: currency,
            currencySign: currencySign
        }
    };

    this.getRates = function getRates() {
        var resp;

        resp = jelastic.billing.pricing.GetCurrencies(appid + "/cluster", signature);
        if (resp.result != 0) return resp;

        return {
            result: 0,
            rates: resp.array
        };
    }
}