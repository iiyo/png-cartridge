
var inflate = require("pako/lib/inflate").inflate;
var deflate = require("pako/lib/deflate").deflate;

var CHAR_TO_INDEX = {
    "0": 52,
    "1": 53,
    "2": 54,
    "3": 55,
    "4": 56,
    "5": 57,
    "6": 58,
    "7": 59,
    "8": 60,
    "9": 61,
    "A": 0,
    "B": 1,
    "C": 2,
    "D": 3,
    "E": 4,
    "F": 5,
    "G": 6,
    "H": 7,
    "I": 8,
    "J": 9,
    "K": 10,
    "L": 11,
    "M": 12,
    "N": 13,
    "O": 14,
    "P": 15,
    "Q": 16,
    "R": 17,
    "S": 18,
    "T": 19,
    "U": 20,
    "V": 21,
    "W": 22,
    "X": 23,
    "Y": 24,
    "Z": 25,
    "a": 26,
    "b": 27,
    "c": 28,
    "d": 29,
    "e": 30,
    "f": 31,
    "g": 32,
    "h": 33,
    "i": 34,
    "j": 35,
    "k": 36,
    "l": 37,
    "m": 38,
    "n": 39,
    "o": 40,
    "p": 41,
    "q": 42,
    "r": 43,
    "s": 44,
    "t": 45,
    "u": 46,
    "v": 47,
    "w": 48,
    "x": 49,
    "y": 50,
    "z": 51,
    "+": 62,
    "/": 63,
    "=": 64
};

var INDEX_TO_CHAR = {
    "0": "A",
    "1": "B",
    "2": "C",
    "3": "D",
    "4": "E",
    "5": "F",
    "6": "G",
    "7": "H",
    "8": "I",
    "9": "J",
    "10": "K",
    "11": "L",
    "12": "M",
    "13": "N",
    "14": "O",
    "15": "P",
    "16": "Q",
    "17": "R",
    "18": "S",
    "19": "T",
    "20": "U",
    "21": "V",
    "22": "W",
    "23": "X",
    "24": "Y",
    "25": "Z",
    "26": "a",
    "27": "b",
    "28": "c",
    "29": "d",
    "30": "e",
    "31": "f",
    "32": "g",
    "33": "h",
    "34": "i",
    "35": "j",
    "36": "k",
    "37": "l",
    "38": "m",
    "39": "n",
    "40": "o",
    "41": "p",
    "42": "q",
    "43": "r",
    "44": "s",
    "45": "t",
    "46": "u",
    "47": "v",
    "48": "w",
    "49": "x",
    "50": "y",
    "51": "z",
    "52": "0",
    "53": "1",
    "54": "2",
    "55": "3",
    "56": "4",
    "57": "5",
    "58": "6",
    "59": "7",
    "60": "8",
    "61": "9",
    "62": "+",
    "63": "/",
    "64": "="
};

function create(dependencies) {
    
    var atob = dependencies.atob;
    var btoa = dependencies.btoa;
    var createImage = dependencies.createImage;
    
    function eachPixel(data, fn) {
        
        var i, length;
        
        for (i = 0, length = data.length; i < length; i += 4) {
            fn([data[i], data[i + 1], data[i + 2], data[i + 3]], i);
        }
        
        return data;
    }
    
    function createSourceImage(width, height) {
        
        var png = createImage(width, height);
        
        eachPixel(png.data, function (color, offset) {
            png.data[offset] = 0; // Red
            png.data[offset + 1] = 0; // Green
            png.data[offset + 2] = 0; // Blue
            png.data[offset + 3] = 255; // Alpha
        });
        
        return png;
    }
    
    function encodeData(data) {
        
        var stringified = JSON.stringify(data);
        var compressed = deflate(stringified, {to: "string"});
        
        return btoa(encodeURIComponent(compressed)).split("");
    }
    
    function calculateSize(data) {
        return Math.ceil(Math.sqrt(data.length / 3));
    }
    
    function isDataPixel(color) {
        return color[3] === 255;
    }
    
    function writeToPixelArray(data, pixelArray) {
        return writeEncodedDataToPixelArray(encodeData(data), pixelArray);
    }
    
    function writeEncodedDataToPixelArray(encoded, pixelArray) {
        
        var drawn = 0;
        
        eachPixel(pixelArray, function (color, offset) {
                
            var red, green, blue;
            
            if (isDataPixel(color)) {
                if (drawn < encoded.length) {
                    
                    red = 1 + CHAR_TO_INDEX[encoded[drawn]];
                    green = 1 + CHAR_TO_INDEX[encoded[drawn + 1]];
                    blue = 1 + CHAR_TO_INDEX[encoded[drawn + 2]];
                    
                    pixelArray[offset] = red;
                    pixelArray[offset + 1] = green;
                    pixelArray[offset + 2] = blue;
                    
                    drawn += 3;
                }
                else {
                    pixelArray[offset + 3] = 254;
                }
            }
        });
        
        if (drawn < encoded.length) {
            throw new Error("Could not fit data inside image!");
        }
        
        return pixelArray;
    }
    
    function readFromPixelArray(imageData) {
        
        var i, length, char;
        var data = [];
        
        for (i = 0, length = imageData.length; i < length; i += 4) {
            
            if (imageData[i + 3] === 255) {
                
                char = INDEX_TO_CHAR[imageData[i] - 1];
                    
                if (char) {
                    data[data.length] = char;
                }
                
                char = INDEX_TO_CHAR[imageData[i + 1] - 1];
                    
                if (char) {
                    data[data.length] = char;
                }
                
                char = INDEX_TO_CHAR[imageData[i + 2] - 1];
                    
                if (char) {
                    data[data.length] = char;
                }
            }
        }
        
        data = decodeURIComponent(atob(data.join("")));
        data = inflate(data, {to: "string"});
        data = JSON.parse(data);
        
        return data;
    }
    
    return {
        eachPixel: eachPixel,
        encodeData: encodeData,
        calculateSize: calculateSize,
        createSourceImage: createSourceImage,
        writeToPixelArray: writeToPixelArray,
        readFromPixelArray: readFromPixelArray,
        writeEncodedDataToPixelArray: writeEncodedDataToPixelArray
    };
}

module.exports = {
    create: create
};
