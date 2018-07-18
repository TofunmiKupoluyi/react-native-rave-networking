import RavePayment from "../Core/RavePaymentBase"
import RaveApi from "../RaveApi"

export default class Card extends RavePayment {
    constructor(publicKey, secretKey, production = false) {
        super(publicKey, secretKey, production);
    }


    // Core payment methods
    charge(payload, fullResponse = false) {
        let endpoint = this.baseUrl + this.endpointMap["card"]["charge"];
        if (!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();

        return super.charge(payload, endpoint, fullResponse);
    }

    preauth(payload, fullResponse = false) {
        let endpoint = this.baseUrl + this.endpointMap["card"]["charge"];

        // adding boilerplate charge_type for preauth
        payload["charge_type"] = "preauth"

        // if transaction is not defined or not set properly
        if (!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();

        return super.charge(payload, endpoint, fullResponse);
    }

    validate(otp, flwRef, fullResponse = false) {
        let endpoint = this.baseUrl + this.endpointMap["card"]["validate"];
        return super.validate(otp, flwRef, endpoint, fullResponse);
    }

    // Implementing abstract handleCharge function
    handleCharge(responseJson, txRef) {
        // this is what the function returns if it is not returning full response
        let data = {
            status: null,
            authSuggested: null,
            authModelUsed: null,
            validationComplete: null,
            flwRef: null,
            txRef
        }

        // If the response is just an auth suggestion
        if ("message" in responseJson && responseJson["message"] == "AUTH_SUGGESTION") {
            data.status = responseJson["message"];
            data.authSuggested = responseJson["data"]["suggested_auth"];
            data.validationComplete = false
        }

        // if the response contains data
        else if ("data" in responseJson) {
            data.status = responseJson["data"]["status"];
            data.authModelUsed = responseJson["data"]["authModelUsed"];
            data.flwRef = responseJson["data"]["flwRef"];
            data.validationComplete = (responseJson["data"]["chargeResponseCode"] === "00") ? true : false;
            data.authUrl = responseJson["data"]["authurl"];  
        }
        
        return data;

    }

}