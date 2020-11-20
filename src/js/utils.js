function getImageSizeForRendering(img, canvas) {

    const size = {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    };

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    if (imgWidth > canvasWidth || imgHeight > canvasHeight) {
        if (imgWidth/imgHeight > canvasWidth/canvasHeight) {
            size.w = canvasWidth;
            size.h = canvasWidth / imgWidth * imgHeight;
        } else {
            size.h = canvasHeight;
            size.w = canvasHeight / imgHeight * imgWidth;
        }
    }
    else {
        size.w = imgWidth;
        size.h = imgHeight;
    }
    // get the top left position of the image
    size.x = (canvasWidth - size.w) / 2;
    size.y = (canvasHeight - size.h) / 2;
    return size;
}

function getActualCoordsForRendering(img, box, parentSize) {

    const widthRatio = parentSize.w / img.naturalWidth;
    const heightRatio = parentSize.h / img.naturalHeight

    const size = {
        x: box.x * widthRatio + parentSize.x,
        y: box.y * heightRatio + parentSize.y,
        w: box.w * widthRatio,
        h: box.h * heightRatio
    };

    return size;
}


function loadImageInformation(ctx, img, url, data) {
    
    img.onload = function() {
        const imgSize = getImageSizeForRendering(img, canvas);
        //ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, imgSize.x, imgSize.y, imgSize.w, imgSize.h);
        //ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        if (data.faces) {
            
            const sizes = data.faces.map(el => {
                const {faceRectangle} = el;
                const faceSize = {
                    x: faceRectangle.left,
                    y: faceRectangle.top,
                    w: faceRectangle.width,
                    h: faceRectangle.height
                };
                return getActualCoordsForRendering(img, faceSize, imgSize)
            });
            sizes.forEach(s => ctx.strokeRect(s.x, s.y, s.w, s.h));
            
        }
        if (data.objects) {
            const sizes = data.objects.map(el => {
                const {rectangle} = el;
                return getActualCoordsForRendering(img, rectangle, imgSize);
            })
            sizes.forEach(s => ctx.strokeRect(s.x, s.y, s.w, s.h));
        }       
    };
    
    img.src = url;
}

export default {
    getImageSizeForRendering,
    getActualCoordsForRendering,
    loadImageInformation
};