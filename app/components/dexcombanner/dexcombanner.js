/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
 * == BSD2 LICENSE ==
 */

import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';

import { URL_DEXCOM_CONNECT_INFO } from '../../core/constants';

const DexcomBanner = (props) => {
  const {
    onClick,
    onClose,
    patient,
    trackMetric,
  } = props;

  const getMessageText = () => {
    return 'Sync your Dexcom data directly with your Tidepool account.';
  };

  const renderLink = () => {
    const link = {
      href: URL_DEXCOM_CONNECT_INFO,
      text: 'Learn More',
      target: '_blank',
    };

    return (
      <a
        className="message-link" href={link.href} target={link.target}>
        {link.text}
      </a>
    );
  };

  const getButtonText = () => {
    return 'Connect to Dexcom';
  };

  const handleDismiss = () => {
    onClose(patient.userid);

    if (trackMetric) {
      trackMetric('dismiss Dexcom OAuth banner');
    }
  };

  const handleSubmit = () => {
    onClick(patient.userid);

    browserHistory.push(`/patients/${patient.userid}/profile?dexcomConnect=banner`);

    if (trackMetric) {
      trackMetric('clicked Dexcom OAuth banner');
    }
  }

  return (
    <div className='dexcomBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="dexcomBanner-message">
          <div className="message-text" children={getMessageText()} />
          {renderLink()}
        </div>

        <div className="dexcomBanner-action">
          {/* <button onClick={handleSubmit}>{getButtonText()}</button> */}
        </div>

        <div className="dexcomBanner-close">
          <a href="#" className="close" onClick={handleDismiss}>&times;</a>
        </div>
      </div>
    </div>
  );
};

DexcomBanner.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
  trackMetric: React.PropTypes.func.isRequired,
  patient: React.PropTypes.object.isRequired,
};

export default DexcomBanner;