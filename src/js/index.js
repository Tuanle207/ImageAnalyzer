import "core-js/stable";
import "regenerator-runtime/runtime";


import callApi, { baseURL } from './api.js';
import { getActualCoordsForRendering, getImageSizeForRendering, loadImageInformation } from './utils';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
let url = '';
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
    const res = await callApi(url, params);
    const data = await res.json();

    document.querySelector('.response__body').textContent = JSON.stringify(data, undefined, 4);

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
