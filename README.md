# Rave API calls for React-Native

## Sample Account Transaction

```
import RaveApi from 'react-native-rave-networking';

rave = new RaveApi("ENTER_YOUR_PUBLIC_KEY", "ENTER_YOUR_PRIVATE_KEY", production= true|false);

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
## Sample Card Transaction
```
import RaveApi from 'react-native-rave-networking';

rave = new RaveApi("ENTER_YOUR_PUBLIC_KEY", "ENTER_YOUR_PRIVATE_KEY", production= true|false);
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
import { StyleSheet, Text, View } from 'react-native';
import RaveApi, {VBVComponent} from './RaveNetworking/RaveApi';


export default class App extends React.Component {
  constructor(props){
    super(props);
    this.rave = new RaveApi("ENTER_PUBLIC_KEY", "ENTER_SECRET_KEY");
    this.state = {"displayVBV": false, "url": null};  
  }

  componentDidMount(){
    this.rave.Card.charge({
      "cardno": "5438898014560229",
      "cvv": "812",
      "expirymonth": "08",
      "expiryyear": "20",
      "currency": "NGN",
      "country": "NG",
      "amount": "100",
      "email": "user@example.com",
      "phonenumber": "08056552980",
      "firstname": "user",
      "lastname": "example",
      "IP": "40.198.14"
    })
      .then((res)=>{
        // This is if further auth such as address or pin is required
        if(res.suggestedAuth){
          // Update payload with auth then recharge
        }
        
        if(!res.validationCompleted){
          // if an auth url is required for validation
          if(res.authUrl){
            // display the vbv modal
            this.setState({"displayVBV": true, "url":res.authUrl});
          }

          else{
            // pass the otp to the validate call
            this.rave.Card.validate("12345", res.flwRef)
            .then((res)=>{
              console.log(res);
            })
            .catch((err)=>{
              console.log(err);
            })
          }
        }
      })
      .catch((err)=>{
        console.error(err);
      })
  }

  
  render() {

    if(this.state.displayVBV){
      return(
        <VBVComponent url={this.state.url} getMessageReturned={(err, message)=>{
          if(err){
            console.error(message);
          }
          else{
            console.log(message);
            this.setState({...this.state, displayVBV: false})
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