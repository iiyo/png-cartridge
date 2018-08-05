/* global Uint8Array */

var utils = require("./utils").create({
    atob: window.atob,
    btoa: window.btoa,
    createImage: function (width, height) {
        return {
            width: width,
            height: height,
            data: new Uint8Array(width * height * 4)
        };
    }
});

function imageToImageData(image) {
    
    var context;
    var canvas = document.createElement('canvas');
    
    context = canvas.getContext('2d');
    context.canvas.width = image.naturalWidth;
    context.canvas.height = image.naturalHeight;
    
    context.drawImage(image, 0, 0);
    
    return context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
}

function imageDataToImage(imageData) {
    
    var image = new Image();
    
    image.src = imageDataToDataURL(imageData);
    
    return image;
}

function imageDataToDataURL(imageData) {
    
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    
    context.canvas.width = imageData.width;
    context.canvas.height = imageData.height;
    
    context.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL("image/png");
}

function prepareSourceImageData(encodedData, sourceImage) {
    
    var imageData, size;
    
    if (sourceImage) {
        imageData = imageToImageData(sourceImage);
    }
    else {
        size = utils.calculateSize(encodedData);
        imageData = pngToImageData(utils.createSourceImage(size, size));
    }
    
    return imageData;
}

function writeImage(data, sourceImage) {
    
    var encodedData = utils.encodeData(data);
    var imageData = prepareSourceImageData(encodedData, sourceImage);
    
    utils.writeToPixelArray(data, imageData.data);
    
    return imageDataToImage(imageData);
}

function readImage(image) {
    return utils.readFromPixelArray(imageToImageData(image).data);
}

function pngToImageData(png) {
    
    var imageData;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    
    context.canvas.width = png.width;
    context.canvas.height = png.height;
    
    imageData = context.getImageData(0, 0, png.width, png.height);
    
    png.data.forEach(function (value, i) {
        imageData.data[i] = value;
    });
    
    return imageData;
}

module.exports = {
    readImage: readImage,
    writeImage: writeImage,
    writeToPixelArray: utils.writeToPixelArray,
    readFromPixelArray: utils.readFromPixelArray,
    imageToImageData: imageToImageData,
    imageDataToImage: imageDataToImage,
    imageDataToDataURL: imageDataToDataURL
};
