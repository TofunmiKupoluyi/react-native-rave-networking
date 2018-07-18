import forge from 'node-forge'
import utf8 from 'utf8'
import md5 from 'md5'

export default class RaveCore{
    constructor(publicKey, secretKey, production=false){
        // Data members

        
        var baseUrlMap = ["https://ravesandboxapi.flutterwave.com/", "https://api.ravepay.co/"]
        this.baseUrl = (production) ? baseUrlMap[1] : baseUrlMap[0];

        this.endpointMap = {
            card: {
                "charge": "flwv3-pug/getpaidx/api/charge",
                "validate": "flwv3-pug/getpaidx/api/validatecharge",
            },
            account: {
                "charge": "flwv3-pug/getpaidx/api/charge",
                "validate": "flwv3-pug/getpaidx/api/validate",
            },
            verify: "flwv3-pug/getpaidx/api/v2/verify",
        }
        
        // To keep public and secret keys private
        this.getPublicKey = function(){
            return publicKey;
        }
        this.getSecretKey = function(){
            return secretKey;
        }

        
    }
    
    // this is the getKey function that generates an encryption Key for you by passing your Secret Key as a parameter.
    getKey(){
        var keymd5 = md5(this.getSecretKey());
        var keymd5last12 = keymd5.substr(-12);

        var seckeyadjusted = this.getSecretKey().replace('FLWSECK-', '');
        var seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

        return seckeyadjustedfirst12 + keymd5last12;
    }

    // This is the encryption function that encrypts your payload by passing the stringified format and your encryption Key.
    encrypt(text){
        key = this.getKey();
        var cipher   = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
        cipher.start({iv:''});
        cipher.update(forge.util.createBuffer(text, 'utf-8'));
        cipher.finish();
        var encrypted = cipher.output;
        return ( forge.util.encode64(encrypted.getBytes()) );
    }
}


