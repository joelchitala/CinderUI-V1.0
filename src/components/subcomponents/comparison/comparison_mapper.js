import { COMPONENT_TYPES, REBUILD_TYPES } from "../core.js";

const padArray = (array, num = 0, pad_obj = null) =>{
    
    for (let i = 0; i < num; i++) {
        array.push(pad_obj)
    }

    return array;
}

const moveElement = (array, fromIndex, toIndex) =>{
    if(toIndex < 0) return;

    const [element] = array.splice(fromIndex, 1);

    array.splice(toIndex, 0, element);

    return array;
}

const areObjectsSimilarDeep = (obj1, obj2) =>{
    if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
        if (typeof obj1 === "function" && typeof obj2 === "function") {
            return obj1.toString() === obj2.toString(); 
        }
        return obj1 === obj2; 
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false; 
        }

        for (let i = 0; i < obj1.length; i++) {
            if (!areObjectsSimilarDeep(obj1[i], obj2[i])) {
                return false; 
            }
        }

        return true; 
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false; 
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !areObjectsSimilarDeep(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true; 
}

export const comparison_mapper = ({component_1, component_2}) =>{
    
    const component_type = component_1.data["component_type"];
    
    switch (component_type) {
        case COMPONENT_TYPES.base_component:
            return base_component_comparison({
                component_1:component_1, 
                component_2:component_2
            });

        case COMPONENT_TYPES.widget:
            return widget_comparison({
                component_1:component_1, 
                component_2:component_2
            });
        
        case COMPONENT_TYPES.no_child_widget:
           return no_child_widget_comparison({
                component_1:component_1, 
                component_2:component_2
           });

        case COMPONENT_TYPES.single_child_widget:
            return single_child_widget_comparison({
                component_1:component_1, 
                component_2:component_2
            })
        
        case COMPONENT_TYPES.multi_child_widget:
            return multi_child_widget_comparison({
                component_1:component_1, 
                component_2:component_2
            });
        
        case COMPONENT_TYPES.state_type_widget:
            return state_type_widget_comparison({
                component_1:component_1, 
                component_2:component_2
            })
        case COMPONENT_TYPES.stateless_widget:
            return new stateless_widget_comparison({
                component_1:component_1, 
                component_2:component_2
            });
        case COMPONENT_TYPES.stateful_widget:
            return new stateful_widget_comparison({
                component_1:component_1, 
                component_2:component_2
            });
        default:
            break;
    }
}


export const create_comparison_data = ({component_1, component_2}) =>{
    return {
        comparison_dict: {
            rebuild_type: REBUILD_TYPES.none,
            changes:{},
            component_1: component_1,
            component_2: component_2,
            nested_comparisons: [],
        },
        entries:{
            component_1: component_1,
            component_2: component_2,
        }
    }
}

export const run_comparison_data = ({data, fn = ({comparison_dict, entry_key, component_entry_1, component_entry_2}) =>{}}) =>{

    const comparison_dict = data["comparison_dict"];
    const entries = data["entries"];

    const component_1 = entries["component_1"];
    const component_2 = entries["component_2"];

    const comparison_1_entry_keys = Object.keys(component_1);
    const comparison_2_entry_keys = Object.keys(component_2);

    if(comparison_1_entry_keys.length != comparison_2_entry_keys.length){
        comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
        return data;
    }

    const component_1_entries = Object.entries(component_1);
    const component_2_entries = Object.entries(component_2);

    for (let i = 0; i < comparison_1_entry_keys.length; i++) {
        const entry_key_1 = comparison_1_entry_keys[i];
        
        for (let x = 0; x < component_1_entries.length; x++) {
            if(comparison_dict["rebuild_type"] == REBUILD_TYPES.full){
                return;
            }

            if(component_1_entries[x][0] == entry_key_1){
                fn({
                    comparison_dict:comparison_dict,
                    entry_key:entry_key_1, 
                    component_entry_1:component_1_entries[x][1], 
                    component_entry_2:component_2_entries[x][1]
                })
            }
        }
    }
}

export const base_component_comparison = ({component_1, component_2}) =>{
    
    const data = create_comparison_data({component_1:component_1, component_2:component_2});

    run_comparison_data({data:data, fn:(
        {comparison_dict,entry_key,component_entry_1,component_entry_2}
    )=>{
        if(entry_key == "data"){
            

            if(component_entry_1["key"] != component_entry_2["key"]){
                comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                return;
            }

            if(component_entry_1["component_type"] != component_entry_2["component_type"]){
                comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                return;
            }
            
            if(component_entry_1["body"].nodeName != component_entry_2["body"].nodeName){
                comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                return;
            }

            if(JSON.stringify(component_entry_1["attrs"]) != JSON.stringify(component_entry_2["attrs"])){
                comparison_dict["rebuild_type"] = REBUILD_TYPES.partial;
                comparison_dict["changes"]["attrs"] = component_entry_2["attrs"];
            }
            
        }
    }});
    
    return data;
}

export const widget_comparison = ({component_1, component_2}) =>{
    const data = base_component_comparison({
        component_1: component_1, 
        component_2: component_2
    });

    run_comparison_data({
        data:data,
        fn: (
            {comparison_dict, entry_key, component_entry_1, component_entry_2}
        )=>{
            if(entry_key == "data"){
                if(component_entry_1["template"].toString() != component_entry_2["template"].toString()){
                    comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                    return;
                }
            }
        }
    });

    return data;
}


export const no_child_widget_comparison = ({component_1, component_2}) =>{
    const data = widget_comparison({
        component_1: component_1, 
        component_2: component_2
    });

    run_comparison_data({
        data:data,
        fn: (
            {comparison_dict, entry_key, component_entry_1, component_entry_2}
        )=>{
            if(entry_key == "data"){
                
            }

            if(entry_key != "data"){
                if(!areObjectsSimilarDeep(component_entry_1, component_entry_2)){
                    comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                    return; 
                }
            }
        }
    });

    return data;
}

