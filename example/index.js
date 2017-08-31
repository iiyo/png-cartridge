
var cartridge = require("./cartridge");
var image = document.querySelector(".result");
var sourceImage = document.querySelector(".source-image");
var submit = document.querySelector(".submit");
var revert = document.querySelector(".revert");
var fileInput = document.querySelector(".file");
var downloadLink = document.querySelector(".download")

fileInput.addEventListener("change", function (event) {
    readFile(event.target.files[0]);
});

function readFile(file) {
    
    var reader = new FileReader();
    
    reader.onload = function (event) {
        image.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
}

function render() {
    
    var input = document.querySelector(".input").value;
    
    image.src = cartridge.save(input, sourceImage).src;
    downloadLink.href = image.src;
}

function parse() {
    
    var output = document.querySelector(".output");
    var data = cartridge.load(image);
    
    output.value = data;
}

function check() {
    
    var input = document.querySelector(".input");
    var output = document.querySelector(".output");
    
    if (input.value !== output.value) {
        alert("Output does not match input!");
    }
}

submit.addEventListener("click", render);

revert.addEventListener("click", function () {
    parse();
    check();
});
