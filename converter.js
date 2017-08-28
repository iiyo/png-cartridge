/* global Buffer */

var pako = require("pako");
var atob = require("atob");
var btoa = require("btoa");

var SEPARATOR_COLOR = [255, 0, 0, 255];
var IGNORE_COLOR = [255, 255, 255, 255];
var CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("");

function toColor(v) {
    return [0, 0, 150 + v, 255];
}

function fromColor(color) {
    
    if (color[0] || color[1] || color[3] != 255) {
        return -1;
    }
    
    return color[2] - 150;
}

function isSeparator(color) {
    return (
        color[0] === SEPARATOR_COLOR[0] &&
        color[1] === SEPARATOR_COLOR[1] &&
        color[2] === SEPARATOR_COLOR[2] &&
        color[3] === SEPARATOR_COLOR[3]
    );
}

function isIgnoreColor(color) {
    return (
        color[0] === IGNORE_COLOR[0] &&
        color[1] === IGNORE_COLOR[1] &&
        color[2] === IGNORE_COLOR[2] &&
        color[3] === IGNORE_COLOR[3]
    );
}

function dataToImage(data) {
    
    var result;
    var lastIndex = 0;
    var stringified = JSON.stringify(data);
    var compressed = pako.deflate(stringified, {to: "string"});
    var encoded = btoa(encodeURIComponent(compressed)).split("");
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var imageSize = Math.ceil(Math.sqrt(encoded.length));
    var imageData = context.createImageData(imageSize, imageSize);
    var pixels = imageData.data;
    
    context.canvas.width = imageSize;
    context.canvas.height = imageSize;
    
    document.body.appendChild(canvas);
    
    context.fillStyle = "white";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    
    pixels[0] = SEPARATOR_COLOR[0];
    pixels[1] = SEPARATOR_COLOR[1];
    pixels[2] = SEPARATOR_COLOR[2];
    pixels[3] = SEPARATOR_COLOR[3];
    
    encoded.forEach(function (char, i) {
        
        var color;
        var offset = (i * 4) + 4;
        var index = CHARACTERS.indexOf(char);
        
        if (index >= 0) {
            color = toColor(index);
        }
        else {
            color = IGNORE_COLOR;
        }
        
        pixels[offset] = color[0];
        pixels[offset + 1] = color[1];
        pixels[offset + 2] = color[2];
        pixels[offset + 3] = color[3];
        
        lastIndex = offset + 3;
    });
    
    pixels[lastIndex + 1] = SEPARATOR_COLOR[0];
    pixels[lastIndex + 2] = SEPARATOR_COLOR[1];
    pixels[lastIndex + 3] = SEPARATOR_COLOR[2];
    pixels[lastIndex + 4] = SEPARATOR_COLOR[3];
    
    context.putImageData(imageData, 0, 0);
    
    result = new Image();
    
    result.src = canvas.toDataURL("image/png");
    
    canvas.parentNode.removeChild(canvas);
    
    return result;
}

function imageToData(image) {
    
    var imageData, currentData;
    var dataFields = [];
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var width = image.width;
    var height = image.height;
    
    context.canvas.width = width;
    context.canvas.height = height;
    
    document.body.appendChild(canvas);
    
    context.drawImage(image, 0, 0);
    
    imageData = context.getImageData(0, 0, width, height);
    
    eachColor(imageData.data, function (color) {
        
        var char;
        
        if (!currentData && isSeparator(color)) {
            console.log("Start of data field.");
            currentData = [];
        }
        else if (currentData && isSeparator(color)) {
            
            console.log("End of data field.");
            
            currentData = decodeURIComponent(atob(currentData.join("")));
            currentData = pako.inflate(currentData, {to: "string"});
            currentData = JSON.parse(currentData);
            
            dataFields.push(currentData);
            
            currentData = undefined;
        }
        else if (currentData) {
            
            if (isIgnoreColor(color)) {
                return;
            }
            
            char = CHARACTERS[fromColor(color)];
            
            if (!char) {
                throw new Error("Data field " + (dataFields.length + 1) + " is corrupted!");
            }
            
            currentData.push(char);
        }
    });
    
    if (currentData) {
        throw new Error("Unclosed data field.");
    }
    
    canvas.parentNode.removeChild(canvas);
    
    return dataFields;
}

function eachColor(data, fn) {
    
    var i, length;
    
    for (i = 0, length = data.length; i < length; i += 4) {
        fn([data[i], data[i + 1], data[i + 2], data[i + 3]]);
    }
    
    return data;
}

module.exports = {
    dataToImage: dataToImage,
    imageToData: imageToData
};
