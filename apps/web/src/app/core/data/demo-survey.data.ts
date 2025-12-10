import { MWForm } from '../../surveys/models';

/**
 * Demo survey shown to visitors on the /demo route.
 * This showcases the survey-taking experience with various question types.
 */
export const DEMO_SURVEY: MWForm = {
  name: 'Product Feedback Survey',
  description:
    'Experience how surveys work! This demo showcases different question types. Your responses are not saved.',
  pages: [
    {
      id: 'page-1',
      number: 1,
      name: 'About You',
      description: 'Let us know a bit about yourself',
      namedPage: true,
      pageFlow: { nextPage: true },
      elements: [
        {
          id: 'q1',
          orderNo: 1,
          type: 'question',
          question: {
            id: 'name',
            text: 'What is your name?',
            type: 'text',
            required: true,
            pageFlowModifier: false,
          },
        },
        {
          id: 'q2',
          orderNo: 2,
          type: 'question',
          question: {
            id: 'email',
            text: 'Email address',
            type: 'email',
            required: true,
            pageFlowModifier: false,
          },
        },
        {
          id: 'q3',
          orderNo: 3,
          type: 'question',
          question: {
            id: 'role',
            text: 'What best describes your role?',
            type: 'radio',
            required: true,
            pageFlowModifier: false,
            offeredAnswers: [
              { id: 'a1', orderNo: 1, value: 'Developer' },
              { id: 'a2', orderNo: 2, value: 'Designer' },
              { id: 'a3', orderNo: 3, value: 'Product Manager' },
              { id: 'a4', orderNo: 4, value: 'Business Analyst' },
              { id: 'a5', orderNo: 5, value: 'Other' },
            ],
          },
        },
      ],
    },
    {
      id: 'page-2',
      number: 2,
      name: 'Your Experience',
      description: 'Tell us about your experience with survey tools',
      namedPage: true,
      pageFlow: { nextPage: true },
      elements: [
        {
          id: 'q4',
          orderNo: 1,
          type: 'question',
          question: {
            id: 'satisfaction',
            text: 'How satisfied are you with current survey tools?',
            type: 'scale',
            required: true,
            pageFlowModifier: false,
            scale: {
              min: 1,
              max: 5,
              minLabel: 'Very Dissatisfied',
              maxLabel: 'Very Satisfied',
            },
          },
        },
        {
          id: 'q5',
          orderNo: 2,
          type: 'question',
          question: {
            id: 'features',
            text: 'Which features are most important to you?',
            type: 'checkbox',
            required: false,
            pageFlowModifier: false,
            offeredAnswers: [
              { id: 'f1', orderNo: 1, value: 'Drag & drop builder' },
              { id: 'f2', orderNo: 2, value: 'Conditional logic' },
              { id: 'f3', orderNo: 3, value: 'Multiple question types' },
              { id: 'f4', orderNo: 4, value: 'Analytics & reporting' },
              { id: 'f5', orderNo: 5, value: 'Customizable themes' },
              { id: 'f6', orderNo: 6, value: 'API integrations' },
            ],
          },
        },
        {
          id: 'q6',
          orderNo: 3,
          type: 'question',
          question: {
            id: 'frequency',
            text: 'How often do you create surveys?',
            type: 'select',
            required: true,
            pageFlowModifier: false,
            offeredAnswers: [
              { id: 'freq1', orderNo: 1, value: 'Daily' },
              { id: 'freq2', orderNo: 2, value: 'Weekly' },
              { id: 'freq3', orderNo: 3, value: 'Monthly' },
              { id: 'freq4', orderNo: 4, value: 'Quarterly' },
              { id: 'freq5', orderNo: 5, value: 'Rarely' },
            ],
          },
        },
      ],
    },
    {
      id: 'page-3',
      number: 3,
      name: 'Final Thoughts',
      description: 'Share your thoughts and recommendations',
      namedPage: true,
      pageFlow: { nextPage: true },
      elements: [
        {
          id: 'q7',
          orderNo: 1,
          type: 'question',
          question: {
            id: 'nps',
            text: 'How likely are you to recommend Angular Surveys to a colleague?',
            type: 'scale',
            required: true,
            pageFlowModifier: false,
            scale: {
              min: 0,
              max: 10,
              minLabel: 'Not likely',
              maxLabel: 'Very likely',
            },
          },
        },
        {
          id: 'q8',
          orderNo: 2,
          type: 'question',
          question: {
            id: 'feedback',
            text: 'Any additional feedback or suggestions?',
            type: 'textarea',
            required: false,
            pageFlowModifier: false,
          },
        },
      ],
    },
  ],
};
