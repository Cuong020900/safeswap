// let localStorageProtection = 1
//
// var arrayOfValues = [];
// var arrayOfKeys = Object.keys(localStorage);
// for(var i in localStorage){
//     if(localStorage.hasOwnProperty(i)){
//         arrayOfValues.push(localStorage[i]);
//     }
// }
//
// window.addEventListener('storage', () => {
//     for(let i in arrayOfValues) {
//         if(localStorage.getItem(arrayOfKeys[i]) !== arrayOfValues[i]) {
//             localStorage.setItem(arrayOfKeys[i], arrayOfValues[i])
//         }
//     }
// });
//
// console.log('arrayOfValues', arrayOfValues, arrayOfKeys, localStorage.getItem(arrayOfKeys[0]));
//

import {Middleware} from "redux";

const MODULE_NAME = '[Redux-LocalStorage-Simple]'
const NAMESPACE_DEFAULT = 'redux_localstorage_simple'
const NAMESPACE_SEPARATOR_DEFAULT = '_'
const STATES_DEFAULT = []
const IGNORE_STATES_DEFAULT = []
const DEBOUNCE_DEFAULT = 0
const IMMUTABLEJS_DEFAULT = false
const DISABLE_WARNINGS_DEFAULT = false
let debounceTimeout = null

// function checkStorage(options): (store) => (next) => (action) => any {
//
// }

function checkStorage ({
       states = STATES_DEFAULT,
       ignoreStates = IGNORE_STATES_DEFAULT,
       namespace = NAMESPACE_DEFAULT,
       namespaceSeparator = NAMESPACE_SEPARATOR_DEFAULT,
       debounce = DEBOUNCE_DEFAULT,
       disableWarnings = DISABLE_WARNINGS_DEFAULT
      } = {}): Middleware {
    return (store) => (next) => (action) => {
        const returnValue = next(action)
        let state_
        state_= store.getState()
        console.log('states', states);
        console.log('ignoreStates', ignoreStates);
        console.log('returnValue', returnValue);
        console.log('state_', state_);
    }
}
export { checkStorage };