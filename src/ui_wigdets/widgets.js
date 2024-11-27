import { MultiChildWidget, NoChildWidget, SingleChildWidget } from "../components/subcomponents/core.js";
import { replaceOrAppendNestedEntries } from "../shared/utils.js";

export class ColumnWidget extends MultiChildWidget{
    constructor({key, attrs = {}, children = []}) {
        const body = document.createElement('div');

        attrs = replaceOrAppendNestedEntries({
            obj:{
                style:`
                    display: flex;
                    flex-direction: column;
                `
            },
            replacements: attrs,
            append_mode: true
        });
        
        super({key:key,body:body, attrs:attrs, children:children, template: (self,body,children)=>{
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                body.appendChild(child.render(true));
            }
        }});
    }
}
export class RowWidget extends MultiChildWidget{
    constructor({key, attrs = {}, children = []}) {
        const body = document.createElement('div');

        attrs = replaceOrAppendNestedEntries({
            obj:{
                style:`
                    display: flex;
                    flex-direction: row;
                `
            },
            replacements: attrs,
            append_mode: true
        });
        
        super({key:key,body:body, attrs:attrs, children:children, template: (self,body,children)=>{
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                body.appendChild(child.render(true));
            }
        }});
    }
}

export class ContainerWidget extends SingleChildWidget{
    constructor({key, attrs = {}, child}){
        const body = document.createElement('div');
        super({key:key, body:body ,attrs:attrs, child:child, template: (self,body,child) => {
            
            body.appendChild(child.render(true))
        }});
    }
}

export class TextWidget extends NoChildWidget{
    constructor({key,attrs = {}, text = ""}){
        const body = document.createElement('p');
        super({key:key, body:body ,attrs:attrs, template:(self,body)=>{
            body.innerText = text;
        }});

        this.text = text;
    }
}

export class GestureWidget extends SingleChildWidget{
    constructor({key, attrs = {}, event_types = [], fn = (event) => {} ,child}){
        const body = document.createElement('span');

        super({
            key:key, 
            body: body, 
            attrs: replaceOrAppendNestedEntries({
                obj:{
                    style:`
                        cursor:pointer;
                    `
                },
                replacements: attrs,
                append_mode: true,
            }),
            child: child,
            template: (self, body, child)=>{
                body.appendChild(child.render(true));
            }
        });

        this.data = {
            ...this.data,
            event_types: event_types,
            fn: fn,
        }

        for (let i = 0; i < event_types.length; i++) {
            const event_type = event_types[i];
            
            body[event_type] = (e) => fn({
                e:e, 
                event_type:event_type, 
                child:child,
            });
        }

    }
}