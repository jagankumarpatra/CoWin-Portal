import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ResponseFormat } from "../utils/responseFormat";

export const verifier=CognitoJwtVerifier.create({
    userPoolId: "us-east-1_HRKw865aZ",
    tokenUse: "access",
    clientId: "gjbn4hji9mkgdc7ofag0n1el5",
})

export const  tokenValidation=async(event:any)=>{
    const token = event.headers.Authorization?.split(" ")[1];
        console.log("Token in profile api", token);
        if (!token) {
            return ResponseFormat(401, "Unauthorized: No token provided");
        }
         const payload = await verifier.verify(token);
        console.log("Payload in profile api", payload);
        if (!payload) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        return payload.sub;
       
}