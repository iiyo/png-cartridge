
var converter = require("./converter");
var image = document.querySelector(".result");
var submit = document.querySelector(".submit");
var revert = document.querySelector(".revert");

function render() {
    
    var input = document.querySelector(".input").value;
    
    image.src = converter.dataToImage(input).src;
}

function parse() {
    
    var input = document.querySelector(".input");
    var output = document.querySelector(".output");
    var data = converter.imageToData(image);
    
    console.log(data);
    
    output.value = data;
    
    if (input.value !== output.value) {
        alert("Output does not match input!");
    }
}

submit.addEventListener("click", render);
revert.addEventListener("click", parse);
