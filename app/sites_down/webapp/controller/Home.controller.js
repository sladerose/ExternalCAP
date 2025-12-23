sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat"
], function (Controller, Filter, FilterOperator, DateFormat) {
    "use strict";

    return Controller.extend("external.ca.sitesdown.controller.Home", {
        onInit: function () {
            // Any initialization logic
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            // Supabase/Postgres returns microseconds (e.g. 2025-12-10T16:24:05.316122)
            var sCleanDate = sDate;
            if (typeof sDate === "string") {
                if (/\.\d{4,}/.test(sDate)) {
                    sCleanDate = sDate.replace(/(\.\d{3})\d+/, "$1");
                }
            }

            var oDate = new Date(sCleanDate);
            if (isNaN(oDate.getTime())) {
                return sDate; // Fallback
            }

            var oDateFormat = DateFormat.getDateTimeInstance({
                style: "medium"
            });
            return oDateFormat.format(oDate);
        },

        formatCriticality: function (iCriticality) {
            // Mapping for sap.ui.core.ValueState or IndicationColor
            // 1 = Error (Red)
            // 2 = Warning (Orange)
            // 3 = Success (Green)
            // 0 = None (Neutral)
            switch (iCriticality) {
                case 1: return "Error";
                case 2: return "Warning";
                case 3: return "Success";
                default: return "None";
            }
        },

        formatCriticalityColor: function (iCriticality) {
            // Mapping for sap.f.cards.HeaderStatus
            switch (iCriticality) {
                case 1: return "Error";
                case 2: return "Warning";
                case 3: return "Success";
                default: return "Neutral";
            }
        },

        formatReliabilityState: function (sStatus) {
            if (!sStatus) return "None";
            if (sStatus.includes("Critical")) return "Error";
            if (sStatus.includes("Unstable")) return "Warning";
            return "Success";
        },

        formatFreshnessIcon: function (sDate) {
            if (!sDate) return "#888888"; // Gray - No data
            var oDate = new Date(sDate);
            var oNow = new Date();
            var iDiffHours = (oNow - oDate) / (1000 * 60 * 60);

            if (iDiffHours > 24) return "#E00000"; // Red - Old
            if (iDiffHours > 6) return "#E69A00"; // Orange - Delayed
            return "#107E3E"; // Green - Fresh
        },

        formatUptimeState: function (fPercentage) {
            if (fPercentage < 90) return "Error";
            if (fPercentage < 98) return "Warning";
            return "Success";
        },

        formatProvincePos: function (sProvince) {
            var mPos = {
                "Gauteng": "-26.2708;28.0422;0",
                "Western Cape": "-33.9249;18.4241;0",
                "Eastern Cape": "-32.2968;26.4194;0",
                "Northern Cape": "-29.0817;21.8569;0",
                "Free State": "-28.4541;26.7968;0",
                "KwaZulu-Natal": "-28.5306;30.8958;0",
                "North West": "-26.6639;25.2838;0",
                "Mpumalanga": "-26.1592;30.0042;0",
                "Limpopo": "-23.4013;29.4179;0"
            };
            return mPos[sProvince] || "-28.4793;24.6727;0"; // Default to center of SA
        },

        formatHealthState: function (fUptime) {
            if (fUptime < 90) return "Error";
            if (fUptime < 98) return "Warning";
            return "Success";
        },

        formatHealthColor: function (fUptime) {
            if (fUptime < 90) return "rgba(224, 0, 0, 0.6)"; // Red
            if (fUptime < 98) return "rgba(230, 154, 0, 0.6)"; // Orange
            return "rgba(16, 126, 62, 0.6)"; // Green
        },

        formatRegionCode: function (sProvince) {
            if (!sProvince) return "";
            var mRegions = {
                "Western Cape": "ZA-WC",
                "Gauteng": "ZA-GT",
                "Eastern Cape": "ZA-EC",
                "Northern Cape": "ZA-NC",
                "Free State": "ZA-FS",
                "KwaZulu-Natal": "ZA-NL",
                "North West": "ZA-NW",
                "Mpumalanga": "ZA-MP",
                "Limpopo": "ZA-LP"
            };
            return mRegions[sProvince] || "";
        },

        onMapRendered: function () {
            // Delay slightly to ensure DOM is ready and Leaflet potentially loaded from CDN
            setTimeout(function () {
                if (typeof L === "undefined") {
                    console.error("Leaflet not loaded");
                    return;
                }

                if (this._oMap) {
                    this._oMap.remove();
                }

                // Initial map setup centering on South Africa
                this._oMap = L.map('map').setView([-28.47, 24.67], 5);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(this._oMap);

                var oTable = this.byId("regionalHealthTable");
                if (!oTable) return;
                var oBinding = oTable.getBinding("items");

                var fnUpdateMarkers = function () {
                    var aContexts = oBinding.getContexts();
                    var aData = aContexts.map(ctx => ctx.getObject());

                    if (aData.length === 0) return;

                    var mPos = {
                        "Gauteng": [-26.2708, 28.0422],
                        "Western Cape": [-33.9249, 18.4241],
                        "Eastern Cape": [-32.2968, 26.4194],
                        "Northern Cape": [-29.0817, 21.8569],
                        "Free State": [-28.4541, 26.7968],
                        "KwaZulu-Natal": [-28.5306, 30.8958],
                        "North West": [-26.6639, 25.2838],
                        "Mpumalanga": [-26.1592, 30.0042],
                        "Limpopo": [-23.4013, 29.4179]
                    };

                    // Clear existing markers (except tile layer)
                    this._oMap.eachLayer(function (layer) {
                        if (layer instanceof L.Circle) {
                            this._oMap.removeLayer(layer);
                        }
                    }.bind(this));

                    aData.forEach(function (oItem) {
                        var aCoord = mPos[oItem.province];
                        if (aCoord) {
                            var sColor = this.formatHealthColor(oItem.uptime_percentage);
                            L.circle(aCoord, {
                                color: sColor,
                                fillColor: sColor,
                                fillOpacity: 0.6,
                                radius: 80000 // 80km
                            }).addTo(this._oMap).bindPopup("<b>" + oItem.province + "</b><br>Uptime: " + oItem.uptime_percentage + "%");
                        }
                    }.bind(this));
                }.bind(this);

                // Initial update if data already there
                fnUpdateMarkers();

                // Update when binding changes (data arrives)
                oBinding.attachChange(fnUpdateMarkers);

            }.bind(this), 800);
        }
    });
});
