"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookSlot = exports.getProfile = exports.loginUser = exports.registerUser = exports.init = void 0;
const mongodb_1 = require("mongodb");
const UserModel_1 = require("../models/UserModel");
const MongoClient_1 = require("../utils/MongoClient");
const init = async () => {
    const db = await (0, MongoClient_1.dbConnect)();
    if (db) {
        console.log("Db collection Connected from UserController");
    }
};
exports.init = init;
(0, exports.init)();
const registerUser = async (event) => {
    try {
        console.log("User is registered");
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { name, mobile, password, aadharNumber, age, pincode, } = body;
        if (!name || !mobile || !password || !aadharNumber || !age || !pincode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "All fields Required" })
            };
        }
        const db = await (0, MongoClient_1.dbConnect)();
        const existingUser = await db.findOne({ mobile });
        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User already exists with this mobile number" })
            };
        }
        const newUser = {
            name,
            mobile,
            password,
            aadharNumber,
            age,
            pincode,
            isAdmin: false,
            vaccinationStatus: UserModel_1.VaccinationStatus.None,
            bookedSlot: null,
            doseHistory: [],
        };
        await db.insertOne(newUser);
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User Registered Successfully" })
        };
    }
    catch (error) {
        console.log("Error in Register Process:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Internal Server Error", error })
        };
    }
};
exports.registerUser = registerUser;
const loginUser = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { mobile, password } = body;
        if (!mobile || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "All fields Required for login" })
            };
        }
        const db = await (0, MongoClient_1.dbConnect)();
        const existingUser = await db.findOne({ mobile });
        if (!existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User Not found with this mobile number" })
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                _id: existingUser?._id,
                name: existingUser?.name,
                mobile: existingUser?.mobile,
                isAdmin: existingUser?.isAdmin || false,
            })
        };
    }
    catch (error) {
        console.log("Error in LoginUser", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Internal Server Error", error })
        };
    }
};
exports.loginUser = loginUser;
const getProfile = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { mobile } = body;
        if (!mobile || mobile.length > 10) {
            console.log("Invalid Mobile Number");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid Mobile Number" })
            };
        }
        const db = await (0, MongoClient_1.dbConnect)();
        const userProfile = await db.findOne({ mobile });
        if (!userProfile) {
            console.log("User not exists in db");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User not found with this mobile number" })
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                _id: userProfile?._id,
                name: userProfile?.name,
                mobile: userProfile?.mobile,
            })
        };
    }
    catch (error) {
        console.log("Error in profile api", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Something went wrong", error })
        };
    }
};
exports.getProfile = getProfile;
const bookSlot = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { slotId } = body;
        if (!slotId) {
            console.log("SLot Id is not valid");
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "SLot Id is not valid"
                })
            };
        }
        const db = await (0, MongoClient_1.slotdbConnect)();
        console.log("SlotId", slotId);
        const objectId = new mongodb_1.ObjectId(slotId);
        console.log("ObjectId", objectId);
        const checkSLotId = await db?.findOne({ _id: objectId });
        console.log("checkSLotId", checkSLotId);
        if (!checkSLotId) {
            console.log("Slot id is not present in db");
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "slot id not exist in db"
                })
            };
        }
        await db?.updateOne({
            _id: objectId
        }, {
            $inc: {
                "availableCapacity": -1
            }
        });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Slot booked" }),
        };
    }
    catch (error) {
        console.log("Error in bookSlot api", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Something went wrong", error })
        };
    }
};
exports.bookSlot = bookSlot;
