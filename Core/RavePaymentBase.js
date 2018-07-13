import RaveCore from "./RaveCore";

// This is an abstract class

export default class RavePayment extends RaveCore{
    constructor(publicKey, secretKey, production=false){
        super(publicKey, secretKey, production);
    }

    charge(payload, endpoint){
        return new Promise(async (resolve, reject)=>{
            // If encryption fails
            try{
                var encryptedPayload = this.encrypt(JSON.stringify(payload));
            }
            catch(e){
                reject({status: "error", message: "Please pass accurate public and secret keys", data: null});
            }

            // In case the fetch call fails
            try{

                var response = await fetch(endpoint, 
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "PBFPubKey": this.getPublicKey(),
                            "client": encryptedPayload,
                            "alg": "3DES-24"
                        })
                    }    
                );
            
                // if response returns 2xx response code, pass to handleResponses
                if(response.ok){
                    let responseJson = await response.json();
                    resolve(this.handleCharge(responseJson, payload["txRef"])); // handleResponses must be defined in implementing classes
                }

                // else we reject with, "could not complete charge request"
                else{
                    let responseJson = await response.json();
                    reject(responseJson);
                }

            }

            catch(e){
                reject({status: "error", message: e.toString(), data: null});
            }

        })
        
    }

    validate(otp, flwRef, endpoint){
        return new Promise(async (resolve, reject)=>{

            // In case the fetch call fails
            try{
                var response = await fetch(endpoint, 
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "PBFPubKey": this.getPublicKey(),
                            "transactionreference": flwRef, 
                            "transaction_reference": flwRef,
                            "otp": otp
                        })
                    }    
                );
            
                // if response returns 2xx response code, pass to handleResponses
                if(response.ok){
                    let responseJson = await response.json();
                    this.handleValidate(responseJson, resolve, reject); // Because validate response differs with payment type, we will allow validate resolve and reject. 
                }

                // else we reject with, "could not complete charge request"
                else{
                    let responseJson = await response.json();
                    reject({...responseJson, flwRef});
                }

            }

            catch(e){
                reject({status: "error", message: e.toString(), flwRef});
            }
            
        })

    }

    handleValidate(responseJson, resolve, reject){
        // This varies between card and other charge types
        let flwRef = responseJson["data"]["flwRef"] || responseJson["data"]["tx"]["flwRef"]
        let txRef = responseJson["data"]["flwRef"] || responseJson["data"]["tx"]["txRef"]
        console.log(responseJson)
        if ("data" in responseJson && responseJson["data"]["chargeResponseCode"] == "00")
            resolve({ status: responseJson["status"], validationComplete: true, flwRef, txRef })
        else
            reject({ status: responseJson["status"], validationComplete: false, flwRef, txRef });
    }

}