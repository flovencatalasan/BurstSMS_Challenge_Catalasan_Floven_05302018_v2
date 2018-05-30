import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as SMSStore from '../store/SMS';

type SMSProps =
    SMSStore.AppState
    & typeof SMSStore.actionCreators
    & RouteComponentProps<{}>;

class SMS extends React.Component<SMSProps, {}> {
    public render() {
        const {
            phoneNumber,
            message,
            updatePhoneNumber,
            updateMessage,
            sendSMS,
            current_payload,
            showSuccess,
            hasError,
            errorMessage } = this.props

        return (
            <div id="burst-sms-form-container">
                <form>
                    {
                        hasError &&
                        <div className="panel panel-danger">
                            <div className="panel-heading">
                                <h3 className="panel-title">Result</h3>
                            </div>
                            <div className="panel-body">
                                {errorMessage}
                            </div>
                        </div>
                    }
                    {
                        showSuccess &&
                        <div className="panel panel-success">
                            <div className="panel-heading">
                                <h3 className="panel-title">Result</h3>
                            </div>
                            <div className="panel-body">
                                <strong>Message has been sent successfuly!</strong> 
                            </div>
                        </div>
                    }
                    <div className="form-group">
                        <label htmlFor="txt-phone-no">Phone number</label>
                        <input type="text" className="form-control" id="txt-phone-no" value={phoneNumber} onChange={(ev) => { updatePhoneNumber(ev.target.value) }} maxLength={11} placeholder="Number" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="txt-msg">Message</label>
                        <textarea id="txt-msg" placeholder="Input your message" className="form-control" onChange={(ev) => { updateMessage(ev.target.value) }} rows={3}></textarea>
                    </div>
                    <button style={{ float: 'right' }} type="button" className="btn btn-lg btn-primary" onClick={() => { sendSMS() }}>Send <span className="glyphicon glyphicon-send" /></button>
                </form>
                <div className="clearfix" />
                {
                    current_payload &&
                    <div className="panel panel-primary" style={{marginTop: '20px'}}>
                        <div className="panel-heading">
                            <h3 className="panel-title">Delivery Stats</h3>
                        </div>
                        <div className="panel-body">
                            <table className="table">
                                <tr>
                                    <td>Cost</td>
                                    <td><strong>{current_payload.cost}</strong></td>
                                </tr>
                                <tr>
                                    <td>Stats</td>
                                    <td>
                                        <p>Bounced : {current_payload.delivery_stats.bounced}</p>
                                        <p>Delivered : {current_payload.delivery_stats.delivered}</p>
                                        <p>OptOuts : {current_payload.delivery_stats.optouts}</p>
                                        <p>Pending : {current_payload.delivery_stats.pending}</p>
                                        <p>Responses : {current_payload.delivery_stats.responses}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>SMS Counts</td>
                                    <td><strong>{current_payload.sms}</strong></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

// Wire up the React component to the Redux store
export default connect(
    (state: ApplicationState) => state.SMS, // Selects which state properties are merged into the component's props
    SMSStore.actionCreators                 // Selects which action creators are merged into the component's props
)(SMS) as typeof SMS;