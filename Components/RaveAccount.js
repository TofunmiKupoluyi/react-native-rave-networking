import RavePayment from "../Core/RavePaymentBase"
import RaveApi from "../RaveApi"

export default class Account extends RavePayment {
    constructor(publicKey, secretKey, production = false) {
        super(publicKey, secretKey, production);
    }

    charge(payload, fullResponse = false) {
        let endpoint = this.baseUrl + this.endpointMap["account"]["charge"];

        // adding boilerplate parameters
        payload["payment_type"] = "account"

        // check if a transaction reference is present first, if not generate a reference
        if (!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();

        return super.charge(payload, endpoint, fullResponse);

    }

    validate(otp, flwRef, fullResponse = false) {
        let endpoint = this.baseUrl + this.endpointMap["account"]["validate"];
        return super.validate(otp, flwRef, endpoint, fullResponse);
    }

    // Implementing abstract handleCharge method
    handleCharge(responseJson, txRef) {
        // This is what is returned from the function
        let data = {
            status: null,
            authUrl: null,
            validationComplete: null,
            flwRef: null,
            txRef
        }

        if ("data" in responseJson) {
            data.status = responseJson["data"]["status"];
            data.flwRef = responseJson["data"]["flwRef"];
            data.validationComplete = (responseJson["data"]["chargeResponseCode"] === "00") ? true : false;
            data.authUrl = (responseJson["data"]["authurl"] !== "NO-URL") ? responseJson["data"]["authurl"] : null;
        }

        return data;

    }


}