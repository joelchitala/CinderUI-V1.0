export class App{
    constructor({initial_route, routes, child}) {
        if (!App.instance) {
            App.instance = this;
        }else{
            return App.instance;
        }

        this.data = {
            "mount_element": null,
            "initial_route":initial_route,
            "current_route": null,
            "routes": routes,
            "currentWidget": null,
            "widgets":[],
            "intents":{},
        }

        if(initial_route){
            if(!routes){
                throw new Error(`Routes can not be ${routes}`);
            }

            if(routes.length == 0){
                throw new Error("initial route needs routes");
            }
        }

        if(routes){
            if(!initial_route){
                throw new Error(`Initial route can not be ${initial_route}`);
            }
            this.data.current_route = this.data.initial_route;
            this.data.currentWidget = this.data.routes[this.data.current_route];
        }

        if(!initial_route && !routes){
            if(!child){
                throw new Error(`Child Can not be ${child}`);
            }
            this.data.routes = {
                ...this.data.routes,
                '/':child
            };
            this.data.initial_route = "/";
            this.data.current_route = this.data.initial_route;

            this.data.currentWidget = this.data.routes[this.data.current_route];
        }
        

        return App.instance;
    }

    setMountElement(dom_element){
        this.data["mount_element"] = dom_element;
    }

    setCurrentRoute(route){
        if(!this.data.routes[route]){
            throw new Error(`Route ${route} does not exist`);
        }

        this.data.current_route = route;
        this.data.currentWidget = this.data.routes[route];
    }

    pushWidget(widget){
        this.data.widgets.push(this.data.currentWidget);
        this.data.currentWidget = widget;
    }

    popWidget(){
        if(this.data.widgets.length < 1){
            return;
        }
        this.data.currentWidget = this.data.widgets.pop();
    }

    getIntent(name){
        return this.data.intents[name];
    }

    addIntent(intent){
        if(!intent){
            return;
        }
        this.data.intents[intent.getName()] = intent;
    }

    removeIntent(name){
        const intent = this.data.intents[name];

        if(intent){
            delete this.data.intents[name];
        }

        return intent;
    }

    clearIntents(){
        this.data.intents = {};

        return this.data.intents;
    }

    render(build = true){
        const mount_element = this.data.mount_element;

        if(!mount_element) return;

        mount_element.innerHTML = "";

        const widget = this.data.currentWidget;

        mount_element.appendChild(widget.render(build))

    }

    
}