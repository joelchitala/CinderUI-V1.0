import { Context } from "./context.js";

const unwrap_nodes = (nodes) =>{
    const seenNodes = []

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if(!seenNodes.includes(node)){
            seenNodes.push(node);
        }

        const childrenNodes = unwrap_nodes(node.childNodes);

        for (let x = 0; x < childrenNodes.length; x++) {
            const childrenNode = childrenNodes[x];

            if(!seenNodes.includes(childrenNode)){
                seenNodes.push(childrenNode);
            }
        }
        
    }

    return seenNodes;
}

const widgetValidator = (context, nodes, func = (entry)=>{}) =>{
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const attr = node.attributes;

        if(!attr) continue;

        let widget_id = attr["data-widget_id"] ? attr["data-widget_id"].value : null;
        let context_id = attr["data-context_id"] ? attr["data-context_id"].value : null;
        
       const entry = context.getWidgetContextEntry(widget_id,context_id)[0];
        
        if(!entry){
            continue;
        }

        func(entry);
        
    }
}

export const observer = new MutationObserver((mutationsList, observer) => {
    const context = new Context();

    for (const mutation of mutationsList) {
        
        if (mutation.type === 'childList') {

            const addedNodes = unwrap_nodes(mutation.addedNodes);

            widgetValidator(context,addedNodes,(entry)=>{
                const widget = entry.getWidget();

                widget.mount();
            });

            const removedNodes = unwrap_nodes(mutation.removedNodes);

            widgetValidator(context,removedNodes,(entry)=>{
                const widget = entry.getWidget();

                widget.destroy();
            });

            // for (let i = 0; i < addedNodes.length; i++) {
            //     const node = addedNodes[i];
            //     const attr = node.attributes;

            //     if(!attr) continue;

            //     let widget_id = attr["data-widget_id"];
            //     let context_id = attr["data-context_id"];

            //    const entry = context.getWidgetContextEntry(widget_id,context_id)[0];

            //     if(!entry){
            //         continue;
            //     }
                
            // }
            

            // for (let i = 0; i < mutation.addedNodes.length; i++) {
            //     const node = mutation.addedNodes[i];
                
            //     const attr = node.attributes;

            //     if(!attr){
            //         continue
            //     }

            //     let widget_id = attr["data-widget_id"];
            //     let context_id = attr["data-context_id"];

            //     if(!widget_id || !context_id){
            //         continue;
            //     }

            //    const entry = context.getWidgetContextEntry(widget_id,context_id)[0];

            //     if(!entry){
            //         continue;
            //     }

            //     const widget = entry.getWidget();

            //     widget.mount();
            // }

            // for (let i = 0; i < mutation.removedNodes.length; i++) {
            //     const node = mutation.removedNodes[i];
                
            //     const attr = node.attributes;

            //     if(!attr){
            //         continue
            //     }

            //     let widget_id = attr["data-widget_id"];
            //     let context_id = attr["data-context_id"];


            //     if(!widget_id || !context_id){
            //         continue;
            //     }

            //     const entries = context.removeWidgetContextEntry(widget_id.value,context_id.value);

                
            //     for (let i = 0; i < entries.length; i++) {
            //         const entry = entries[i];
                    
            //         entry.getWidget().destroy();
            //     }
            // }
        }
    }
});

