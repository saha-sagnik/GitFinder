'use strict';

/**
 * Fetches data from the specified API URL.
 *
 * @param {*} url - API URL [required]
 * @param {*} successCallback - Success callback [required]
 * @param {*} errorCallback - Error callback [optional]
 */
export async function fetchData(url, successCallback, errorCallback) {
    try {
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            successCallback(data);
        } else {
            const errorData = await response.json();
            errorCallback && errorCallback(errorData);
        }
    } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error fetching data:', error);
        errorCallback && errorCallback(error);
    }
}
