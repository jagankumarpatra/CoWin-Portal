"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTokenPresent = exports.verifier = void 0;
const aws_jwt_verify_1 = require("aws-jwt-verify");
const responseFormat_1 = require("../utils/responseFormat");
exports.verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: "us-east-1_HRKw865aZ",
    tokenUse: "access",
    clientId: "gjbn4hji9mkgdc7ofag0n1el5",
});
const checkTokenPresent = async (event) => {
    const token = event.headers.Authorization?.split(" ")[1];
    console.log("Token in profile api", token);
    if (!token) {
        return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: No token provided");
    }
    const payload = await exports.verifier.verify(token);
    console.log("Payload in profile api", payload);
    if (!payload) {
        return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
    }
    return payload.sub;
};
exports.checkTokenPresent = checkTokenPresent;
