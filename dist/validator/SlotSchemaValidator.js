"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.mybooking = exports.slotBookingValidator = exports.validateSlot = void 0;
const joi_1 = __importDefault(require("joi"));
const date_1 = __importDefault(require("@joi/date"));
const Joi = joi_1.default.extend(date_1.default);
exports.validateSlot = Joi.object({
    date: Joi.date().format('YYYY-MM-DD').required(),
});
exports.slotBookingValidator = Joi.object({
    mobile: Joi.string().length(10).required(),
    doseType: Joi.number().valid(1, 2).required(),
    slotId: Joi.string().max(30).required(),
});
exports.mybooking = Joi.object({
    mobile: Joi.string().length(10).required(),
});
exports.cancelBooking = Joi.object({
    mobile: Joi.string().length(10).required()
});
