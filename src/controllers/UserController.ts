import { UserModel } from "../models/UserModel";
import { dbConnect } from "../utils/MongoClient";

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
        const { name, mobile, password, aadharNumber, age, pincode } = body;
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
            pincode
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

