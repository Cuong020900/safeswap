import {Middleware} from "redux";

const NAMESPACE_DEFAULT = 'redux_localstorage_simple';
const NAMESPACE_SEPARATOR_DEFAULT = '_';
const STATES_DEFAULT: any[] = [];
const ADD_LISTENER_DEFAULT = false;

function checkStorage ({
   states = STATES_DEFAULT,
   listener = ADD_LISTENER_DEFAULT,
   namespace = NAMESPACE_DEFAULT,
   namespaceSeparator = NAMESPACE_SEPARATOR_DEFAULT,
  } = {}): Middleware {
    let storage: any = {};
    window.addEventListener('storage', checkChanges);

    function checkChanges() {
        let arrayOfValuesStorage = [];
        let arrayOfKeysStorage = Object.keys(storage);

        for(let i in storage) {
            if (storage.hasOwnProperty(i)) {
                arrayOfValuesStorage.push(storage[i]);
            }
        }

        for(let i in arrayOfValuesStorage) {
            if(localStorage.getItem(arrayOfKeysStorage[i]) !== JSON.stringify(arrayOfValuesStorage[i])) {
                localStorage.setItem(arrayOfKeysStorage[i],  JSON.stringify(arrayOfValuesStorage[i]))
            }
        }
    }

    return (store) => (next) => (action) => {
        const returnValue = next(action);

        let state_ = store.getState();

        function lensPath (path: any, obj: any): any {
            if (obj === undefined) {
                return null
            } else if (path.length === 1) {
                return obj[path[0]]
            } else {
                return lensPath(path.slice(1), obj[path[0]])
            }
        }

        function getStateForLocalStorage (state: any, rootState: any) {
            const delimiter = '.';

            if (state.split(delimiter).length > 1) {
                return lensPath(state.split(delimiter), rootState)
            } else {
                return lensPath([state], rootState)
            }
        }

        states.forEach(state => {
            const key = namespace + namespaceSeparator + state;
            const stateForLocalStorage = getStateForLocalStorage(state, state_);
            storage[key] = stateForLocalStorage;
        });

        return returnValue;
    }
}
export { checkStorage };