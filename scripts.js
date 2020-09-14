const photoFile = document.getElementById('photo-file');
let photoPreview = document.getElementById('photo-preview');
let image;
let photoName;

// Select and Preview image

document.getElementById('select-image')
.onclick = function() {
    photoFile.click()
}

window.addEventListener('DOMContentLoaded', () => {
    photoFile.addEventListener('change', () => {
        let file = photoFile.files.item(0)
        photoName = file.name;
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function(event) {
            image = new Image();
            image.src = event.target.result;
            image.onload = onLoadImage;
        }
    })
})

// selection tool

const selection = document.getElementById('selection-tool');

let startX, startY, relativeStartX, relativeStartY,
endX, endY, relativeEndX, relativeEndY;
let startSelection = false;
const events = {
    mouseover() {
        this.style.cursor ='crosshair'
    },
    mousedown() {
        const {clientX, clientY, offsetX, offsetY} = event; 
        startX = clientX;
        startY = clientY;
        relativeStartX = offsetX;
        relativeStartY = offsetY;

        startSelection = true;
    },
    mousemove() {
        endX = event.clientX;
        endY = event.clientY;

        if(startSelection) {
            selection.style.display = 'initial';
            selection.style.top = startY + 'px';
            selection.style.left = startX + 'px';
            selection.style.width = (endX - startX) + 'px';
            selection.style.height = (endY - startY) + 'px';

        }
    },
    mouseup() {
        startSelection = false;
        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        //mostrar botão
        cropButton.style.display = 'initial';
    }
}
Object.keys(events)
.forEach((eventName) => {
    photoPreview.addEventListener(eventName, events[eventName])
})

// Canvas
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

function onLoadImage() {
    const {width, height} = image;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(image, 0, 0);

    photoPreview.src = canvas.toDataURL();
}

// Cortar imagem

const cropButton = document.getElementById('crop-image');
cropButton.onclick = () => {
    const { width: imageW, height: imageH} = image;
    const { width:previewW, height: previewH} = photoPreview;

    const [widthFactor, heightFactor] = [
        +(imageW / previewW),
        +(imageH / previewH)
    ]

    const [ selectionWidth, selectionHeight] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]

    const [ croppedWidth, croppedHeight] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [actualX, actualY] = [
        +(relativeStartX * widthFactor),
        +(relativeStartY * heightFactor)
    ]

    //pegar do ctx a imagem cortada
    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    //limpar o ctx
    ctx.clearRect(0,0, ctx.width, ctx.height)

    //ajuste de proprorções
    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight;

    //adicionar a imagem cortada ao canvas
    ctx.putImageData(croppedImage, 0, 0)

    //esconder a ferramenta de seleção
    selection.style.display = 'none';

    //atualizar preview da imagem
    photoPreview.src = canvas.toDataURL();

    // download
    const downloadButton = document.getElementById('download')
    download.style.display = 'initial';
    downloadButton.onclick = function() {
        const a = document.createElement('a');
        a.download = photoName + '-cropped.png';
        a.href = canvas.toDataURL();
        a.click()
    }
}