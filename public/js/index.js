document.addEventListener('DOMContentLoaded', function () {

    // Reference the canvas context used for drawing.
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var image;
    var top = "", bottom = "";
    var filename = 'meme.jpg';

    // Prepare DOM
    var topInput = document.getElementById('top');
    topInput.oninput = textWatcher;
    var bottomInput = document.getElementById('bottom');
    bottomInput.oninput = textWatcher;  

    var form = document.getElementById('form');
    form.addEventListener('submit', function (event) {
        // Don't redirect
        event.preventDefault();
        console.log('Form submitted');
        // Clear inputs
        topInput.value = '';
        top = '';
        bottomInput.value = '';
        bottom = '';
    });

    var submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', function () {
        var formData = new FormData(document.getElementById("form"));
        uploadImage(formData, false);
    });

    var downloadLink = document.getElementById('download');
    downloadLink.addEventListener('click', function () {
        downloadImage(this);
    }, false);


    /** Displays the image on the Canvas **/
    function drawImage() {
        console.log('Image loaded');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    /**Hidden function that inverts the colors for negative effect **/
    function invertColors() {
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // Red, Green, Blue & Alpha
        var numPixels = imageData.data.length / 4;

        for (var i = 0; i < numPixels; i++) {
            // Complementary colors
            imageData.data[i * 4 + 0] = 255 - imageData.data[i * 4 + 0];   //Red
            imageData.data[i * 4 + 1] = 255 - imageData.data[i * 4 + 1];   //Green
            imageData.data[i * 4 + 2] = 255 - imageData.data[i * 4 + 2];   //Blue
        }
        context.putImageData(imageData, 0, 0);
    }

    /** Writes text above canvas **/
    function drawText(string, x, y) {
        context.font = '36pt Impact';
        context.strokeStyle = 'black'
        context.lineWidth = 5;
        context.textAlign = 'center' // combined with canvas.width/2 centers text
        context.strokeText(string, x, y);
        context.fillStyle = 'white';
        context.fillText(string, x, y);
    }

    /** Uploads the image to the server */
    function uploadImage(formData, silent) {
        console.log('Uploading image to Server');
        // Create request with the form data
        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/upload', true);
        // Response handler
        xhr.onload = function (event) {
            console.log(`Server response: ${event.target.response}`);
            if (silent != true) {
                filename = event.target.response;
                getImage(event.target.response);
            }
        };
        // Make request
        xhr.send(formData);
    }

    /** Obtains the image from the server */
    function getImage(filename) {
        image = new Image();
        image.onload = drawImage;
        image.src = filename;
    }

    /** Downloads the canvas as image */
    function downloadImage(link) {
        console.log('Downloading image');
        link.href = canvas.toDataURL();
        link.download = filename;
        // Upload a copy to the server
        canvas.toBlob(function (blob) {
            var formdata = new FormData();
            formdata.set('file', blob, filename);
            uploadImage(formdata, true);
        })
    }

    /** Listens for typing on input boxes **/
    function textWatcher(event) {
        var id = event.target.id;
        var text = event.target.value;
        // Assign the text to the correct variable
        if (id == "top") {
            top = text;
        } else {
            bottom = text;
        }
        // Redraw canvas per key-stroke
        drawMeme(top, bottom);
    }

    /** Draws the image and text into meme  **/
    function drawMeme(top, bottom) {
        drawImage(); // Uses the global image variable
        drawText(top, canvas.width / 2, 50);
        drawText(bottom, canvas.width / 2, 490);
    }

    // Starter image
    getImage('rollsafe.jpg');

});

