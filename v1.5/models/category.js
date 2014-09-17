//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//

// Parse Category
exports.parse = function(json) {
	//If the data is the type string is pased to json
	if ('string' == typeof json){
		json = JSON.parse(json);
	}
  
	//Object declaration
	var category = {};
	
	//Attributes
	category.id = json.id;
	category.name = json.name;
	category.parent = json.parent;
	category.type = json.type;
	
	return category;
}