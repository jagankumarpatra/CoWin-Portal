import { Search } from "../models/searchModel";
import { slotdbConnect, dbConnect } from "../utils/MongoClient";
export const addSlot = async (event: any) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { date, time, availableCapacity } = body;
        if (!date || !time || !availableCapacity) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Some fields are missing"
                })
            }
        }
        const db = await slotdbConnect();
        const slot = await db?.insertOne({ date, time, availableCapacity });
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Slot added successfully", slot
            })
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        }
    }
}

export const getSlots = async (event: any) => {
    try {
        const db = await slotdbConnect();
        const slotData = await db?.find().toArray();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All slots found", slotData
            })
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        }
    }
}

export const getAllBookings = async (event: any) => {
    try {
        const db = await dbConnect();
        const bookingsData = await db?.find({ bookedSlot: { $ne: null } }).toArray();
        console.log(bookingsData);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All bookings found", bookingsData
            })
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        }
    }
}

export const getFilteredData = async (event: any) => {
    try {
        const age = Number(event.queryStringParameters?.age);
        const pincode = Number(event.queryStringParameters?.pincode);
        const vaccinationStatus = event.queryStringParameters?.vaccinationStatus;
        const db = await dbConnect();
        let query: Search = {};
        if(age){
            query.age=age;
        }
        if(pincode){
            query.pincode=pincode;
        }
        if(vaccinationStatus){
            query.vaccinationStatus =vaccinationStatus;
        }

        const data = await db?.find(query).toArray();
        console.log(data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All filtered data found", data
            })
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong", error
            })
        }
    }
}