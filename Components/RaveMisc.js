var endpointMap = {
    "bankList": "https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/flwpbf-banks.js?json=1"
}

export function getBankList() {
    return new Promise(async (resolve, reject) => {
        endpoint = endpointMap["bankList"]
        try {
            let response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            let responseJson = await response.json();
            if (response.ok)
                resolve(responseJson);
            else
                reject({
                    "status": "error",
                    "message": "Retrieving bank list failed",
                    "data": responseJson
                });

        } catch (e) {
            reject({
                "status": "error",
                "message": "Retrieving bank list failed",
                "data": null
            });
        }

    })

}

export async function findBankCode(bankName) {

    try {
        bankList = await getBankList();
        
        let pos = bankList.map(function (x) {
            return x.bankname;
        }).indexOf(bankName);

        return bankList[pos].bankcode;
    } catch (e) {
        return null;
    }


}