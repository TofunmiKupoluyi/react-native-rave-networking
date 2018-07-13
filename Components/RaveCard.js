import RavePayment from "../Core/RavePaymentBase"
import RaveApi from "../RaveApi"

export default class Card extends RavePayment {
    constructor(publicKey, secretKey, production = false) {
        super(publicKey, secretKey, production);
    }

    // Helper methods
    manageSuggestedAuthResponses(suggestedAuth) {
        let authModels = { "AVS_VBVSECURECODE": "avs", "PIN": "pin", "NOAUTH_INTERNATIONAL": false } 
        return authModels[suggestedAuth]; // If authModel is not present it returns, null 
    }
    

    // Core payment methods
    charge(payload) {
        let endpoint = this.baseUrl + this.endpointMap["card"]["charge"];
        if (!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();

        return super.charge(payload, endpoint);
    }

    preauth(payload) {
        let endpoint = this.baseUrl + this.endpointMap["card"]["charge"];
        // adding boilerplate charge_type for preauth
        payload["charge_type"] = "preauth"
        // if transaction is not defined or not set properly
        if (!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();
            
        return super.charge(payload, endpoint);
    }

    validate(otp, flwRef) {
        let endpoint = this.baseUrl + this.endpointMap["card"]["validate"];
        return super.validate(otp, flwRef, endpoint);
    }

    handleCharge(responseJson, txRef) {
        if ("message" in responseJson && responseJson["message"] == "AUTH_SUGGESTION") {
            let authSuggested = this.anageSuggestedAuthResponses(responseJson["data"]["suggested_auth"]);
            // we have to check if authSuggested matches type of bool and is false because we are just checking mainly if it is NOAUTH_INTERNATIONAL
            let validationComplete = ( authSuggested === false ) ? true : false; 

            return { status: responseJson["message"], authSuggested, validationComplete, flwRef: null, txRef }
        }

        else if ("data" in responseJson && responseJson["data"]["chargeResponseCode"] == "00")
            return { status: responseJson["data"]["status"], authSuggested: null, validationComplete: true, flwRef: responseJson["data"]["flwRef"], txRef }

        else
            return { status: responseJson["data"]["status"], authSuggested: null, validationComplete: false, authUrl: responseJson["data"]["authurl"], flwRef: responseJson["data"]["flwRef"], txRef }
        
    }

}