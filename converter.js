
var pako = require("pako");
var atob = require("atob");
var btoa = require("btoa");

var CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("");

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
        width = sourceImage.width;
        height = sourceImage.height;
        context.canvas.width = width;
        context.canvas.height = height;
        context.drawImage(sourceImage, 0, 0, width, height);
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
        
        var red, green, blue;
        
        if (isDataPixel(color)) {
            if (drawn < encoded.length) {
                
                red = 1 + CHARACTERS.indexOf(encoded[drawn]);
                green = 1 + CHARACTERS.indexOf(encoded[drawn + 1]);
                blue = 1 + CHARACTERS.indexOf(encoded[drawn + 2]);
                
                pixels[offset] = red;
                pixels[offset + 1] = green;
                pixels[offset + 2] = blue;
                
                drawn += 3;
            }
            else {
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
        
        var char, i;
        
        if (isDataPixel(color)) {
            
            for (i = 0; i < 3; i += 1) {
                
                char = CHARACTERS[color[i] - 1];
                
                if (char) {
                    data.push(char);
                }
            }
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
