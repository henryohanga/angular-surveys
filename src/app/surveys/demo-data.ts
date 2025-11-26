import { MWForm } from './models';

export const DEMO_FORM: MWForm = {
  name: 'form name',
  description: 'description',
  pages: [
    {
      id: 'page-1',
      number: 1,
      name: null,
      description: null,
      pageFlow: { nextPage: true, label: 'mwForm.pageFlow.goToNextPage' },
      elements: [
        {
          id: 'q1',
          orderNo: 1,
          type: 'question',
          question: {
            id: 'short-text',
            text: 'short text',
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
            id: 'long-text',
            text: 'long text',
            type: 'textarea',
            required: true,
            pageFlowModifier: false,
          },
        },
        {
          id: 'q3',
          orderNo: 3,
          type: 'question',
          question: {
            id: 'radio-question',
            text: 'radio question',
            type: 'radio',
            required: true,
            offeredAnswers: [
              {
                id: 'a1',
                orderNo: 1,
                value: 'aaaa',
              },
              {
                id: 'a2',
                orderNo: 2,
                value: 'bbbb',
              },
            ],
            otherAnswer: true,
          },
        },
        {
          id: 'q4',
          orderNo: 4,
          type: 'question',
          question: {
            id: 'checkbox-question',
            text: 'checkbox',
            type: 'checkbox',
            required: true,
            offeredAnswers: [
              { id: 'c1', orderNo: 1, value: 'aaaa' },
              { id: 'c2', orderNo: 2, value: 'bbb' },
              { id: 'c3', orderNo: 3, value: 'cccc' },
            ],
            otherAnswer: true,
          },
        },
      ],
      namedPage: false,
    },
  ],
};

