var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
const MAX_METHOD_LINE = 50;
var status=true;
var path = require('path');
function main()
{
	var args = process.argv.slice(2);
	var filePath = [
		__dirname + "\\..\\routes\\admin.js",
		__dirname +"\\..\\routes\\create.js",
		__dirname +"\\..\\routes\\csv.js",
		__dirname +"\\..\\routes\\designer.js",
		__dirname +"\\..\\routes\\live.js",
		__dirname +"\\..\\routes\\study.js",
		__dirname +"\\..\\routes\\studyModel.js",
		__dirname +"\\..\\routes\\upload.js",
		__dirname +"\\..\\marqdown.js"
	];
	
/*
if(a>b){

}
if(a>c){

}
*/

	for (var i = 0; i < filePath.length; i++) {
		complexity(filePath[i]);
	}

	// Report
	for( var node in builders )
	{
		var builder = builders[node];
		builder.report();
	}
}

var builders = {};

// Represent a reusable "class" following the Builder pattern.
function FunctionBuilder()
{
	this.loc = 0;
	this.FunctionName = "";
	// The number of parameters for functions
	this.ParameterCount  = 0,
	// Number of if statements/loops + 1
	this.SimpleCyclomaticComplexity = 0;
	// // The max number of conditions if one decision statement.
  this.MaxConditions = 0;
  // The number of times a method exceeds 50 lines long.
  this.LongMethod = 0;

	this.report = function()
	{
		console.log(
		   (
		   	"{0}(): {1}\n" +
		   	"============\n" +
			   "SimpleCyclomaticComplexity: {2}\t" +
				 "MaxConditions: {3}\t" +
         "Parameters: {4}\t" +
         "LongMethods: {5}\n\n"
			)
			.format(this.FunctionName, this.StartLine,
						 this.SimpleCyclomaticComplexity, this.MaxConditions,
						 this.ParameterCount, this.LongMethod)
		);
	}
};

// A builder for storing file level information.
function FileBuilder()
{
	this.FileName = "";

	this.report = function()
	{
		console.log (
			( "{0}\n" +
			  "~~~~~~~~~~~~\n"
			).format( this.FileName));
	}
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}

function complexity(filePath)
{
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);

	// A file level-builder:
	var fileBuilder = new FileBuilder();
	fileBuilder.FileName = filePath;
	fileBuilder.ImportCount = 0;
	builders[filePath] = fileBuilder;

	// Tranverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var builder = new FunctionBuilder();

			builder.FunctionName = functionName(node);
			builder.StartLine    = node.loc.start.line;
			builder.ParameterCount = node.params.length;
			builder.loc = node.loc.end.line - node.loc.start.line;
			var mConditions = 0;
			var operatorCount = 0;
			
			if (builder.loc > MAX_METHOD_LINE) {
				builder.LongMethod++;
			}
			
			if (builder.loc>80)
			{
				status=false;
			}

			if(builder.ParameterCount<2){
				status=false;
			}
			if(builder.MaxConditions>5){
				status=false;
			}
				
			traverseWithParents(node, function (child) 
			{
				if (isDecision(child))
				{
					builder.SimpleCyclomaticComplexity++;
				}

				if (child.type == "IfStatement") {
					traverseWithParents(child, function (grandchild) {
						if(isCondition(grandchild)) {
							operatorCount++;
						}
						mConditions = Math.max(mConditions, operatorCount);
					});
					builder.MaxConditions = mConditions;
				}
				operatorCount = 0;
			});
			builder.SimpleCyclomaticComplexity++;
			builders[builder.FunctionName] = builder;
		}
	});
}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function for checking the maximum number of conditions in an if statement
function isCondition(node)
{
	if( node.operator == '&&' || node.operator == '||')
	{
		return true;
	}
	return false;
}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function analyse(){
	main();
	return status
}

analyse()

exports.main = main;
 
module.exports = {analyse: analyse}