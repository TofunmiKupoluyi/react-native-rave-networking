import React from 'react';
import {WebView} from 'react-native';

export default class WebComponent extends React.Component{
    constructor(props) {
      super(props);
      this.numberOfPageLoads = 0;
      this.maxPageLoads= this.props.maxPageLoads || 3;
    }
    
    handleResponse(response) {
      return {
        "status": response["status"],
        "chargeToken": response["chargeToken"],
        "flwRef": response["flwRef"],
        "txRef": response["txRef"]
      }
    }
    
    render() {
      return (
        <WebView
            source = {
              {
                uri: this.props.url
              }
            }

            style = {
              {
                marginTop: 20,
                ...this.props.style
              }
            }

            javaScriptEnabled = {
              true
            }

            injectedJavaScript = {
              "window.postMessage(document.getElementsByTagName('BODY')[0].innerHTML)"
            }

            onMessage = {
              (message) => {
                let returnedMessage = message.nativeEvent.data;
                // Attempt to parse a json
                try {
                  let returnedJson = JSON.parse(returnedMessage);
                  // first parameter indicates whether there was an error
                  this.props.getMessageReturned(false, this.handleResponse(returnedJson));
                } catch (e) {
                  // If the response is not json (note, the homepage is not json so we have to allow multiple attempts at parsing)
                  // Allow max 3 page loads (default), if we still can't get a json, we return an error
                  if (this.numberOfPageLoads >= this.maxPageLoads) {
                    this.props.getMessageReturned(true, returnedMessage)
                    this.props.getMessageReturned(true, returnedMessage);
                  }

                  this.numberOfPageLoads += 1;
                }

              }
            }
        />
      );
    }
  }