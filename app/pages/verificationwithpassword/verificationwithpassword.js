/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';
import config from '../../config';

import utils from '../../core/utils';
import WaitList from '../../components/waitlist';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';
import DatePicker from '../../components/datepicker';
import InputGroup from '../../components/inputgroup';
import personUtils from '../../core/personutils';

var MODEL_DATE_FORMAT = 'YYYY-MM-DD';

export let VerificationWithPassword = React.createClass({
  propTypes: {
    //acknowledgeNotification: React.PropTypes.func.isRequired,
    api: React.PropTypes.object.isRequired,
    //configuredInviteKey: React.PropTypes.string.isRequired,
    //inviteEmail: React.PropTypes.string,
    //inviteKey: React.PropTypes.string,
    notification: React.PropTypes.object,
    signupKey: React.PropTypes.string.isRequired
    //onSubmit: React.PropTypes.func.isRequired,
    //trackMetric: React.PropTypes.func.isRequired,
    //working: React.PropTypes.bool.isRequired
  },

  formInputs:  [
      {
        name: 'birthday',
        label: 'Birthday',
        type: 'datepicker'
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '******'
      },
      {
        name: 'passwordConfirm',
        label: 'Confirm password',
        type: 'password',
        placeholder: '******'
      }
    ],

  isWaitListed: function() {

    var hasInviteKey = !_.isEmpty(this.props.inviteKey) || this.props.inviteKey === '';
    var hasInviteEmail = !_.isEmpty(this.props.inviteEmail);

    if (hasInviteKey && hasInviteEmail) {
      // don't show waitlist if invited user to create account and join careteam
      return false;
    }
    else if (hasInviteKey) {
      // do we have a valid waitlist key?
      if (_.isEmpty(this.props.configuredInviteKey) ||
        this.props.inviteKey === this.props.configuredInviteKey) {
        return false;
      }
      else {
        return true;
      }
    }
    return true;
  },

  componentWillMount: function() {
    this.setState({loading: false, showWaitList: this.isWaitListed() });
  },

  getInitialState: function() {
    var formValues = {};

    if (this.props.inviteEmail) {
      formValues.username = this.props.inviteEmail;
    }

    return {
      loading: true,
      showWaitList: false,
      formValues: formValues,
      validationErrors: {},
      notification: null
    };
  },

  isFormDisabled: function() {
    return (this.props.fetchingUser && !this.props.user);
  },

  getSubmitButtonText: function() {
    if (this.props.working) {
      return 'Setting up...';
    }
    return 'Set up';
  },

  render: function() {
    var form = this.renderForm();
      return (
        <div className="VerificationWithPassword">
          <LoginNav
            page="VerificationWithPassword"
            hideLinks={Boolean(this.props.inviteEmail)}
            trackMetric={this.props.trackMetric} />
          <LoginLogo />
          <div className="container-small-outer VerificationWithPassword-form">
            <div className="container-small-inner VerificationWithPassword-form-box">
              {form}
            </div>
          </div>
        </div>
      );
  },

  renderInviteIntroduction: function() {
    if (!this.props.inviteEmail) {
      return null;
    }

    return (
      <div className='VerificationWithPassword-inviteIntro'>
        <p>{'You\'ve been invited to Blip.'}</p><p>{'Sign up to view the invitation.'}</p>
      </div>
    );
  },

  renderForm: function() {
    return (
        <form className="PatientNew-form">
          <div className="PatientNew-formInputs">
            {this.renderInputs()}
          </div>
          <div className="PatientNew-formActions">
            {this.renderButtons()}
            {this.renderNotification()}
          </div>
        </form>
    );
  },

  renderInputs: function() {
    return _.map(this.formInputs, this.renderInput);
  },

  renderInput: function(input) {
    var name = input.name;
    var value = this.state.formValues[name];

    if (name === 'isOtherPerson') {
      value = this.state.formValues.isOtherPerson ? 'yes' : 'no';
    }

    if (input.type === 'datepicker') {
      return this.renderDatePicker(input);
    }

    return (
      <div key={name} className={'PatientNew-inputGroup PatientNew-inputGroup--' + name}>
        <InputGroup
          name={name}
          label={input.label}
          value={value}
          items={input.items}
          error={this.state.validationErrors[name]}
          type={input.type}
          placeholder={input.placeholder}
          disabled={this.isFormDisabled() || input.disabled}
          onChange={this.handleInputChange}/>
      </div>
    );
  },

  renderDatePicker: function(input) {
    var name = input.name;
    var classes = 'PatientNew-datePicker PatientNew-inputGroup PatientNew-inputGroup--' + name;
    var error = this.state.validationErrors[name];
    var message;
    if (error) {
      classes = classes + ' PatientNew-datePicker--error';
      message = <div className="PatientNew-datePickerMessage">{error}</div>;
    }

    return (
      <div key={name} className={classes}>
        <div>
          <label className="PatientNew-datePickerLabel">{input.label}</label>
          <DatePicker
            name={name}
            value={this.state.formValues[name]}
            disabled={this.isFormDisabled() || input.disabled}
            onChange={this.handleInputChange} />
        </div>
        {message}
      </div>
    );
  },

  renderButtons: function() {
    return (
      <div>
        <Link to="/patients" className="btn btn-secondary PatientNew-cancel">Cancel</Link>
        <button
          className="btn btn-primary PatientNew-submit"
          onClick={this.handleSubmit}
          disabled={this.isFormDisabled()}>
          {this.getSubmitButtonText()}
        </button>
      </div>
    );
  },

  renderNotification: function() {
    var notification = this.props.notification;
    if (notification && notification.message) {
      var type = notification.type || 'alert';
      return (
        <div className={'PatientNew-notification PatientNew-notification--' + type}>
          {notification.message}
        </div>
      );
    }
    return null;
  },

  handleSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    var formValues = this.state.formValues;
    var self = this;

    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    formValues = this.prepareFormValuesForValidation(formValues);

    formValues = _.clone(formValues);

    var validationErrors = this.validateFormValues(formValues);

    if (!_.isEmpty(validationErrors)) {
      debugger;
      return;
    }
    debugger;

    formValues = this.prepareFormValuesForSubmit(formValues);

    this.props.onSubmit(this.props.api, this.props.signupKey, formValues.birthday, formValues.password);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  },

  validateFormValues: function(formValues) {
    var validationErrors = {};
    var IS_REQUIRED = 'This field is required.';
    var SHORT_PASSWORD = 'Password must be at least ' + config.PASSWORD_MIN_LENGTH + ' characters long.';

    if (!formValues.password) {
      validationErrors.password = IS_REQUIRED;
    }

    if (formValues.password && formValues.password.length < config.PASSWORD_MIN_LENGTH) {
      validationErrors.password = SHORT_PASSWORD;
    }

    if (formValues.password) {
      if (!formValues.passwordConfirm) {
        validationErrors.passwordConfirm = IS_REQUIRED;
      }
      else if (formValues.passwordConfirm !== formValues.password) {
        validationErrors.passwordConfirm = 'Passwords don\'t match.';
      }
    }

    var validationErrors2 = personUtils.validateFormValues(formValues, false, MODEL_DATE_FORMAT);

    validationErrors = _.assign(validationErrors, validationErrors2);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message:'Some entries are invalid.'
        }
      });
    }

    return validationErrors;
  },

  isDateObjectComplete: function(dateObj) {
    if (!dateObj) {
      return false;
    }
    return (!_.isEmpty(dateObj.year) && dateObj.year.length === 4 && !_.isEmpty(dateObj.month) && !_.isEmpty(dateObj.day));
  },

  // because JavaScript Date will coerce impossible dates into possible ones with
  // no opportunity for exposing the error to the user
  // i.e., mis-typing 02/31/2014 instead of 03/31/2014 will be saved as 03/03/2014!
  makeRawDateString: function(dateObj){

    var mm = ''+(parseInt(dateObj.month) + 1); //as a string, add 1 because 0-indexed
    mm = (mm.length === 1) ? '0'+ mm : mm;
    var dd = (dateObj.day.length === 1) ? '0'+dateObj.day : dateObj.day;

    return dateObj.year+'-'+mm+'-'+dd;
  },

  prepareFormValuesForValidation: function(formValues) {
    formValues = _.clone(formValues);
    var formBDay = formValues.birthday;

    if (this.isDateObjectComplete(formBDay)) {
      formValues.birthday = this.makeRawDateString(formBDay);
    }
    else {
      formValues.birthday = null;
    }

    return formValues;
  },

  handleInputChange: function(attributes) {
    var key = attributes.name;
    var value = attributes.value;
    if (!key) {
      return;
    }

    var formValues = _.clone(this.state.formValues);
    if (key === 'isOtherPerson') {
      var isOtherPerson = (attributes.value === 'yes') ? true : false;
      var fullName = isOtherPerson ? '' : this.getUserFullName();
      formValues = _.assign(formValues, {
        isOtherPerson: isOtherPerson,
        fullName: fullName
      });
    }
    else {
      formValues[key] = value;
    }

    this.setState({formValues: formValues});
  },


  prepareFormValuesForSubmit: function(formValues) {
    return {
      birthday: formValues.birthday,
      password: formValues.password
    };
  },
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.signingUp.notification,
    signupKey: state.blip.signupKey,
    working: state.blip.working.signingUp.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.verificationWithPassword,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, {
    configuredInviteKey: config.INVITE_KEY,
    inviteKey: utils.getInviteKey(ownProps.location),
    inviteEmail: utils.getInviteEmail(ownProps.location),
    trackMetric: ownProps.routes[0].trackMetric,
    api: ownProps.routes[0].api,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(VerificationWithPassword);
