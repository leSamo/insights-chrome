import React, { useState } from 'react';
import { Button, Modal, ModalVariant, Form, FormGroup, TextArea, Label } from '@patternfly/react-core';
import { OutlinedCommentsIcon } from '@patternfly/react-icons';
import './Feedback.scss';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFeedbackModal } from '../../redux/actions';

const Feedback = ({ user }) => {
  const usePendoFeedback = useSelector(({ chrome: { usePendoFeedback } }) => usePendoFeedback);
  const isOpen = useSelector(({ chrome: { isFeedbackModalOpen } }) => isFeedbackModalOpen);
  const dispatch = useDispatch();
  const [textAreaValue, setTextAreaValue] = useState('');
  const env = window.insights.chrome.getEnvironment();
  const app = window.insights.chrome.getApp();
  const bundle = window.insights.chrome.getBundle();
  const isAvailable = env === 'prod' || env === 'stage';
  const setIsModalOpen = (...args) => dispatch(toggleFeedbackModal(...args));

  const handleModalSubmission = () => {
    if (isAvailable) {
      fetch(`${window.origin}/api/platform-feedback/v1/issues`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('cs_jwt')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `Feedback: ${textAreaValue}, Username: ${user.identity.user.username}, Account ID: ${user.identity.account_number}, Email: ${user.identity.user.email}, URL: ${window.location.href}`, //eslint-disable-line
          summary: `${window.insights.chrome.isProd ? '[PROD]' : '[PRE-PROD]'} App Feedback`,
          labels: [app, bundle],
        }),
      }).then((response) => response.json());
    } else {
      console.log('Submitting feedback only works in prod and stage');
    }

    setIsModalOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        ouiaId="feedback-button"
        className="ins-c-button__feedback"
        onClick={() => {
          if (!usePendoFeedback) {
            setIsModalOpen(true);
          }
        }}
      >
        <OutlinedCommentsIcon />
        Feedback
      </Button>
      <Modal
        title="We would love your feedback!"
        isOpen={isOpen}
        variant={ModalVariant.medium}
        onClose={() => setIsModalOpen(false)}
        actions={[
          <Button ouiaId="submit-feedback" key="confirm" variant="primary" onClick={handleModalSubmission}>
            Submit feedback
          </Button>,
          <Button ouiaId="cancel-feedback" key="cancel" variant="link" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup label="Please leave us your feedback below." fieldId="horizontal-form-exp">
            <TextArea
              value={textAreaValue}
              onChange={(value) => setTextAreaValue(value)}
              name="feedback-description-text"
              id="feedback-description-text"
            />
          </FormGroup>
        </Form>
        {!isAvailable && <Label color="red"> Submitting feedback only works in prod and stage </Label>}
      </Modal>
    </React.Fragment>
  );
};

Feedback.propTypes = {
  user: PropTypes.object,
};

export default Feedback;
