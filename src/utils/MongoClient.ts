import { MongoClient } from "mongodb";
const client=new MongoClient("mongodb+srv://jaganpatra_db_user:Patra123@cluster0.twvcjqe.mongodb.net/?appName=Cluster0");
export const dbConnect=async()=>{
    try {
        await client.connect();
        const myDB=client.db("VaccineDatabase");
        const vaccineData=myDB.collection("VaccinePortal");
        console.log("DB Connected Successfully");
        return vaccineData;
    } catch (error) {
        console.log("Error in DB Connection",error);
    }
}
export const slotdbConnect=async()=>{
    try {
        await client.connect();
        const myDB=client.db("VaccineDatabase");
        const slotData=myDB.collection("slots");
        console.log("DB Connected Successfully");
        return slotData;
    } catch (error) {
        console.log("Error in DB Connection",error);
    }
}