export const single_child_widget_comparison = ({component_1, component_2}) =>{
    const data = widget_comparison({
        component_1: component_1, 
        component_2: component_2
    });

    run_comparison_data({
        data:data,
        fn: (
            {comparison_dict, entry_key, component_entry_1, component_entry_2}
        )=>{
            if(entry_key == "data"){
                const child_1 = comparison_dict["component_1"]["data"]["child"];
                const child_2 = comparison_dict["component_2"]["data"]["child"];

                comparison_dict["nested_comparisons"] = [
                    comparison_mapper({
                        component_1:child_1, 
                        component_2:child_2,
                    })["comparison_dict"]
                ];
            }

            if(entry_key != "data"){
                if(!areObjectsSimilarDeep(component_entry_1, component_entry_2)){
                    comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                    return; 
                }
            }
        }
    });

    return data;
}

export const multi_child_widget_comparison = ({component_1, component_2}) =>{
    const data = widget_comparison({
        component_1: component_1, 
        component_2: component_2
    });

    run_comparison_data({
        data:data,
        fn: (
            {comparison_dict, entry_key, component_entry_1, component_entry_2}
        )=>{
            if(entry_key == "data"){

                const children_1 = [...component_entry_1["children"]];
                const children_2 = [...component_entry_2["children"]];

                const swap_pairs = []
                for (let x = 0; x < children_1.length; x++) {
                    const child_1 = children_1[x];
                    
                    const key = child_1.getKey()
                    
                    
                    if(!key) continue;
                    
                    swap_pairs.push(
                        {
                            child_index_1: x,
                            child_index_2: children_2.findIndex(x => x.getKey() == key),
                        }
                    )
                }
                
                const pad_num = children_1.length - children_2.length;
                const pad_obj = null;

                if (pad_num > 0) {
                    padArray(children_2, Math.abs(pad_num), pad_obj);
                }

                if (pad_num < 0) {
                    padArray(children_1, Math.abs(pad_num), pad_obj);
                }

                

                for (let x = 0; x < swap_pairs.length; x++) {
                    const swap_pair = swap_pairs[x];
                    const index_1 = swap_pair["child_index_1"];
                    const index_2 = swap_pair["child_index_2"];

                    if(index_2 < 0){
                        children_1[index_1] = pad_obj
                        continue;
                    }
                    moveElement(children_1, index_1, index_2);
                }

                const replacement_array = [];

                for (let x = 0; x < children_1.length; x++) {
                    const child_1 = children_1[x];
                    const child_2 = children_2[x];
                    
                    
                    if(child_1 && child_2){
                        replacement_array.push(comparison_mapper({
                            component_1:child_1, 
                            component_2:child_2
                        })["comparison_dict"]);

                        continue;
                    }

                    if(child_1 == null && child_2 != null){
                        replacement_array.push({
                            rebuild_type: REBUILD_TYPES.full,
                            changes: {},
                            component_1: null,
                            component_2: child_2,
                        });
                        continue;
                    }

                    if(child_1 != null && child_2 == null){
                        replacement_array.push({
                            rebuild_type: REBUILD_TYPES.full,
                            changes: {},
                            component_1: child_1,
                            component_2: null,
                        });
                        continue;
                    }
                    
                }

                comparison_dict["nested_comparisons"] = replacement_array;
            }

            if(entry_key != "data"){
                if(!areObjectsSimilarDeep(component_entry_1, component_entry_2)){
                    comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                    return; 
                }
            }
        }
    });

    return data;
}

export const state_type_widget_comparison = ({component_1, component_2}) =>{
    const data = base_component_comparison({
        component_1: component_1, 
        component_2: component_2
    });

    return data;
}

export const stateless_widget_comparison = ({component_1, component_2}) =>{
    const data = state_type_widget_comparison({
        component_1: component_1, 
        component_2: component_2
    });

    run_comparison_data({
        data:data,
        fn: (
            {comparison_dict, entry_key, component_entry_1, component_entry_2}
        )=>{

            if(entry_key == data){
                const child_1 = comparison_dict["component_1"]["data"]["child"];
                const child_2 = comparison_dict["component_2"]["data"]["child"];
                
                comparison_dict["nested_comparisons"] = [
                    comparison_mapper({
                        component_1:child_1, 
                        component_2:child_2
                    })["comparison_dict"]
                ]
            }

            if(entry_key != "data"){
                if(!areObjectsSimilarDeep(component_entry_1, component_entry_2)){
                    comparison_dict["rebuild_type"] = REBUILD_TYPES.full;
                    return; 
                }
            }
        }
    });

    return data;
}

export const stateful_widget_comparison = ({component_1, component_2}) =>{
    const data = state_type_widget_comparison({
        component_1: component_1, 
        component_2: component_2
    });

    run_comparison_data({
        data:data,
        fn: (
            {comparison_dict, entry_key, component_entry_1, component_entry_2}
        )=>{

            if(entry_key == data){
                const child_1 = comparison_dict["component_1"]["data"]["child"];
                const child_2 = comparison_dict["component_2"]["data"]["child"];
                
                comparison_dict["nested_comparisons"] = [
                    comparison_mapper({
                        component_1:child_1, 
                        component_2:child_2
                    })["comparison_dict"]
                ]
            }

            if(entry_key != "data"){
                if(!areObjectsSimilarDeep(component_entry_1, component_entry_2)){
                    comparison_dict["rebuild_type"] = REBUILD_TYPES.partial;
                    comparison_dict["changes"][entry_key] = component_entry_2;
                    return; 
                }
            }
        }
    });

    return data;
}