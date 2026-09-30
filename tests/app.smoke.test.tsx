// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('App end-to-end flow', () => {
  beforeEach(() => localStorage.clear());

  it('lets a player pick a critter, open a level, build code, and win', async () => {
    const user = userEvent.setup();
    render(<App />);

    // First screen: choose a character and a prize, then start.
    expect(screen.getByText('Code Critters')).toBeTruthy();
    await user.click(screen.getByRole('radio', { name: /Pip the Dog/i }));
    await user.click(screen.getByRole('button', { name: /Start playing/i }));

    // Level map appears; open the first level.
    expect(screen.getByText('Level Map')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Straight Shot/i }));

    // World intro (first level of the world) → continue.
    expect(screen.getByText(/World 1/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Let’s go|Let's go/i }));

    // Play screen: add four "move forward" blocks.
    const addMove = () => screen.getByRole('button', { name: /Add move forward block/i });
    for (let i = 0; i < 4; i++) await user.click(addMove());

    // Step through the whole program; the last step reveals the win.
    const stepBtn = screen.getByRole('button', { name: /Step/i });
    for (let i = 0; i < 4; i++) await user.click(stepBtn);

    // A win shows the "Next level" button and celebratory text.
    const result = await screen.findByRole('status');
    expect(within(result).getByText(/Perfect|did it|Great job/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next level/i })).toBeTruthy();
  });

  it('lets a new player start over, wiping saved progress', async () => {
    localStorage.setItem(
      'code-critters-progress-v1',
      JSON.stringify({ character: 'pip', prize: 'bone', stars: { 'w1-l1': 3 }, onboarded: true }),
    );
    const user = userEvent.setup();
    render(<App />);

    // Returning player lands on the map with their stars.
    expect(screen.getByText('Level Map')).toBeTruthy();
    expect(screen.getByLabelText('3 stars earned')).toBeTruthy();

    // Cancel keeps everything.
    await user.click(screen.getByRole('button', { name: /Start over/i }));
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.getByLabelText('3 stars earned')).toBeTruthy();

    // Confirming wipes progress and returns to the character picker.
    await user.click(screen.getByRole('button', { name: /Start over/i }));
    await user.click(screen.getByRole('button', { name: /Yes, start over/i }));
    expect(screen.getByText('Code Critters')).toBeTruthy();
    const saved = JSON.parse(localStorage.getItem('code-critters-progress-v1')!);
    expect(saved.stars).toEqual({});
    expect(saved.onboarded).toBe(false);
  });
});
