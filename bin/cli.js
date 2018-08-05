#!/usr/bin/env node

/* global process */
/* eslint-disable no-console */

var fs = require("fs");
var path = require("path");
var cartridge = require("../index");
var args = process.argv;
var command = args[2];

if (command === "read") {
    if (args[3]) {
        parse();
    }
    else {
        console.error("ERROR: No input image specified!");
    }
}
else if (command === "write") {
    if (!args[3]) {
        console.error("ERROR: No data file specified as input!");
    }
    else {
        pack();
    }
}
else {
    console.log("Usage: (1) png-cartridge read [path to PNG image] > data.json");
    console.log("       (2) png-cartridge write [JSON file] [optional input PNG] > cartridge.png");
}

function parse() {
    
    var imageFile = path.join(process.cwd(), args[3]);
    
    cartridge.read(fs.createReadStream(imageFile), function (error, data) {
        if (error) {
            console.error(error);
        }
        else {
            console.log(JSON.stringify(data, null, 4));
        }
    });
}

function pack() {
    
    var jsonFile = path.join(process.cwd(), args[3]);
    var inputImage = args[4] ? path.join(process.cwd(), args[4]) : undefined;
    var json = JSON.parse("" + fs.readFileSync(jsonFile));
    
    if (inputImage) {
        cartridge.write(json, fs.createReadStream(inputImage), onFinish);
    }
    else {
        cartridge.write(json, onFinish);
    }
    
    function onFinish(error, dataStream) {
        if (error) {
            console.error(error);
        }
        else {
            dataStream.pipe(process.stdout);
        }
    }
}
