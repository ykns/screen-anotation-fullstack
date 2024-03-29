import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkerEditableTooltipContainer } from './marker-editable-tooltip-container';

jest.mock('../api/marker-editable-tooltip-client');
const {
  createOrUpdateTooltip: mockedCreateOrUpdateTooltip,
  deleteTooltip: mockedDeleteTooltip,
  getAllTooltips: mockedGetAllTooltips,
} = require('../api/marker-editable-tooltip-client');

beforeEach(() => {
  jest.restoreAllMocks();
  mockedGetAllTooltips.mockReturnValue([]);
});
afterEach(cleanup);
describe('MarkerEditableTooltipContainer', () => {
  describe('empty marker container', () => {
    test('renders', async () => {
      render(<MarkerEditableTooltipContainer />);

      await waitFor(() => {
        expect(screen.getByLabelText('tooltips')).toBeInTheDocument();
        const tooltips = screen.queryAllByRole('tooltip');
        expect(tooltips.length).toBe(0);
        expect(mockedGetAllTooltips).toBeCalled();
      });
    });

    describe('when a user clicks', () => {
      test('a single marker should be placed in the clicked position', async () => {
        render(<MarkerEditableTooltipContainer />);

        userEvent.click(screen.getByLabelText('tooltips'), {
          clientX: 10,
          clientY: 10,
        });

        await waitFor(() => {
          const tooltips = screen.getAllByRole('tooltip');
          expect(tooltips.length).toBe(1);
          const style = window.getComputedStyle(tooltips[0]);
          expect(style.top).toBe('10px');
          expect(style.left).toBe('10px');
          expect(mockedCreateOrUpdateTooltip).toBeCalled();
        });
      });

      describe('when a user clicks the delete button on an existing tooltip', () => {
        test('the tooltip should deleted', async () => {
          render(<MarkerEditableTooltipContainer />);
          userEvent.click(screen.getByLabelText('tooltips'), {
            clientX: 10,
            clientY: 10,
          });

          await waitFor(() => {
            userEvent.click(screen.getByText('Del'));
          });

          await waitFor(() => {
            expect(screen.queryAllByRole('tooltip').length).toBe(0);
            expect(mockedDeleteTooltip).toBeCalled();
          });
        });
      });

      describe('when a user clicks in multiple positions', () => {
        test('a single marker should be placed in the each clicked position', async () => {
          render(<MarkerEditableTooltipContainer />);

          userEvent.click(screen.getByLabelText('tooltips'), {
            clientX: 10,
            clientY: 10,
          });
          userEvent.click(screen.getByLabelText('tooltips'), {
            clientX: 20,
            clientY: 20,
          });
          userEvent.click(screen.getByLabelText('tooltips'), {
            clientX: 50,
            clientY: 50,
          });

          await waitFor(() => {
            const tooltips = screen.getAllByRole('tooltip');
            expect(tooltips.length).toBe(3);
            const firstTooltipStyle = window.getComputedStyle(tooltips[0]);
            expect(firstTooltipStyle.top).toBe('10px');
            expect(firstTooltipStyle.left).toBe('10px');
            const secondTooltipStyle = window.getComputedStyle(tooltips[1]);
            expect(secondTooltipStyle.top).toBe('20px');
            expect(secondTooltipStyle.left).toBe('20px');
            const thirdTooltipStyle = window.getComputedStyle(tooltips[2]);
            expect(thirdTooltipStyle.top).toBe('50px');
            expect(thirdTooltipStyle.left).toBe('50px');
          });
        });
      });
    });
  });
});
