
var pako = require("pako");
var atob = require("atob");
var btoa = require("btoa");

var CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("");

function toColor(v) {
    return [v, v, v, 255];
}

function fromColor(color) {
    
    if (color[0] !== color[1] || color[1] !== color[2]) {
        return -1;
    }
    
    return color[0];
}

function isDataPixel(color) {
    return color[3] === 255;
}

function dataToImage(data, sourceImage) {
    
    var result, pixels, imageData;
    var stringified = JSON.stringify(data);
    var compressed = pako.deflate(stringified, {to: "string"});
    var encoded = btoa(encodeURIComponent(compressed)).split("");
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var imageSize = Math.ceil(Math.sqrt(encoded.length));
    var drawn = 0;
    var width = imageSize;
    var height = imageSize;
    
    document.body.appendChild(canvas);
    
    if (sourceImage) {
        width = width < sourceImage.width ? sourceImage.width : width;
        height = height < sourceImage.height ? sourceImage.height : height;
        context.canvas.width = width;
        context.canvas.height = height;
        context.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);
    }
    else {
        context.fillStyle = "black";
        context.fillRect(0, 0, width, height);
    }
    
    imageData = context.getImageData(0, 0, width, height);
    context.canvas.width = width;
    context.canvas.height = height;
    pixels = imageData.data;
    
    eachColor(pixels, function (color, offset) {
        
        var encodedColor, random;
        
        if (isDataPixel(color)) {
            if (drawn < encoded.length) {
                encodedColor = toColor(CHARACTERS.indexOf(encoded[drawn]));
                pixels[offset] = encodedColor[0];
                pixels[offset + 1] = encodedColor[1];
                pixels[offset + 2] = encodedColor[2];
                drawn += 1;
            }
            else {
                random = Math.round(Math.random() * 64);
                pixels[offset] = random;
                pixels[offset + 1] = random;
                pixels[offset + 2] = random;
                pixels[offset + 3] = 254;
            }
        }
    });
    
    if (drawn < encoded.length) {
        throw new Error("Could not fit data inside image!");
    }
    
    context.putImageData(imageData, 0, 0);
    
    result = new Image();
    
    result.src = canvas.toDataURL("image/png");
    
    canvas.parentNode.removeChild(canvas);
    
    return result;
}

function imageToData(image) {
    
    var imageData;
    var data = [];
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
        
        if (isDataPixel(color)) {
            
            char = CHARACTERS[fromColor(color)];
            
            if (!char) {
                throw new Error("Data is corrupted!");
            }
            
            data.push(char);
        }
    });
    
    data = decodeURIComponent(atob(data.join("")));
    data = pako.inflate(data, {to: "string"});
    data = JSON.parse(data);
    
    canvas.parentNode.removeChild(canvas);
    
    return data;
}

function eachColor(data, fn) {
    
    var i, length;
    
    for (i = 0, length = data.length; i < length; i += 4) {
        fn([data[i], data[i + 1], data[i + 2], data[i + 3]], i);
    }
    
    return data;
}

module.exports = {
    dataToImage: dataToImage,
    imageToData: imageToData
};
