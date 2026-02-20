//@auth
include_once com.hivext.scripting.local.CurrencyRates;
include_once com.hivext.scripting.local.Constants;
include_once com.hivext.scripting.settings;

function UI (config) {
    var currencyRates = new CurrencyRates(),
        groupType = getParam('groupType', ''),
        uid = config.uid;

    this.create = function() {
        var settings,
            resp;

        resp = this.getSettings();
        if (resp.result != 0) return 0;

        settings = resp.settings;

        resp = this.getDescription();
        if (resp.result != 0) return 0;

        return {
            result: 0,
            description: resp.description,
            settings: settings
        };
    };

    this.getGroupType = function() {
        var group,
            resp;

        if (groupType) {
            group = groupType;
        } else {
            resp = jelastic.billing.account.GetAccount();
            if (resp.result != 0) return 0;
            group = resp.groupType;
        }

        return {
            result: 0,
            groupType: group
        }
    };

    this.getDescription = function() {
        return {
            result: 0,
            description: "AQTra license with instance size-based billing.\n\n" +
                "License pricing based on instance size (cloudlets):\n" +
                "  • 1-7 cloudlets: $0.00043/hour ($0.31250/month)\n" +
                "  • 8-14 cloudlets: $0.00043/hour ($0.30938/month, 1% discount)\n" +
                "  • 15-29 cloudlets: $0.00043/hour ($0.30625/month, 2% discount)\n" +
                "  • 30-59 cloudlets: $0.00042/hour ($0.30313/month, 3% discount)\n" +
                "  • 60-119 cloudlets: $0.00041/hour ($0.29688/month, 5% discount)\n" +
                "  • 120-239 cloudlets: $0.00041/hour ($0.29375/month, 6% discount)\n" +
                "  • 240+ cloudlets: $0.00040/hour ($0.29063/month, 7% discount)\n\n" +
                "Billing is calculated automatically based on your instance size."
        };
    }

    this.getSettings = function() {
        var settings = {},
            resp;

        resp = this.getGroupType();
        if (resp.result != 0) return 0;

        if (resp.groupType == TRIAL) {
            if (!settings.main) settings.main = {};
            if (!settings.main.fields) settings.main.fields = [];

            settings.main.fields.push({
                "type": "displayfield",
                "cls": "warning",
                "height": 20,
                "hideLabel": true,
                "markup": "This addon is not available for TRIAL accounts. Please upgrade your account."
            }, {
                "type": "compositefield",
                "width": 0,
                "height" : 0,
                "hideLabel": true,
                "items": [{
                    "height" : 0,
                    "type": "string",
                    "required": true
                }]
            });
        }

        return {
            result: 0,
            settings: settings
        };
    };
}

return new UI({
    uid: user.uid
}).create();
