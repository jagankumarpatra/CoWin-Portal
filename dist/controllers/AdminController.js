"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredData = exports.getAllBookings = exports.getSlots = exports.addSlot = void 0;
const MongoClient_1 = require("../utils/MongoClient");
const addSlot = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { date, time, availableCapacity } = body;
        if (!date || !time || !availableCapacity) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Some fields are missing"
                })
            };
        }
        const db = await (0, MongoClient_1.slotdbConnect)();
        const slot = await db?.insertOne({ date, time, availableCapacity });
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Slot added successfully", slot
            })
        };
    }
    catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        };
    }
};
exports.addSlot = addSlot;
const getSlots = async (event) => {
    try {
        const db = await (0, MongoClient_1.slotdbConnect)();
        const slotData = await db?.find().toArray();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All slots found", slotData
            })
        };
    }
    catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        };
    }
};
exports.getSlots = getSlots;
const getAllBookings = async (event) => {
    try {
        const db = await (0, MongoClient_1.dbConnect)();
        const bookingsData = await db?.find({ bookedSlot: { $ne: null } }).toArray();
        console.log(bookingsData);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All bookings found", bookingsData
            })
        };
    }
    catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        };
    }
};
exports.getAllBookings = getAllBookings;
const getFilteredData = async (event) => {
    try {
        const age = Number(event.queryStringParameters?.age);
        const pincode = Number(event.queryStringParameters?.pincode);
        const vaccinationStatus = event.queryStringParameters?.vaccinationStatus;
        const db = await (0, MongoClient_1.dbConnect)();
        let query = {};
        if (age) {
            query.age = age;
        }
        if (pincode) {
            query.pincode = pincode;
        }
        if (vaccinationStatus) {
            query.vaccinationStatus = vaccinationStatus;
        }
        const data = await db?.find(query).toArray();
        console.log(data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All filtered data found", data
            })
        };
    }
    catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        };
    }
};
exports.getFilteredData = getFilteredData;
