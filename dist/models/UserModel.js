"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaccinationStatus = exports.DoseType = void 0;
var DoseType;
(function (DoseType) {
    DoseType[DoseType["One"] = 1] = "One";
    DoseType[DoseType["Two"] = 2] = "Two";
})(DoseType || (exports.DoseType = DoseType = {}));
var VaccinationStatus;
(function (VaccinationStatus) {
    VaccinationStatus["None"] = "none";
    VaccinationStatus["FirstDose"] = "first-dose-completeed";
    VaccinationStatus["SecondDose"] = "second-dose-completed";
})(VaccinationStatus || (exports.VaccinationStatus = VaccinationStatus = {}));
