import { Intent } from "./intent.js";
import { App } from "./subcomponents/app.js";

export const pushNavigator = ({widget, intent, build = true}) =>{
    const app = new App({});

    app.pushWidget(widget);
    app.addIntent(intent);

    app.render(build);
}


export const pushNamed = ({path, intent, build = true}) =>{
    const app = new App({});

    app.setCurrentRoute(path);
    app.addIntent(intent);

   app.render(build);
}

export const popNavigator = (build = false) =>{
    const app = new App({});

    app.popWidget();

    app.render(build);
}

export const getIntent = (name) =>{
    const app = new App({});

    return app.getIntent(name);
}

export const createIntent = (name,payload) =>{
    return new Intent(name,payload);
}