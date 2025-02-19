import * as THREE from 'three';
import { MySceneData } from './MySceneData.js';

/**
 *  1. in a given class file MyWhateverNameClass.js in the constructor call:
 * 
 *  this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
 *  this.reader.open("scenes/<path to json file>.json");	
 * 
 *  The last argumet in the constructor is a method that is called when the json file is loaded and parsed (see step 2).
 * 
 *  2. in the MyWhateverNameClass.js class, add a method with signature: 
 *     onSceneLoaded(data) {
 *     }
 * 
 *  This method is called once the json file is loaded and parsed successfully. The data argument is the entire scene data object. 
 * 
 */

class MyFileReader {

	/**
	   constructs the object
	*/
	constructor(onSceneLoadedCallback) {
		this.errorMessage = null;
		this.onSceneLoadedCallback = onSceneLoadedCallback;
		this.data = new MySceneData();
	}

	open(jsonfile) {
		fetch(jsonfile)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! Status: ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				this.onSceneLoadedCallback(data);
			})
			.catch((error) =>
				console.error("Unable to fetch data:", error));
	};

	/**
	 * Read the json file and loads the data
	 */
	readJson(data) {
		try {
			let rootElement = data["yasf"];

			this.checkPrimaryNodes(rootElement);

			this.loadGlobals(rootElement);
			this.loadCameras(rootElement);
			this.loadTextures(rootElement);
			this.loadMaterials(rootElement);
			this.loadNodes(rootElement);
			this.loadTrack(rootElement);
			this.loadBalloonsTransformations(rootElement);
		}
		catch (error) {
			this.errorMessage = error;
			console.error(error);
		}
	}

	/**
	 * Checks if all primary nodes are present in the root element and if no others are present
	 * @param {*} rootElement 
	 */
	checkPrimaryNodes(rootElement) {
		let list = this.data.primaryNodeIds;
		let appear = [];

		for (let node in rootElement) {
			if (list.includes(node) === false) {
				throw new Error("unknown json element '" + elem.tagName + "' in root element");
			}
			if (appear.includes(node)) {
				throw new Error("duplicate json element '" + elem.tagName + "' in root element");
			}
			appear.push(node);
		}
		if (appear.length !== list.length) {
			let diff = list.filter(x => !appear.includes(x));
			throw new Error("missing primary json element(s) " + diff + " in root element");
		}
	}

	/**
	 *  checks if any unknown attributes exits at a given element
	 * @param {*} elem 
	 *  @param {Array} list an array of strings with the valid attribute names	  
	*/
	checkForUnknownAttributes(elem, list) {
		// for each elem attributes
		for (let attrib in elem) {
			if (list.includes(attrib) === false) {
				// report!
				throw new Error("unknown attribute '" + attrib + "' in element");
			}
		}
	}

	toArrayOfNames(descriptor) {
		let list = []
		// for each descriptor, get the value
		for (let i = 0; i < descriptor.length; i++) {
			list.push(descriptor[i].name)
		}
		return list
	}

	/**
	 * returns the index of a string in a list. -1 if not found
	 * @param {Array} list an array of strings
	 * @param {*} searchString the searched string
	 * @returns the zero-based index of the first occurrence of the specified string, or -1 if the string is not found
	 */
	indexOf(list, searchString) {
		if (Array.isArray(list)) {
			return list.indexOf(searchString)
		}
		return -1;
	}

	/**
	 * extracts the color (rgb) from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {String} attributeName the attribute name
	 * @param {Boolean} required if the attribte is required or not
	 * @returns {THREE.Color} the color encoded in a THREE.Color object
	 */
	getRGB(element, attributeName, required, intensity) {
		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("rgb attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': rgb value is null for attribute '" + attributeName + "' in element '" + element.id + "'.");
			}
			return null;
		}

		return this.getVectorN(value, intensity ? ["r", "g", "b", "intensity"] : ["r", "g", "b"]);
	}

	getVectorN(value, keys) {
		let vector = new Array();
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const component = value[key];
			if (component === null || component === undefined) {
				throw new Error("element '" + value + "': vector" + keys.length + " value is null for '" + key);
			}
			vector.push(component);
		}
		return vector;
	}

	/**
	 * returns a vector3 from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector3 encoded in a THREE.Vector3 object
	 */
	getVector3(element, attributeName, required) {
		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("vector3 attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': vector3 value is null for attribute '" + attributeName + "' in element '" + element.id + "'.");
			}
			return null;
		}

		return this.getVectorN(value, ["x", "y", "z"]);
	}

	/**
	 * returns a vector2 from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector2 encoded in a THREE.Vector3 object
	 */
	getVector2(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("vector3 attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": vector2 value is null for attribute " + attributeName + ".");
			}
			return null;
		}

		return this.getVectorN(value, ["x", "y"]);
	}
	/**
	 * returns an item from an element for a particular attribute and checks if the item is in the list of choices
	 * @param {*} element the xml element
	 * @param {*} attributeName the
	 * @param {*} choices the list of choices
	 * @param {*} required if the attribte is required or not
	 * @returns {String} the item
	 */
	getItem(element, attributeName, choices, required) {

		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("item attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": item value is null for attribute " + attributeName + ".");
			}
			return null;
		}

		value = value.toLowerCase();
		let index = this.indexOf(choices, value);
		if (index < 0) {
			throw new Error("element '" + element.id + ": value '" + value + "' is not a choice in [" + choices.toString() + "]");
		}

		return value;
	}

	/**
	 * returns a string from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name
	 * @param {*} required if the attribte is required or not
	 * @returns {String} the string
	 */
	getString(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("string attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null && required) {
			throw new Error("element '" + element + ": in element '" + element + "' string value is null for attribute '" + attributeName + "'.");
		}
		return value;
	}

	/**
	 * checks if an element has a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName 
	 * @returns {boolean} if the element has the attribute
	 */
	hasAttribute(element, attributeName) {
		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("string attribute name is null.");
		}

		let value = element.getAttribute(attributeName);
		return (value != null);
	}

	/**
	 * returns a boolean from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {boolean} the boolean value
	 */
	getBoolean(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element + ": in element '" + element + "' bool value is null for attribute '" + attributeName + "'.");
			}
			return null;
		}
		if (typeof value !== "boolean") {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be bool but is '" + (typeof value) + "'")
		}

		return value
	}

	/**
	 * returns a integer from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Integer} the integer value
	 */
	getInteger(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element + ": in element '" + element + "' integer value is null for attribute '" + attributeName + "'.");
			}
			return null;
		}
		if (!Number.isInteger(value)) {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be integer but is '" + (typeof value) + "'")
		}

		return value
	}

	/**
	 * returns a float from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Float} the float value
	 */
	getFloat(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element + ": in element '" + element + "' float value is null for attribute '" + attributeName + "'.");
			}
			return null;
		}
		if (typeof value !== "number") {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be float but is '" + (typeof value) + "'")
		}

		return value
	}

	/*
   * TODO: Fix commet
		Load a xml attributes item based on a descriptor:
		Example: options = {elem: elem, descriptor: descriptor, extras: [["type", "pointlight"]]}
		where elem is a xml element, descriptor is an array of all the attributes description and extras are extra
		attributes to add to the resulting object.
	
		Each attribute descriptor is an object with the following properties:
		- name: the name of the attribute
		- type: the type of the attribute (string, boolean, integer, float, vector3, vector2, rgba, rectangle2D, item)
		- required: true if the attribute is required, false otherwise
		- default: the default value if the attribute is not required and not present in the xml element
		- choices: an array of choices if the type is item
	
	*/
	loadJsonItem(options) {
		// create an empty object
		let obj = {}

		if (options === null || options === undefined) {
			throw new Error("unable to load json item because arguments are null or undefined");
		}

		if (options.elem === null || options.elem === undefined) {
			throw new Error("unable to load json item because json element is null or undefined");
		}

		if (options.descriptor === null || options.descriptor === undefined) {
			throw new Error("unable to load json item because descriptor to parse element '" + options.elem.id + "' is null or undefined");
		}

		if (options.elem.id !== null && options.elem.id !== undefined) {
			throw new Error("unable to load json item because id is already set in the item");
		}

		// Add the id to the element if the descriptor requires it
		for (let i in options.descriptor) {
			const attr = options.descriptor[i];
			if (attr.name == "id") {
				options.elem["id"] = options.key;
			}
		}

		// for each descriptor, get the value
		for (let i = 0; i < options.descriptor.length; i++) {
			let value = null;
			let descriptor = options.descriptor[i]
			if (descriptor.type === "string") {
				value = this.getString(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "boolean") {
				value = this.getBoolean(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "integer") {
				value = this.getInteger(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "float") {
				value = this.getFloat(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "vector3") {
				value = this.getVector3(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "vector2") {
				value = this.getVector2(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "rgb") {
				value = this.getRGB(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "rgbi") {
				value = this.getRGB(options.elem, descriptor.name, descriptor.required, true);
			}
			else if (descriptor.type === "rectangle2D") {
				value = this.getRectangle2D(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "item") {
				value = this.getItem(options.elem, descriptor.name, descriptor.choices, descriptor.required);
			}
			else if (descriptor.type === "list") {
				value = [];
				for (let key in options.elem[descriptor.name]) {
					value.push(options.elem[descriptor.name][key]);
				}
			}
			else {
				throw new Error("element '" + options.elem + " invalid type '" + descriptor.type + "' in descriptor");
			}

			// if the value is null and the attribute is not required, then use the default value
			if (value == null && descriptor.required == false && descriptor.default != undefined) {
				value = descriptor.default;
			}

			// store the value in the object
			obj[descriptor.name] = value;
		}
		// append extra parameters if any
		for (let i = 0; i < options.extras.length; i++) {
			let extra = options.extras[i]
			obj[extra[0]] = extra[1]
		}

		// return the object
		return obj;
	}

	loadJsonItems(parentElemen, tagName, descriptor, extras, addFunc) {
		for (let elem in parentElemen) {
			let obj = this.loadJsonItem({
				key: elem,
				elem: parentElemen[elem],
				descriptor: descriptor,
				extras: extras
			});
			addFunc.bind(this.data)(obj);
		}
	}

	/*
	 * Load globals element
	 * 
	 */
	loadGlobals(rootElement) {
		let globals = rootElement["globals"];
		this.data.setOptions(this.loadJsonItem({
			key: "globals",
			elem: {ambient: globals["ambient"], background: globals["background"]},
			descriptor: this.data.descriptors["globals"],
			extras: [["type", "globals"]]
		}));
		this.data.setFog(this.loadJsonItem({
			key: "fog",
			elem: globals["fog"],
			descriptor: this.data.descriptors["fog"],
			extras: [["type", "fog"]]
		}));
		this.data.setSkybox(this.loadJsonItem({
			key: "skybox",
			elem: globals["skybox"],
			descriptor: this.data.descriptors["skybox"],
			extras: [["type", "skybox"]]
		}))

	}

	/**
	 * Load the textures element
	 * @param {*} rootElement 
	 */
	loadTextures(rootElement) {
		let elem = rootElement["textures"];
		this.loadJsonItems(elem, 'texture', this.data.descriptors["texture"], [["type", "texture"]], this.data.addTexture)
	}

	/**
	 * Load the materials element
	 * @param {*} rootElement 
	 */
	loadMaterials(rootElement) {
		let elem = rootElement["materials"];
		this.loadJsonItems(elem, 'material', this.data.descriptors["material"], [["type", "material"]], this.data.addMaterial)
	}

	/**
	 * Load the cameras element
	 * @param {*} rootElement 
	 */
	loadCameras(rootElement) {
		let camerasElem = rootElement["cameras"];

		for (let key in camerasElem) {
			let elem = camerasElem[key];
			if (key == "initial") {
				this.data.setActiveCameraId(elem);
				continue;
			}

			let camType = elem["type"];
			if (camType == "orthogonal") {
				this.data.addCamera(this.loadJsonItem({
					key: key,
					elem: elem,
					descriptor: this.data.descriptors["orthogonal"],
					extras: [["type", "orthogonal"]]
				}));
			}
			else if (camType == "perspective") {
				this.data.addCamera(this.loadJsonItem({
					key: key,
					elem: elem,
					descriptor: this.data.descriptors["perspective"],
					extras: [["type", "perspective"]]
				}));
			}
			else {
				throw new Error("Unrecognized camera type '" + camType + "' in camera '" + key + "'");
			}
		}
	}

	/**
	 * Load the nodes element
	 * @param {*} rootElement 
	 */
	loadNodes(rootElement) {
		let graphElem = rootElement["graph"];

		const keys = new Set();
		for (let key in graphElem) {
			let elem = graphElem[key];

			if (key == "rootid") {
				this.data.setRootId(elem);
				continue;
			}

			if (keys.has(key)) {
				throw new Error("duplicate node id '" + key + "' in graph element");
			}
			for (const c of key) {
				if (!((c >= 'a' && c <= 'z') || c == '_' || (c >= '0' && c <= '9'))) {
					throw new Error("invalid node id '" + key + "' in graph element");
				}
			}
			keys.add(key);

			if (elem["type"] === "node") {
				this.loadNode(key, elem);
			} else if (elem["type"] === "lod") {
				this.loadLod(key, elem);
			} else {
				throw new Error("unrecognized node type '" + elem["type"] + "' in node '" + key + "'");
			}
		}
	}

	/**
	 * Load the data for a particular node elemment
	 * @param {*} nodeElement the xml node element
	 */
	loadNode(id, nodeElement) {
		let nodeType = nodeElement["type"];

		// get if node previously added (for instance because it was a child ref in other node)
		let obj = this.data.getNode(id);
		if (obj == null) {
			// otherwise add a new node
			obj = this.data.createEmptyNode(id);
		}

		obj.castshadows = this.getBoolean(nodeElement, "castshadows", false) || false;
		obj.receiveshadows = this.getBoolean(nodeElement, "receiveshadows", false) || false;

		// load transformations
		let transforms = nodeElement["transforms"];
		if (transforms !== null && transforms !== undefined) {
			this.loadTransforms(obj, transforms);
		}

		// load material refeences
		let materialsRef = nodeElement["materialref"];
		if (materialsRef != null) {
			if (materialsRef["materialId"] === null || materialsRef["materialId"] === undefined) {
				throw new Error("node " + id + " has a materialref but not a materialId");
			}

			let materialId = this.getString(materialsRef, "materialId");
			obj['materialIds'].push(materialId);
		}

		// load children (primitives or other node references)
		let children = nodeElement["children"];
		if (children == null) {
			throw new Error("in node " + id + ", a children node is required");
		}
		this.loadChildren(obj, children);
		obj.loaded = true;
	}

	loadLod(id, nodeElement) {
		let lodNodes = nodeElement["lodNodes"]
		const nodes = [];
		if (lodNodes != null) {
			for (const node of lodNodes) {
				const lod = this.loadJsonItem({
					key: id,
					elem: node,
					descriptor: this.data.descriptors["lod"],
					extras: []
				});

				let reference = this.data.getNode(lod.nodeId);
				if (reference === null) {
					// does not exist, yet. create it!
					reference = this.data.createEmptyNode(lod.nodeId);
				}

				node.node = reference;
				nodes.push(node);
			}
		} else {
			throw new Error("in node " + id + ", a lodNodes node is required");
		}

		let obj = this.data.getLod(id);
		if (obj == null) {
			// otherwise add a new lod
			obj = this.data.createEmptyLod(id);
		}

		obj["lodNodes"] = nodes;
		obj.loaded = true;
	}

	/**
	 * Load the transformations for a particular node element
	 * @param {*} obj the node object
	 * @param {*} transformsElement the transforms xml element
	 * @returns 
	 */
	loadTransforms(obj, transformsElement) {
		let order = ["translate", "rotate", "scale"];
		let providedOrder = transformsElement.map(transform => transform["type"]);

		for (let i = 0; i < providedOrder.length; i++) {
			if (!order.includes(providedOrder[i])) {
				throw new Error("Node " + obj.id + ": unrecognized transformation " + providedOrder[i] + ".");
			}
			if (order.indexOf(providedOrder[i]) < order.indexOf(providedOrder[i - 1])) {
				throw new Error("Node " + obj.id + ": transformations must be in the order: translate, rotate, scale.");
			}
		}

		for (let i in transformsElement) {
			const transform = transformsElement[i];
			const transformType = transform["type"];
			if (transformType == "translate") {
				let translate = this.getVector3(transform, "amount");
				// add a translation
				obj.transformations.push({ type: "T", translate: translate });
			}
			else if (transformType == "rotate") {
				let factor = this.getVector3(transform, "amount");
				// add a rotation
				obj.transformations.push({ type: "R", rotation: factor });
			}
			else if (transformType == "scale") {
				let factor = this.getVector3(transform, "amount");
				// add a scale
				obj.transformations.push({ type: "S", scale: factor });
			}
		}
	}

	/**
	 * Load the children for a particular node element
	 * @param {*} nodeObj the node object
	 * @param {*} childrenElement the xml children element
	 */

	loadChildren(nodeObj, childrenElement) {
		for (let child in childrenElement) {
			let childElement = childrenElement[child];
			const nodeType = childElement["type"];

			if (child === 'nodesList') {
				for (const node of childElement) {
					let reference = this.data.getNode(node);
					if (reference === null) {
						// does not exist, yet. create it!
						reference = this.data.createEmptyNode(node);
					}
					// reference it.
					this.data.addChildToNode(nodeObj, reference)
				}
			}
			else if (child === 'lodsList') {
				for (const lod of childElement) {
					let reference = this.data.getLod(lod);
					if (reference === null) {
						// does not exist, yet. create it!
						reference = this.data.createEmptyLod(lod);
					}
					// reference it.
					this.data.addLodToNode(nodeObj, reference)
				}
			}
			else if (this.data.primitiveIds.includes(nodeType)) {
				let primitiveObj = this.data.createEmptyPrimitive();
				this.loadPrimitive(childElement, primitiveObj, nodeType);
				this.data.addChildToNode(nodeObj, primitiveObj);
			}
			else if (this.data.lightIds.includes(nodeType)) {
				let lightObj = this.loadLight(child, childElement, nodeType)
				this.data.addChildToNode(nodeObj, lightObj)
			}
			else {
				throw new Error("unrecognized child type '" + nodeType + "'.");
			}
		}
	}

	/**
	 * Loads a light object into a new object
	 * @param {*} elem 
	 * @returns 
	 */
	loadLight(id, elem, lightType) {
		let descriptor = this.data.descriptors[lightType];
		let obj = this.loadJsonItem({
			elem: elem,
			key: id,
			descriptor: descriptor,
			extras: [["type", lightType]]
		})
		return obj;
	}

	/**
	 * For a given primitive element, loads the available representations into the primitive object
	 * @param {XML element} parentElem 
	 * @param {*} primitiveObj the primitive object to load data into
	 */
	loadPrimitive(parentElem, primitiveObj, primType) {
		const descriptor = this.data.descriptors[primType];

		const obj = this.loadJsonItem({
			elem: parentElem,
			descriptor: descriptor,
			extras: [["type", "primitive"], ["subtype", primType]]
		})

		primitiveObj.subtype = primType;
		primitiveObj.representations.push(obj);

		return;
	}

	loadBalloonsTransformations(rootElement) {
		const balloonsTransformationsElem = rootElement["balloons_transformations"];

		this.data["balloons_transformations"] = {};

		for (const [k,v] of Object.entries(balloonsTransformationsElem)) {
			this.data["balloons_transformations"][k] = v;
		}
	}

	loadTrack(rootElement) {
		const trackElem = rootElement["track"];

		this.data["track"] = {}

		this.loadRoutes(trackElem["routes"]);
		this.loadTrackObject(trackElem["powerups"], "powerups");
		this.loadTrackObject(trackElem["obstacles"], "obstacles");
	}

	loadRoutes(routesElem) {
		this.data["track"]["routes"] = []

		for (const route in routesElem) {
			const routeElem = routesElem[route];
			const points = []
			for (const point of routeElem) {
				points.push(this.getVectorN(point, ["x", "y", "z"]));
			}
			this.data["track"]["routes"][route] = points;
		}
	}

	loadTrackObject(trackObjectElem, key) {
		const points = []
		for (const obj of trackObjectElem) {
			const position = this.getVectorN(obj, ["x", "y", "z"]);
			points.push(position);
		}

		this.data["track"][key] = points;
	}

}

export { MyFileReader };
