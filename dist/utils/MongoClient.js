"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotdbConnect = exports.dbConnect = void 0;
const mongodb_1 = require("mongodb");
const client = new mongodb_1.MongoClient("mongodb+srv://jaganpatra_db_user:Patra123@cluster0.twvcjqe.mongodb.net/?appName=Cluster0");
const dbConnect = async () => {
    try {
        await client.connect();
        const myDB = client.db("VaccineDatabase");
        const vaccineData = myDB.collection("VaccinePortal");
        console.log("DB Connected Successfully");
        return vaccineData;
    }
    catch (error) {
        console.log("Error in DB Connection", error);
    }
};
exports.dbConnect = dbConnect;
const slotdbConnect = async () => {
    try {
        await client.connect();
        const myDB = client.db("VaccineDatabase");
        const slotData = myDB.collection("slots");
        console.log("DB Connected Successfully");
        return slotData;
    }
    catch (error) {
        console.log("Error in DB Connection", error);
    }
};
exports.slotdbConnect = slotdbConnect;
