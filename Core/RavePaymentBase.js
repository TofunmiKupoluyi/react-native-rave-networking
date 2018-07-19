import RaveCore from "./RaveCore";

// This is an abstract class

export default class RavePayment extends RaveCore {
    constructor(publicKey, secretKey, production = false) {
        super(publicKey, secretKey, production);
    }

    // Helper methods 

    encryptCharge(payload, errResponse, reject) {
        // Attempting to encrypt payload
        try {
            let encryptedPayload = this.encrypt(JSON.stringify(payload));
            return encryptedPayload;
        }
        // if it fails add message to errResponse and call the reject passed down
        catch (e) {
            errResponse.message = "Please pass accurate public and secret keys";
            reject(errResponse);
        }
    }

    // Payment methods

    charge(payload, endpoint, fullResponse) {
        return new Promise(async (resolve, reject) => {
            // What is returned on promise rejection that occured before a json was derived
            let errResponse = {
                status: "error",
                message: null,
                data: null
            }
            var encryptedPayload = this.encryptCharge(payload, errResponse, reject);
            // Attempting to charge
            try {
                // Charging
                let response = await fetch(endpoint, {
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
                });

                // getting json
                let responseJson = await response.json();

                // if response returns 2xx response code
                if (response.ok) {
                    // If the user opts for full response
                    if (fullResponse)
                        resolve(responseJson);
                    else
                        resolve(this.handleCharge(responseJson, payload["txRef"])); // handleResponses must be defined in implementing classes
                }

                // else we reject with the json body
                else {
                    // In this case instead of passing our custom errResponse, determined better to just send the responseJson gotten to avoid duplication
                    reject(responseJson);
                }

            } catch (e) {
                errResponse.message = e.toString();
                reject(errResponse);
            }

        });

    }

    validate(otp, flwRef, endpoint, fullResponse = false) {
        return new Promise(async (resolve, reject) => {
            // What is returned on promise rejection that does not go to handleValidate
            let errResponse = {
                status: "error",
                message: null,
                data: null,
                flwRef
            }

            // Attempting to validate
            try {
                let response = await fetch(endpoint, {
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
                });

                // generating json
                let responseJson = await response.json();

                // if response returns 2xx response code, pass to handleValidate
                if (response.ok) {
                    this.handleValidate(responseJson, flwRef, fullResponse, resolve, reject); // Because validate response differs with payment type, we will allow validate resolve and reject. 
                }

                // else we reject with the json body
                else
                    reject(responseJson);

            } catch (e) {
                errResponse.message = e.toString();
                reject(errResponse);
            }

        });

    }


    verify(txRef, fullResponse) {
        return new Promise(async (resolve, reject) => {
            let endpoint = this.baseUrl + this.endpointMap["verify"];
            let errResponse = {
                status: "error",
                message: null,
                data: null,
                txRef
            }

            try {
                let response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "SECKEY": this.getSecretKey(),
                        "txref": txRef
                    })
                });

                let responseJson = await response.json();

                if (response.ok) {
                    this.handleVerify(responseJson, txRef, resolve, reject)
                } else {
                    reject(responseJson);
                }
            } catch (e) {
                errResponse.message = e.toString();
                reject(errResponse)
            }
        });
    }


    // Handlers

    handleCharge(responseJson, txRef) {
        throw new Error('handleCharge is an abstract method. Please implement the function in the calling class.');
    }

    handleValidate(responseJson, flwRef, fullResponse, resolve, reject) {
        // This is what is returned if successful
        data = {
            status: null,
            flwRef,
            txRef: null
        }


        if ("data" in responseJson) {
            // setting txRef and status (card transaction body is stored in tx)
            data.txRef = responseJson["data"]["txRef"] || responseJson["data"]["tx"]["txRef"]
            data.status = responseJson["data"]["status"] || responseJson["data"]["tx"]["status"]

            // checks if data.chargeResponseCode is 00, or if the chargeResponseCode is in responseJson.data.tx (card) and if that one is 00
            if (responseJson["data"]["chargeResponseCode"] == "00" || ("chargeResponseCode" in responseJson["data"]["tx"] && responseJson["data"]["tx"]["chargeResponseCode"] == "00")) {
                // sets status to success
                data.status = "success";
                data = (fullResponse) ? responseJson : data;
                resolve(data)
            } else {
                reject(responseJson);
            }
        }
        // if data is not in responseJSon or none of the cases were caught, reject with responseJson
        reject(responseJson);

    }

    handleVerify(responseJson, txRef, resolve, reject) {
        // If charge response is successfully completed, resolve with the response, otherwise, reject
        if ("data" in responseJson && responseJson["data"]["chargecode"] == "00")   
            resolve(responseJson);
        else 
            reject(responseJson);

    }

}