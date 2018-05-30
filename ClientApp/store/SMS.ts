import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface AppState {
    current_payload?: payload;
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    phoneNumber: string;
    message: string;
    showSuccess: boolean;
}

export interface payload {
    cost: number;
    sms: number;
    delivery_stats: delivery_stats;
    error: error;
}

export interface error {
    code: string;
    description: string;
}

export interface delivery_stats {
    delivered: number;
    pending: number;
    bounced: number;
    responses: number;
    optouts: number;
}

export interface HttpResponse {
    statusCode: number;
    content: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface SendSMS {
    type: 'SEND_SMS';
}

interface ReceiveSMSResponse {
    type: 'RECEIVE_SMS_RESPONSE';
    current_payload: payload;
    hasError: boolean;
    errorMessage: string;
}

interface UpdatePhoneNumber {
    type: 'UPDATE_PHONE_NUMBER';
    phoneNumber: string;
}

interface UpdateMessage {
    type: 'UPDATE_MESSAGE';
    message: string;
}


// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = UpdatePhoneNumber | UpdateMessage | SendSMS | ReceiveSMSResponse;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    updatePhoneNumber: (phoneNo: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'UPDATE_PHONE_NUMBER', phoneNumber: phoneNo });
    },
    updateMessage: (message: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'UPDATE_MESSAGE', message });
    },
    sendSMS: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().SMS

        if (!state.isLoading) {

            const requestBody = {
                to: state.phoneNumber,
                message: state.message
            }

            let fetchTask = fetch('api/SMS', {
                method: 'POST',
                mode: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            })
                .then(response => response.json() as Promise<HttpResponse>)
                .then(httpResponse => {
                    const { statusCode, content} = httpResponse

                    let payload = content && JSON.parse(content)

                    let hasError: boolean = false
                    if (payload.error && payload.error.code.toUpperCase() !== 'SUCCESS') {
                        hasError = true
                    }
                    dispatch({ type: 'RECEIVE_SMS_RESPONSE', current_payload : payload, hasError, errorMessage: hasError ? payload.error.description : '' });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'SEND_SMS' });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: AppState = {
    isLoading: false,
    hasError: false,
    errorMessage: '',
    phoneNumber: '',
    message: '',
    showSuccess: false
};

export const reducer: Reducer<AppState> = (state: AppState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'UPDATE_PHONE_NUMBER':
            return {
                ...state,
                phoneNumber: action.phoneNumber
            };
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                message: action.message
            };
        case 'SEND_SMS':
            return {
                ...state,
                isLoading: true,
                showSuccess: false,
            };
        case 'RECEIVE_SMS_RESPONSE':
            return {
                ...state,
                current_payload: action.current_payload,
                hasError: action.hasError,
                errorMessage: action.errorMessage,
                isLoading: false,
                showSuccess: !action.hasError
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
