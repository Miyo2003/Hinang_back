// services/intelligence/disputeAssistantService.js
const { assertFeatureEnabled } = require('../../utils/featureToggle');

const generateDisputeWorkflow = ({ disputeType }) => {
  assertFeatureEnabled('disputeAssistantEnabled');

  const workflows = {
    payment: [
      'Gather payment receipts and timeline',
      'Contact worker for clarification',
      'Escalate to admin if unresolved in 48 hours'
    ],
    quality: [
      'Review job requirements vs delivered work',
      'Request revision if within contract scope',
      'Provide mediation call option'
    ],
    default: [
      'Document issue details',
      'Contact other party',
      'Escalate to support'
    ]
  };

  return workflows[disputeType] || workflows.default;
};

module.exports = {
  generateDisputeWorkflow
};