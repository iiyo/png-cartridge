# png-cartridge

A JavaScript library that enables you to use PNG images as virtual
cartridges to store data.

## Installation

    npm install --save png-cartridge

If you want to use the library in the browser without a CommonJS packager like browserify you
can add it as a script tag:

```html
<script src="node_modules/png-cartridge/dist/bundle.js"></script>
```

This exports the library as a global variable called `cartridge`.

## Example cartridges

These images contain the source code of the library:

Just plain data, without using a source image:

![Plain cartridge without pretty source image](example/plain.png)

With a source image:

![Cartridge created with a source image](example/cartridge.png)


## Console Usage

Install globally:

    npm install -g png-cartridge

Writing data from a JSON file into a raw data image:

    cartridge write data.json > data.png

Writing data into a source image:

    cartridge write data.json source.png > data.png

Reading data from an image into a JSON file:

    cartridge read data.png > data.json


## Reading/Writing DOM Images

Creating a cartridge:

```js
var cartridge = require("png-cartridge/browser");

//
// The `save` function creates an Image instance with a data URI as its `src`.
//
var image = cartridge.writeImage({
    foo: "bar"
});

document.body.appendChild(image);
```

You can also use a source image to beautify the resulting image:

```js
var template = document.querySelector(".source-image");
var image = cartridge.writeImage(data, template);
```

Loading data from an image works like this:

```js
var source = document.querySelector(".cartridge-image");
var data = cartridge.readImage(source);

console.log(data);
```

## Stream API (Node)

On Node you can use the `read` and `write` methods with streams like this:

```js
var fs = require("fs");
var cartridge = require("png-cartridge");

var data = {
    foo: "bar"
};

// Writing plain data image:
cartridge.write(data, onFinish);

// Writing pretty data image using a source image:
cartridge.write(data, fs.createReadStream("source.png"), onFinish);

function onFinish(error, dataStream) {
    if (error) {
        console.error(error);
    }
    else {
        dataStream.pipe(fs.createWriteStream("data.png"));
    }
}

// Reading data from an image:
cartridge.read(fs.createReadStream("data.png"), function (error, data) {
    if (error) {
        console.error(error);
    }
    else {
        console.log(data);
    }
});
```

## How it works

Data is stored in the red, green and blue channels of each pixel with an alpha value
of `255`. You can either create an ugly data-only image from scratch or supply
your own source image.

Supplying your own source image is useful if you need something pretty. Just make sure
that all the pixels of your image that shouldn't be used as data have an alpha value
of `254` or less. The data appears in the resulting images as dark noise.

Data to be stored in a PNG cartridge is stringified to JSON, compressed using zlib (pako) and
then saved as base64 data. Each data pixel stores 3 base64 characters.


## Changelog

* v2.0.0:
  * Adds stream API
  * Adds Node.js support
  * Adds CLI
  * Improves performance
