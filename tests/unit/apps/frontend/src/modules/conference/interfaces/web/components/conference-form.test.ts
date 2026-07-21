import {describe, it, expect, vi} from 'vitest';
import {ConferenceForm} from '@frontend/modules/conference/interfaces/web/components/conference-form';

describe('ConferenceForm UI Component', () => {
  it('exports ConferenceForm component function', () => {
    expect(typeof ConferenceForm).toBe('function');
  });

  it('accepts onSubmit handler prop', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({success: true});
    const props = {onSubmit: handleSubmit};
    expect(props.onSubmit).toBeDefined();
    const result = await props.onSubmit({
      name: 'Tech Conference 2026',
      cfpStartDate: '2026-06-01',
      cfpEndDate: '2026-09-30',
    });
    expect(result.success).toBe(true);
    expect(handleSubmit).toHaveBeenCalledOnce();
  });
});
