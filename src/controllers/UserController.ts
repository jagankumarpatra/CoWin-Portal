import { ObjectId } from "mongodb";
import { UserModel, VaccinationStatus } from "../models/UserModel";
import { dbConnect, slotdbConnect } from "../utils/MongoClient";

export const init = async () => {
    const db = await dbConnect();
    if (db) {
        console.log("Db collection Connected from UserController");
    }
}
init();
export const registerUser = async (event: any) => {
    try {
        console.log("User is registered");
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { name, mobile, password, aadharNumber, age, pincode, } = body;
        if (!name || !mobile || !password || !aadharNumber || !age || !pincode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "All fields Required" })
            }
        }
        const db = await dbConnect();
        const existingUser = await db!.findOne({ mobile });
        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User already exists with this mobile number" })
            }
        }

        const newUser: UserModel = {
            name,
            mobile,
            password,
            aadharNumber,
            age,
            pincode,
            isAdmin: false,
            vaccinationStatus: VaccinationStatus.None,
            bookedSlot: null,
            doseHistory: [],
        };
        await db!.insertOne(newUser);


        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User Registered Successfully" })
        }

    } catch (error) {
        console.log("Error in Register Process:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Internal Server Error", error })
        }
    }
}
export const loginUser = async (event: any) => {
    try {
        const body = JSON.parse(event.body);
        const { mobile, password } = body;
        if (!mobile || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "All fields Required for login" })
            }
        }
        const db = await dbConnect();
        const existingUser = await db!.findOne({ mobile });
        if (!existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User Not found with this mobile number" })
            }
        }


        return {
            statusCode: 200,
            body: JSON.stringify({
                _id: existingUser?._id,
                name: existingUser?.name,
                mobile: existingUser?.mobile,
                isAdmin: existingUser?.isAdmin || false,

            })
        }
    } catch (error) {
        console.log("Error in LoginUser", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Internal Server Error", error })
        }
    }
}
export const getProfile = async (event: any) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { mobile } = body;
        if (!mobile || mobile.length > 10) {
            console.log("Invalid Mobile Number");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid Mobile Number" })
            }
        }
        const db = await dbConnect();
        const userProfile = await db!.findOne({ mobile });
        if (!userProfile) {
            console.log("User not exists in db");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User not found with this mobile number" })
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                _id: userProfile?._id,
                name: userProfile?.name,
                mobile: userProfile?.mobile,
            })
        }
    } catch (error) {
        console.log("Error in profile api", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Something went wrong", error })
        }
    }
}

export const bookSlot = async (event: any) => {
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
            }
        }
        const db = await slotdbConnect();
           console.log("SlotId", slotId);
        const objectId=new ObjectId(slotId);
        console.log("ObjectId", objectId);
        const checkSLotId =await  db?.findOne({ _id:objectId });
         console.log("checkSLotId", checkSLotId);
        if (!checkSLotId) {
            console.log("Slot id is not present in db");
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "slot id not exist in db"
                })
            }
        }
        await db?.updateOne({
            _id: objectId
        },
            {
                $inc: {
                    "availableCapacity": -1
                }
            })

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Slot booked" }),
        };

    } catch (error) {
        console.log("Error in bookSlot api", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Something went wrong", error })
        }
    }
}