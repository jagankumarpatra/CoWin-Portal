import coreJoi, { Extension, Root } from "joi";
import joiDate from "@joi/date";
const Joi = coreJoi.extend(joiDate as unknown as Extension) as Root;
export const validateSlot = Joi.object({
      date: Joi.date().format('YYYY-MM-DD').required(),
});

export const slotBookingValidator=Joi.object({
    mobile: Joi.string().length(10).required(),
    doseType : Joi.number().valid(1,2).required(),
    slotId: Joi.string().max(30).required(),
})

export const mybooking=Joi.object({
    mobile: Joi.string().length(10).required(),
})

export const cancelBooking=Joi.object({
    mobile: Joi.string().length(10).required()
})