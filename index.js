
var atob = require("atob");
var btoa = require("btoa");
var PNG = require("pngjs").PNG;

var utils = require("./utils").create({
    atob: atob,
    btoa: btoa,
    createImage: function (width, height) {
        return new PNG({
            width: width,
            height: height
        });
    }
});

function write(data, sourceImageStream, then) {
    
    var encoded = utils.encodeData(data);
    var imageSize = utils.calculateSize(encoded);
    var width = imageSize;
    var height = imageSize;
    
    then = then ? then : sourceImageStream;
    sourceImageStream = arguments.length < 3 ? undefined : sourceImageStream;
    
    if (sourceImageStream) {
        sourceImageStream.pipe(new PNG()).
            on('parsed', function () { processPixels(this); }).
            on("error", then);
    }
    else {
        processPixels(utils.createSourceImage(width, height));
    }
    
    function processPixels(image) {
        
        try {
            utils.writeEncodedDataToPixelArray(encoded, image.data);
        }
        catch (error) {
            then(error);
            return;
        }
        
        then(null, image.pack());
    }
    
}

function read(inputStream, then) {
    
    inputStream.pipe(new PNG()).on("parsed", function (imageData) {
        
        var data;
        
        try {
            data = utils.readFromPixelArray(imageData);
        }
        catch (error) {
            then(error);
            return;
        }
        
        then(null, data);
    });
    
}

module.exports = {
    write: write,
    read: read
};
