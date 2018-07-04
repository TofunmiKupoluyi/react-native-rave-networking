# RaveNetworking for React-Native

## Sample Card Transaction

```
import RaveApi from './RaveNetworking/RaveApi'

rave = new RaveApi("ENTER_YOUR_PUBLIC_KEY", "ENTER_YOUR_PRIVATE_KEY", production= True|False);

rave.Account.charge({
      "accountbank": "232",
      "accountnumber": "0061333471",
      "currency": "NGN",
      "country": "NG",
      "amount": "100",
      "email": "test@test.com",
      "phonenumber": "0902620185",
      "IP": "355426087298442",
    })
      .then((res)=>{
        console.log(res);
        this.rave.Account.validate("12345", res.flwRef)
          .then((res)=>{
            console.log(res);
          })
          .catch((err)=>{
            console.error(err);
          })
      })
      .catch((err)=>{
        console.error(err);
      })

```
## Sample Account Transaction
```
import RaveApi from './RaveNetworking/RaveApi'

rave = new RaveApi("ENTER_YOUR_PUBLIC_KEY", "ENTER_YOUR_PRIVATE_KEY", production= True|False);
rave.Card.charge({
    "cardno": "5438898014560229",
    "cvv": "890",
    "expirymonth": "09",
    "expiryyear": "19",
    "amount": "10",
    "email": "user@gmail.com",
    "phonenumber": "0902620185",
    "firstname": "temi",
    "lastname": "desola",
    "IP": "355426087298442"
    })
      .then((res)=>{
        console.log(res);
        this.rave.Account.validate("12345", res.flwRef)
          .then((res)=>{
            console.log(res);
          })
          .catch((err)=>{
            console.error(err);
          })
      })
      .catch((err)=>{
        console.error(err);
      })

```