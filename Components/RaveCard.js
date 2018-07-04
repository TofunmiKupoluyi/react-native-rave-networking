import RavePayment from "../Core/RavePaymentBase"
import RaveApi from "../RaveApi"
export default class Card extends RavePayment{
    constructor(publicKey, secretKey, production=false){
        super(publicKey, secretKey, production);
    }

    charge(payload){
        let endpoint = this.baseUrl + this.endpointMap["card"]["charge"];
        if(!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();

        return super.charge(payload, endpoint);
    }

    preauth(payload){
        let endpoint = this.baseUrl + this.endpointMap["card"]["charge"];
        // if transaction is not defined or not set properly
        if(!("txRef" in payload))
            payload["txRef"] = RaveApi.generateTransactionReference();
        
        // adds charge_type if it is not defined or not set correctly
        if(!("charge_type" in payload) || payload["charge_type"] !== "preauth")
            payload["charge_type"] = "preauth"

        return super.charge(payload, endpoint);
    }

    validate(otp, flwRef){
        let endpoint = this.baseUrl + this.endpointMap["card"]["validate"];
        return super.validate(otp, flwRef, endpoint);
    }

    handleCharge(responseJson, txRef){
        if("message" in responseJson && responseJson["message"]=="AUTH_SUGGESTION")
            return {status: responseJson["status"], authSuggested: responseJson["data"]["suggested_auth"], validationComplete: false, flwRef: null, txRef}

        else if("data" in responseJson && responseJson["data"]["chargeResponseCode"] == "00")
            return {status: responseJson["status"], authSuggested: null, validationComplete: true, flwRef: responseJson["data"]["flwRef"], txRef}
        
        else
            return {status: responseJson["status"], authSuggested: null, validationComplete: false, flwRef: responseJson["data"]["flwRef"], txRef}
    }

    handleValidate(responseJson, resolve, reject){
        if("data" in responseJson && responseJson["data"]["tx"]["chargeResponseCode"] == "00"){
            resolve({status: responseJson["status"], validationComplete:true, flwRef: responseJson["data"]["tx"]["flwRef"], txRef: responseJson["data"]["tx"]["txRef"]})
        }
        else{
            reject({status: responseJson["status"], validationComplete:false, flwRef: responseJson["data"]["tx"]["flwRef"], txRef: responseJson["data"]["tx"]["txRef"]});
        }
    }

}