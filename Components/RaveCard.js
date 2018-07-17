import RavePayment from "../Core/RavePaymentBase"
import RaveApi from "../RaveApi"

export default class Card extends RavePayment {
    constructor(publicKey, secretKey, production = false) {
        super(publicKey, secretKey, production);
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
        // If the response is just an auth suggestion
        if ("message" in responseJson && responseJson["message"] == "AUTH_SUGGESTION") {
            return {
                status: responseJson["message"],
                authSuggested: responseJson["data"]["suggested_auth"],
                validationComplete: false,
                flwRef: null,
                txRef
            }
        }

        // if the request does not require further validation
        else if ("data" in responseJson && responseJson["data"]["chargeResponseCode"] == "00")
            return {
                status: responseJson["data"]["status"],
                authModelUsed: responseJson["data"]["authModelUsed"],
                validationComplete: true,
                flwRef: responseJson["data"]["flwRef"],
                txRef
            }

        // if the request requires further validation
        else
            return {
                status: responseJson["data"]["status"],
                authModelUsed: responseJson["data"]["authModelUsed"],
                validationComplete: false,
                authUrl: responseJson["data"]["authurl"],
                flwRef: responseJson["data"]["flwRef"],
                txRef
            }

    }

}