import RavePayment from "../Core/RavePaymentBase"
import RaveApi from "../RaveApi"

export default class Account extends RavePayment {
    constructor(publicKey, secretKey, production = false) {
        super(publicKey, secretKey, production);
    }

    charge(payload) {
        let endpoint = this.baseUrl + this.endpointMap["account"]["charge"];

        // adding boilerplate parameters
        payload["payment_type"] = "account"

        // check if a transaction reference is present first, if not generate a reference
        if (!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();

        return super.charge(payload, endpoint);

    }

    validate(otp, flwRef) {
        let endpoint = this.baseUrl + this.endpointMap["account"]["validate"];
        return super.validate(otp, flwRef, endpoint);
    }

    handleCharge(responseJson, txRef) {
        // if authurl is something other than NO-URL, return authSuggested with the auth url
        if ("data" in responseJson && "authurl" in responseJson["data"] && responseJson["data"]["authurl"] !== "NO-URL")
            return {
                status: responseJson["data"]["status"],
                authUrl: responseJson["data"]["authurl"],
                validationComplete: false,
                flwRef: responseJson["data"]["flwRef"],
                txRef
            }

        // if no validation is required, return validationComplete to be true
        else if ("data" in responseJson && responseJson["data"]["chargeResponseCode"] == "00")
            return {
                status: responseJson["data"]["status"],
                validationComplete: true,
                flwRef: responseJson["data"]["flwRef"],
                txRef
            }

        else
            return {
                status: responseJson["data"]["status"],
                validationComplete: false,
                flwRef: responseJson["data"]["flwRef"],
                txRef
            }

    }


}