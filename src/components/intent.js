export class Intent {
    constructor(name,payload) {
        this.data = {
            "name":name.toLowerCase(),
            "payload":payload,
        }
    }

    getName(){
        return this.data["name"];
    }

    getPayload(){
        return this.data["payload"];
    }

    getData(){
        return this.data;
    }
}