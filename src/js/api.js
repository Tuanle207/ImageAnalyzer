/*
params = {
    visualFeatures: [],
    details: []   
}
*/

/**
 * Call API to get data in response
 * @param {string} url url to call API request
 * @param {} params parameter to inject in query string
 */
export default async function callApi(baseURL, url, params) {

    const visualFeatures = params && params.visualFeatures.length > 0 ? params.visualFeatures.join(',') : '';
    const details = params && params.details.length > 0 ? params.details.join(',') : '';
    
    return fetch(`${baseURL}visualFeatures=${visualFeatures}&details=${details}`, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': '7470877468174b49bc99d76b51b32b4d',
            'Content-Type':  'application/json',
        },
        body: JSON.stringify({url})
    });
};