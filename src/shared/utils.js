export const generateUUID = (max = 100000, length = 16) => {
	let uuid = "";
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < length; i++) {
		let randomValue =
			crypto.getRandomValues(new Uint8Array(1))[0] % chars.length;
		uuid += chars[randomValue];
	}

	return uuid + "-" + Math.floor(Math.random() * max).toString();
};

// export const smallerArray = (array_1 = [], array_2 = []) =>{
//     const data = {
//         "array": array_1,
//         length: array_1.length - array_2.length
//     };

//     if(array_1.length < array_2.length){
//         data["array"] = array_1;
//     }

//     if(array_1.length > array_2.length){
//         data["array"] = array_2;
//     }

//     return data;
// }

export const padArray = (array, num = 0, pad_obj = null) => {
	for (let i = 0; i < num; i++) {
		array.push(pad_obj);
	}

	return array;
};

export const moveElement = (array, fromIndex, toIndex) => {
	if (toIndex < 0) return;

	const [element] = array.splice(fromIndex, 1);

	array.splice(toIndex, 0, element);

	return array;
};

export const dictSimilar = (obj1, obj2) => {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		if (obj1[key] !== obj2[key]) {
			return false;
		}
	}

	return true;
};

export const dictSimilarDeep = (obj1, obj2) => {
	if (
		typeof obj1 !== "object" ||
		typeof obj2 !== "object" ||
		obj1 === null ||
		obj2 === null
	) {
		return obj1 === obj2;
	}

	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		if (!areObjectsSimilarDeep(obj1[key], obj2[key])) {
			return false;
		}
	}

	return true;
};

export const areObjectsSimilarDeep = (obj1, obj2) => {
	// Handle primitive types, null, and functions
	if (
		typeof obj1 !== "object" ||
		typeof obj2 !== "object" ||
		obj1 === null ||
		obj2 === null
	) {
		if (typeof obj1 === "function" && typeof obj2 === "function") {
			return obj1.toString() === obj2.toString(); // Compare function code
		}
		return obj1 === obj2; // Compare primitive values
	}

	// Handle Arrays
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if (obj1.length !== obj2.length) {
			return false; // Different array lengths
		}

		for (let i = 0; i < obj1.length; i++) {
			if (!areObjectsSimilarDeep(obj1[i], obj2[i])) {
				return false; // Element mismatch
			}
		}

		return true; // Arrays are identical
	}

	// If one is an array and the other is not, they are different
	if (Array.isArray(obj1) !== Array.isArray(obj2)) {
		return false;
	}

	// Handle Objects
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false; // Different number of keys
	}

	for (const key of keys1) {
		if (!keys2.includes(key) || !areObjectsSimilarDeep(obj1[key], obj2[key])) {
			return false; // Key mismatch or value mismatch
		}
	}

	return true; // Objects are identical
};

export function createSelfDestructingObject(obj) {
	return new Proxy(obj, {
		get(target, prop, receiver) {
			if (prop in target) {
				const value = target[prop];

				// If the value is an object, make it self-destructing
				if (value && typeof value === "object" && !Array.isArray(value)) {
					const nestedProxy = createSelfDestructingObject(value);

					// Check if the nested object still has keys after access
					if (Object.keys(value).length === 0) {
						delete target[prop]; // Remove the parent property if the nested object is empty
					}

					return nestedProxy;
				}

				// For non-objects, simply remove the property
				delete target[prop];
				return value;
			}
			return undefined; // Return undefined if the property doesn't exist
		},
	});
}

export function deepCopy(obj) {
	if (obj === null || typeof obj !== "object") return obj;

	// Handle Array
	if (Array.isArray(obj)) {
		return obj.map((item) => deepCopy(item));
	}

	// Handle Object
	const copy = {};
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			copy[key] = deepCopy(obj[key]);
		}
	}
	return copy;
}

export function replaceOrAppendNestedEntries({
	obj,
	replacements,
	append_mode = false,
}) {
	for (const [key, value] of Object.entries(replacements)) {
		if (
			typeof value === "object" &&
			value !== null &&
			!(value instanceof Array)
		) {
			if (key in obj && typeof obj[key] === "object" && obj[key] !== null) {
				replaceOrAppendNestedEntries(obj[key], value);
			} else {
				obj[key] = value;
			}
		} else {
			if (append_mode) {
				obj[key] += value;
			} else {
				obj[key] = value;
			}
		}
	}
	return obj;
}
