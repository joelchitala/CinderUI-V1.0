
export class WidgetContextEntry {
    constructor(widgetId,contextId,widget) {
        this.data = {
            "widgetId":widgetId,
            "contextId":contextId,
            "widget":widget,
        }
    }

    getWidgetId = () => this.data.widgetId;

    getContextId = () => this.data.contextId;

    getWidget = () => this.data.widget;
}

export class Context {
    constructor() {

        this.data = {
            "widgetContextEntries":[]
        };
        
        if(!Context.instance){
            Context.instance = this;
        }

        return Context.instance;
    }

    addWidgetContextEntries(widgetContextEntry){
        this.data.widgetContextEntries.push(widgetContextEntry)
    }

    removeWidgetContextEntry(widgetId,contextId){
        let widgetContextEntries = this.data.widgetContextEntries;

        let entries = []

        for (let i = 0; i < widgetContextEntries.length; i++) {
            const widgetContextEntry = widgetContextEntries[i];

            const isWidgetIdMatch = widgetContextEntry.getWidgetId() == widgetId;
            const isContextIdMatch = widgetContextEntry.getContextId() == contextId;

            if(isWidgetIdMatch && isContextIdMatch){
                this.data.widgetContextEntries.splice(i,1);
                entries.push(widgetContextEntry);
            }
        }

        return entries;
    }

    getWidgetContextEntries(){
        return this.data.widgetContextEntries;
    }

    getWidgetContextEntry(widgetId,contextId){
        let widgetContextEntries = this.data.widgetContextEntries;

        if(!widgetId && !contextId){
            return [];
        }

        const entries = [];

        
        for (let i = 0; i < widgetContextEntries.length; i++) {
            const entry = widgetContextEntries[i];
            
            if(widgetId && contextId){
                if(entry.data["widgetId"] == widgetId && entry.data["contextId"] == contextId){
                    entries.push(entry);
                }
                continue;
            }

            if(entry.data["widgetId"] == widgetId || entry.data["contextId"] == contextId){
                entries.push(entry);
                continue;
            }
            
        }
       
        return entries;
    }
}