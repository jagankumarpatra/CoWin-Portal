"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookSlot = exports.getProfile = exports.loginUser = exports.registerUser = exports.init = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodb_1 = require("mongodb");
const UserModel_1 = require("../models/UserModel");
const MongoClient_1 = require("../dbConnection/MongoClient");
const UserSchemaValidator_1 = require("../validator/UserSchemaValidator");
const responseFormat_1 = require("../utils/responseFormat");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const auth_1 = require("../middleware/auth");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: "us-east-1" });
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
        const db = await (0, MongoClient_1.dbConnect)();
        console.log("User is registered");
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { name, mobile, password, aadharNumber, age, pincode, } = body;
        const mobileNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
        const existingUser = await db.findOne({ mobile });
        if (existingUser) {
            return (0, responseFormat_1.ResponseFormat)(400, "User already exists with this mobile number");
        }
        const command = new client_cognito_identity_provider_1.SignUpCommand({
            ClientId: process.env.CLIENT_ID,
            Username: mobileNumber,
            Password: password,
            UserAttributes: [
                { Name: "name", Value: name },
                { Name: "phone_number", Value: mobileNumber },
            ],
        });
        await client.send(command);
        await client.send(new client_cognito_identity_provider_1.AdminConfirmSignUpCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: mobileNumber
        }));
        const authCommand = new client_cognito_identity_provider_1.AdminInitiateAuthCommand({
            UserPoolId: process.env.USER_POOL_ID,
            ClientId: process.env.CLIENT_ID,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: mobileNumber,
                PASSWORD: password,
            },
        });
        const response = await client.send(authCommand);
        const accessToken = response.AuthenticationResult?.AccessToken;
        const payload = await auth_1.verifier.verify(accessToken);
        const subid = payload.sub;
        console.log("Sub ID from token payload:", subid);
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
            subId: subid
        };
        const validateResult = UserSchemaValidator_1.registerValidator.validate(newUser);
        if (validateResult.error) {
            console.error('Validation error:', validateResult.error.message);
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateResult.error.message);
        }
        console.log('Valid data:', validateResult.value);
        await db.insertOne(newUser);
        return (0, responseFormat_1.ResponseFormat)(201, "User Registered Successfully");
    }
    catch (error) {
        console.log("Error in Register Process:", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.registerUser = registerUser;
const loginUser = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { mobile, password } = body;
        const mobileNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
        const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.CLIENT_ID,
            AuthParameters: {
                USERNAME: mobileNumber,
                PASSWORD: password,
            },
        });
        const response = await client.send(command);
        const accessToken = response.AuthenticationResult?.AccessToken;
        const db = await (0, MongoClient_1.dbConnect)();
        console.log(mobile, password);
        const validateCred = UserSchemaValidator_1.loginValidator.validate(body);
        console.log(validateCred);
        if (validateCred.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateCred.error.message);
        }
        else {
            const existingUser = await db.findOne({ mobile });
            if (!existingUser) {
                return (0, responseFormat_1.ResponseFormat)(400, "User Not found with this mobile number");
            }
            return (0, responseFormat_1.ResponseFormat)(200, "User Information", {
                accessToken: accessToken,
                _id: existingUser?._id,
                name: existingUser?.name,
                mobile: existingUser?.mobile,
                isAdmin: existingUser?.isAdmin || false,
            });
        }
    }
    catch (error) {
        console.log("Error in LoginUser", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.loginUser = loginUser;
const getProfile = async (event) => {
    try {
        // const token = event.headers.Authorization?.split(" ")[1];
        // console.log("Token in profile api", token);
        // if (!token) {
        //     return ResponseFormat(401, "Unauthorized: No token provided");
        // }
        const subid = await (0, auth_1.checkTokenPresent)(event);
        console.log("Sub ID from token payload:", subid);
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { mobile } = body;
        const db = await (0, MongoClient_1.dbConnect)();
        // const payload = await verifier.verify(token);
        // console.log("Payload in profile api", payload);
        // if (!payload) {
        //     return ResponseFormat(401, "Unauthorized: Invalid token");
        // }
        // const subid = payload.sub;
        const userSub = await db.findOne({ mobile });
        console.log("User sub from token payload:", userSub?.subId);
        const validateProfile = UserSchemaValidator_1.profileValidator.validate(body);
        console.log(validateProfile);
        if (validateProfile.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateProfile.error.message);
        }
        const userProfile = await db.findOne({ mobile });
        if (!userProfile) {
            console.log("User not exists in db");
            return (0, responseFormat_1.ResponseFormat)(400, "User not found with this mobile number");
        }
        if (subid !== userSub?.subId) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token for this user");
        }
        return (0, responseFormat_1.ResponseFormat)(200, "Profile Information", {
            _id: userProfile?._id,
            name: userProfile?.name,
            mobile: userProfile?.mobile,
        });
    }
    catch (error) {
        console.log("Error in profile api", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.getProfile = getProfile;
const bookSlot = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { slotId } = body;
        const db = await (0, MongoClient_1.slotdbConnect)();
        console.log("SlotId", slotId);
        const objectId = new mongodb_1.ObjectId(slotId);
        console.log("ObjectId", objectId);
        const validateSlotId = UserSchemaValidator_1.slotValidator.validate(body);
        if (validateSlotId.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateSlotId.error.message);
        }
        const checkSLotId = await db?.findOne({ _id: objectId });
        console.log("checkSLotId", checkSLotId);
        if (!checkSLotId) {
            console.log("Slot id is not present in db");
            return (0, responseFormat_1.ResponseFormat)(400, "slot id not exist in db");
        }
        await db?.updateOne({
            _id: objectId
        }, {
            $inc: {
                "availableCapacity": -1
            }
        });
        return (0, responseFormat_1.ResponseFormat)(200, "Slot Booked");
    }
    catch (error) {
        console.log("Error in bookSlot api", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.bookSlot = bookSlot;
