import Card from "./Components/RaveCard"
import Account from "./Components/RaveAccount"

export default class RaveApi{
    constructor(publicKey, secretKey, production=false){
        this.Card = new Card(publicKey, secretKey, production);
        this.Account = new Account(publicKey, secretKey, production);
    }

    static generateTransactionReference(merchantCode="MC"){
        let timestamp = new Date().getTime();
        return merchantCode+"-"+timestamp.toString();
    }

}

