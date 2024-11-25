import { COMPONENT_TYPES, REBUILD_TYPES } from "../core.js";

export const dom_patcher = (parent, component_1, component_2) =>{
    if(component_2 != null){
        
        if(component_1 == null){
            
            parent.data.body.appendChild(component_2.data.body)
        }else{
            
            parent.data.body.replaceChild(
                component_2.data.body, 
                component_1.data.body
            );
        }
    }else{
        if([...parent.data.body.childNodes].includes(component_1.data.body)){
            parent.data.body.removeChild(component_1.data.body)
        }
    }
}

export const comparison_patcher = (comparison) =>{
    if(comparison["rebuild_type"] == REBUILD_TYPES.full){
        return;
    }

    if(comparison["rebuild_type"] == REBUILD_TYPES.none || comparison["rebuild_type"] == REBUILD_TYPES.partial){
    
        const parent = comparison["component_1"];
        const parent_data = parent.data;
        const parent_component_type = parent_data["component_type"];
        
        const changes = comparison["changes"];

        parent_data["attrs"] = {
            ...parent_data["attrs"],
            ...changes["attrs"],
        }

        
        parent.bind();

        const array = [];

        for (let i = 0; i < comparison["nested_comparisons"].length; i++) {
            const nested_comparison = comparison["nested_comparisons"][i];
            const nested_component_1 = nested_comparison["component_1"];
            const nested_component_2 = nested_comparison["component_2"];

            const rebuild_type = nested_comparison["rebuild_type"]
            
            if(rebuild_type == REBUILD_TYPES.none || rebuild_type == REBUILD_TYPES.partial){
                if(nested_component_1){
                    array.push(nested_component_1);
                }

                comparison_patcher(nested_comparison);
            }
    
            if(rebuild_type == REBUILD_TYPES.full){
                if(nested_component_2 != null){
                    array.push(nested_component_2);
                    nested_component_2.render(true);
                }

                dom_patcher(
                    parent, 
                    nested_component_1, 
                    nested_component_2
                );
            }
            
        }

        
        if([
            COMPONENT_TYPES.multi_child_widget
        ].includes(parent_component_type)){
            
            parent_data["children"] = array;
        }

        if([
            COMPONENT_TYPES.stateless_widget,
            COMPONENT_TYPES.stateful_widget,
            COMPONENT_TYPES.single_child_widget,
        ].includes(parent_component_type)){
            parent_data["child"] = array[0];
        }
    }
}