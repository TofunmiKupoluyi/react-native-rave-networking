# Rave API calls for React-Native

## Sample Account Transaction

```
import RaveApi from 'react-native-rave-networking';

rave = new RaveApi("ENTER_YOUR_PUBLIC_KEY", "ENTER_YOUR_PRIVATE_KEY", production= true|false);

async accountCharge() {
  // remember to pass passcode for zenith bank
  try {
    let payload = {
      "accountbank": "232", // get the bank code from the bank list endpoint.
      "accountnumber": "0061333471",
      "currency": "NGN",
      "country": "NG",
      "amount": "100",
      "email": "test@test.com",
      "phonenumber": "0902620185",
    }

    let res = await this.rave.Account.charge(payload)
      
    if (res.authUrl) {
      this.setState({
        "displayModal": true,
        "url": res.authUrl
      });
    } 
        // if it is not
    else {
      res = await this.rave.Account.validate("12345", res.flwRef)
      console.log(res)
    }  
  }
  catch (e) {
    console.error(e);
  }
  
}

```
## Sample Card Transaction
```
import RaveApi from 'react-native-rave-networking';

async cardCharge() {
  try {
    payload = {
      "cardno": "4556052704172643",
      "cvv": "812",
      "expirymonth": "01",
      "expiryyear": "19",
      "currency": "NGN",
      "country": "NG",
      "amount": "100",
      "email": "user@example.com",
      "phonenumber": "08056552980",
      "firstname": "user",
      "lastname": "example",
      "billingzip": "07205",
      "billingcity": "Hillside",
      "billingaddress": "470 Mundet PI",
      "billingstate": "NJ",
      "billingcountry": "US",
      "IP": "40.198.14"
    }

    res = await this.rave.Card.charge(payload)

    if (res.suggestedAuth) { 
      // update payload and recall charge
    }
    

    if (!res.validationCompleted) {

      // if an auth url is required for validation
      if (res.authUrl) { 

        // display the vbv modal, could set state that displays it and pass the url
        this.setState({
          "displayModal": true,
          "url": res.authUrl
        });
      } 

      // if an auth url isn't required
      else {
        // pass the otp to the validate call
        res = await this.rave.Card.validate("12345", res.flwRef)
        console.log(res)
      }

    }

  } 
  catch(e) {
    console.error(e);
  }

```

## Sample Card Preauth Transaction

```
import RaveApi from 'react-native-rave-networking';

rave = new RaveApi("ENTER_YOUR_PUBLIC_KEY", "ENTER_YOUR_PRIVATE_KEY", production= true|false);
rave.Card.preauth({
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
      })
      .catch((err)=>{
        console.error(err);
      })

```

# React Flows

## Sample VBV Flow

```
import React from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import RaveApi, {
  WebComponent
} from 'react-native-rave-networking';


export default class App extends React.Component {
    constructor(props) {
      super(props);
      this.rave = new RaveApi("ENTER_YOUR_PUBLIC_KEY", "ENTER_YOUR_SECRET_KEY");
      this.state = {
        "displayModal": false,
        "url": null
      };
      this.cardCharge = this.cardCharge.bind(this);
      this.accountCharge = this.accountCharge.bind(this);
    }

    async cardCharge() {
      try {
        payload = {
          "cardno": "4556052704172643",
          "cvv": "812",
          "expirymonth": "01",
          "expiryyear": "19",
          "currency": "NGN",
          "country": "NG",
          "amount": "100",
          "email": "user@example.com",
          "phonenumber": "08056552980",
          "firstname": "user",
          "lastname": "example",
          "billingzip": "07205",
          "billingcity": "Hillside",
          "billingaddress": "470 Mundet PI",
          "billingstate": "NJ",
          "billingcountry": "US",
          "IP": "40.198.14"
        }

        res = await this.rave.Card.charge(payload)
        console.log(res);
        if (res.suggestedAuth) { 
          // update payload and recall charge
        }
        

        if (!res.validationCompleted) {
          // if an auth url is required for validation
          if (res.authUrl) { 
            // display the vbv modal
            this.setState({
              "displayModal": true,
              "url": res.authUrl
            });
          } else {
            // pass the otp to the validate call
            res = await this.rave.Card.validate("12345", res.flwRef)
            console.log(res)
          }
        }

      } 
      catch(e) {
        console.error(e);
      }
  }

  componentDidMount() {
    this.cardCharge();
  }

  
  render() {

    if(this.state.displayModal){
      return(
        <WebComponent url={this.state.url} getMessageReturned={(err, message)=>{
          if (err) {
            console.error(message);
          } else {
            console.log(message);
            this.setState({ ...this.state,
              displayModal: false
            })
          }
        }}/>
      );
    }

    return (
      <View style={{"marginTop":20}}>
        <Text>Waiting</Text>
      </View>
    );
  }
}


```