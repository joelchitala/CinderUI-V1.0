import { comparison_mapper } from "./comparison/comparison_mapper.js";
import { comparison_patcher } from "./comparison/comparison_patcher.js";
import { generateUUID } from "../../shared/utils.js";


export const REBUILD_TYPES = {
    none: "none",
    partial: "partial",
    full: "full",
}

export const ACTION_TYPES = {
    none:"none",
    add:"add",
    edit:"edit",
    delete:"delete",
}

export const COMPONENT_TYPES = {
    base_component:"base_component",
    widget:"widget",

    no_child_widget:"no_child_widget",
    single_child_widget:"single_child_widget",
    multi_child_widget:"multi_child_widget",

    state_type_widget:"state_type_widget",
    stateless_widget:"stateless_widget",
    stateful_widget:"stateful_widget",
}


export class BaseComponent {
    constructor({key, body, attrs = {}} = {}) {

        this.data = {
            key: key,
            widget_id: generateUUID(),
            body: body,
            attrs: attrs,
            component_type: COMPONENT_TYPES.base_component,
        }
        this.bind()

    }

    bind(){
        const body = this.data.body;
        const attrs = this.data.attrs;

        body.setAttribute('data-widget_id',this.data.widget_id);

        if(attrs){
            const keys = Object.keys(attrs);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = attrs[key];
                body[key] = value;
            }
        }
    }

    getKey = () => this.data.key;

    render(build){
        const body = this.data.body;

        const context_id = generateUUID();
        body.setAttribute("data-context_id",context_id);

        if(!build) return body;
        
        body.innerHTML = "";

        return body;
    }
}

export class Widget extends BaseComponent{
    constructor({key, body, attrs = {}, template = (self,body) =>{}} = {}) {
        super({key:key, body:body, attrs:attrs});

        this.data = {
            ...this.data,
            template:template,
            component_type: COMPONENT_TYPES.widget,
        }
    }

    render(build){
        const body = super.render(build);

        if(build) {
            this.data.template(this, body);
        }

        return body;
    }
}

export class NoChildWidget extends Widget{
    constructor({key, body, attrs = {}, template = (self,body) =>{}} = {}) {
        super({key:key, body:body, attrs:attrs});

        this.data = {
            ...this.data,
            template:template,
            component_type: COMPONENT_TYPES.no_child_widget,
        }
    }

    
}

export class MultiChildWidget extends Widget{
    constructor(
        {
            key, 
            body, 
            attrs = {}, 
            children = [], 
            template = (self,body,children) =>{}
        } = {}
    ){
        super({key:key, body:body, attrs: attrs, template:(self,body) =>{
                template(self,body,children)
            }
        });

        this.data = {
            ...this.data,
            children:children,
            component_type: COMPONENT_TYPES.multi_child_widget,
        }
    }
}

export class SingleChildWidget extends Widget{
    constructor(
        {
            key, 
            body, 
            attrs = {}, 
            child, 
            template = (self,body,child) =>{}
        } = {}
    ) {
        super({key:key, body:body, attrs: attrs, template:(self,body)=>{
                template(self,body,child);
            }
        });
        this.data = {
            ...this.data,
            child:child,
            component_type: COMPONENT_TYPES.single_child_widget,
        }
    }
}

export class StateTypeWidget extends BaseComponent{
    constructor({
        key, 
        attrs = {}, 
        builder = (self) => {}
    } = {} ){
        const body = document.createElement('section');
        super({key:key, body:body, attrs:attrs});

        this.data = {
            ...this.data,
            builder:builder,
            widget:builder(this),
            component_type: COMPONENT_TYPES.state_type_widget,
        }
    }

    build(){
        const widget = this.data.builder(this);
        this.data.widget = widget;

        return widget
    }

    render(build){
        const body = super.render(build);

        if(build) {
            const widget = this.data.widget
            body.appendChild(widget.render(build));
        }

        return body;
    }
}

export class StatelessWidget extends StateTypeWidget{
    constructor({
        key, 
        attrs = {}, 
        builder = (self) => {}
    } = {}){
        super({key:key, attrs:attrs, builder: builder});

        this.data = {
            ...this.data,
            component_type: COMPONENT_TYPES.stateless_widget,
        }

    }
}

export class StatefulWidget extends StateTypeWidget{
    constructor({
        key, 
        attrs = {}, 
        builder = (self) => {}
    } = {}){
        super({key:key, attrs:attrs, builder: builder});

        this.data = {
            ...this.data,
            component_type: COMPONENT_TYPES.stateful_widget,
        }
    }

    setState(fn = () =>{}){
        const widget = this.data.widget;
        const new_widget = this.data.builder(this);

        const mapped_comparison = comparison_mapper({
            component_1:widget, 
            component_2:new_widget
        });

        comparison_patcher(mapped_comparison["comparison_dict"]);
        
        fn();
    }

}
