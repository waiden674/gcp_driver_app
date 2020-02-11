import { HttpClient, json } from "aurelia-fetch-client";
import { inject } from "aurelia-framework";

@inject(HttpClient)
export class App {

  message = 'Hello World!';
  expanded = false;

  open() {
    this.expanded = !this.expanded;
  }
  
  constructor(httpClient) {
    this.btnStr = 'Request REBU Driver';
    this.todos = [];
    this.todoDescription = '';
    this.httpClient = httpClient;
    this.httpClient.configure(config => {
      config
        .withBaseUrl('https://pubsub.googleapis.com/v1/projects/stellar-arcadia-205014/')
        .withDefaults({
          credentials:'same-origin',
          headers: {
            'Authorization': 'Bearer ya29.Iq8BvQcFIPXyvsngC_fhbeCmFJBLhVnxoBVG8BCFKk9g49T8U8_NtM3sIHVo8zSlTaUH8ueeZEYcufdIRebEfcwJhePTk2dynWfc7rLYp0hVUO2H1jCLaNdb8LXoOHJAHfJLXGNq-A9Uxa-35b-TkQwpWPtffCdmkPKd10DsCryhd2mtb335sH6YwJn0kFSLpBzxOjLw0n-MX5CgiTjftjkphGrVpIDIHxczJu7oCnO8fw',
            'Accept' : 'application/json',
            'X-Requested-With' : 'Fetch'
          }
        })
        .withInterceptor({
          request(request) {
            console.log(`Requesting ${request.method} ${request.url}`);
            return request;
          },
          response(response) {
            console.log(`Received ${response.status} ${response.url}`);
            return response;
          }
        });
    });
  }

  activate(){
    this.pullMessage()
  }

  pullMessage(){
    let message = {
      "returnImmediately" : false,
      "maxMessages": 10
    };
    this.httpClient
      .fetch("subscriptions/acme-rideshare-driver-requested-subscription:pull",{
        method: 'post',
        body: json(message)
      })
      .then(response => {
        response.json().then(data => {
          if(data.receivedMessages){
            this.acknowledge(data.receivedMessages[0].ackId);
            document.getElementById("buttons").style.bottom = "10px";
          }else{
            console.log("Pulling Again")
            this.pullMessage()
          }
        })
      })
      
  }

  acknowledge(ackId){
    console.log("acknowledged ID: "+ ackId)
    let message = {
      "ackIds": [ackId]
    }
    this.httpClient
      .fetch("subscriptions/acme-rideshare-driver-requested-subscription:acknowledge",{
        method: 'post',
        body: json(message)
      })
  }

  acceptRequest(){
    let message = {
      "messages": [
        {
          "attributes": {
            "key": "iana.org/language_tag",
            "value": "en",
            "Type": "Driver-Ride-Accepted"
          },
          "data": btoa("Request"),
        }
      ]
    }
    this.httpClient
      .fetch("topics/acme-rideshare-driver-accepted-topic:publish",{
        method: 'post',
        body: json(message)
      })
  }

  declineRequest(){
    document.getElementById("buttons").style.bottom = "-100px";
  }
}
