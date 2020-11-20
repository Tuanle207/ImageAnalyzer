import callApi from './api.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
let url = '';
const baseURL = 'http://southeastasia.api.cognitive.microsoft.com/vision/v3.1/analyze?';

canvas.width = 1000;
canvas.height = 800;

const visualFeatures = ['Adult', 'Brands', 'Categories', 'Color', 'Description', 'Faces', 'ImageType', 'Objects', 'Tags'];
const details = ['Celebrities', 'Landmarks'];

initUI();

document.querySelector('#url').addEventListener('change', function(e) {    
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const imgSize = getImageSizeForRendering(img, canvas);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, imgSize.x, imgSize.y, imgSize.w, imgSize.h);
    };
    img.onerror = function() {
        img.src = '/assets/default-image.png';
    }
    img.src = e.target.value;
    url = e.target.value;
});

document.querySelector('#callApiBtn').addEventListener('click', async function() {
   
    // change ui state to fetching data
    console.log('fetching data...');
    document.querySelector('#callApiBtn').style['pointer-events'] = 'none';
    document.querySelector('#callApiBtn > svg > use').setAttribute('href', '/assets/sprites.svg#icon-spinner');
    document.querySelector('#callApiBtn > svg').classList.toggle('active');

    // get parameters
    const params = getParams();

    // display request info
    const visualFeatures = params && params.visualFeatures.length > 0 ? params.visualFeatures.join(',') : '';
    const details = params && params.details.length > 0 ? params.details.join(',') : '';
    document.querySelector('.request__url > p:last-child').textContent = `${baseURL}visualFeatures=${visualFeatures}&details=${details}`;
    document.querySelector('.request__body > textarea').textContent = JSON.stringify({url: url}, undefined, 4);

    // call api
    const res = await callApi(baseURL, url, params);
    const data = await res.json();

    document.querySelector('.response').textContent = JSON.stringify(data, undefined, 4);

    console.log('success...');
    console.log(data);
    loadImageInformation(ctx, img, url, data);


    // change ui state to normal
    document.querySelector('#callApiBtn').style['pointer-events'] = 'auto';
    document.querySelector('#callApiBtn > svg > use').setAttribute('href', '/assets/sprites.svg#icon-checkmark');
    document.querySelector('#callApiBtn > svg').classList.toggle('active');
    
});

function initUI() {
    const visualFeaturesDOM = document.querySelector('#visual-features');
    const DetailsDOM = document.querySelector('#details');

    const visualFeaturesMarkup = visualFeatures.map((el, i) => {
        return `
            <div class="checkbox-group">
                <input
                    type="checkbox"
                    class="checkbox-input"
                    id="${'visualfeatures-' + i}"
                    data-x="${el}"
                    ${[3,4,5].includes(i) ? "checked" : null}
                    />
                <label for="${'visualfeatures-' + i}" class="checkbox-label">
                    <span class="checkbox-button">
                        <svg class="checkbox-icon">
                            <use href="/assets/sprites.svg#icon-checkmark"></use>
                        </svg>
                    </span>
                    ${el}
                </label>
            </div>
        `;
    }).join('');

    const detailsMarkup = details.map((el, i) => {
        return `
            <div class="checkbox-group">
                <input
                    type="checkbox"
                    class="checkbox-input"
                    id="${'details-' + i}"
                    data-x="${el}"
                    />
                <label for="${'details-' + i}" class="checkbox-label">
                    <span class="checkbox-button">
                        <svg class="checkbox-icon">
                            <use href="/assets/sprites.svg#icon-checkmark"></use>
                        </svg>
                    </span>
                    ${el}
                </label>
            </div>
        `;
    }).join('');

    visualFeaturesDOM.insertAdjacentHTML('beforeend', visualFeaturesMarkup);
    DetailsDOM.insertAdjacentHTML('beforeend', detailsMarkup);
}

function getParams() {
    
    const params = {
        visualFeatures: [],
        details: []
    };
    
    document.querySelectorAll('#visual-features > .checkbox-group > input').forEach(el => {
        if (el.checked) params.visualFeatures.push(el.dataset.x);
    });
    document.querySelectorAll('#details > .checkbox-group > input').forEach(el => {
        if (el.checked) params.details.push(el.dataset.x);
    });

    return params;
}

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
    console.log('alo');
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