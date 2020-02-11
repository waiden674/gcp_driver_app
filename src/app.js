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
            'Authorization': 'Bearer ya29.Iq8BvQfdhEYQ9Kg6MJgTIiaxNqD6o6RPBFfYXh8XASaYRSaprStfAhjoPtavvAPsAs-GZ1zwfw3C39tafvl1EZGLUFalnVfJT4Dc5bitOtWQyW4AZVeScc9_o5ZT2nxS4-lSvhfWerGN3JshBfxVzgSKfLS34WPlHnLNO7SO_dsFgJPhUzvAmabngIJnymQslp4rjzPv1e-ioVYIsvfMew3XkqM8Wked1-byeC7JKuEpyA',
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
          "data": "ewoJInBhc3Nlbmdlck5hbWUiOiJUb21teSIsCgkiZHJpdmVyTmFtZSI6IkphY2siLAoJInJlcXVlc3RUeXBlIjoiZHJpdmVyIHJpZGUgYWNjZXB0ZWQiLAoJIm1zZyI6IkkgbmVlZCBhIHJpZGVzaGFyZS4iCn0=",
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
    this.pullMessage();
  }
}
