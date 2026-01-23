jest.mock('../src/changelog');
jest.mock('../src/authors');

import { release } from '../src';
import changelog from '../src/changelog';
import authors from '../src/authors';
import * as data from '../src/data';

const mockDataWithLabels = {
  commits: [],
  owner: 'tanem',
  pulls: [
    {
      number: 100,
      title: 'Test PR',
      labels: [{ name: 'enhancement' }],
      merged_at: '2019-01-15T00:00:00Z',
    },
  ],
  repo: 'tanem-scripts',
  tags: [{ date: '2019-01-01T00:00:00Z', name: 'v1.0.0' }],
};

const mockDataUnlabelled = {
  ...mockDataWithLabels,
  pulls: [
    {
      number: 100,
      title: 'Unlabelled PR',
      labels: [],
      merged_at: '2019-01-15T00:00:00Z',
    },
  ],
};

const mockDataMultipleLabels = {
  ...mockDataWithLabels,
  pulls: [
    {
      number: 100,
      title: 'Multi-label PR',
      labels: [{ name: 'enhancement' }, { name: 'bug' }],
      merged_at: '2019-01-15T00:00:00Z',
    },
  ],
};

describe('release validation', () => {
  beforeEach(() => {
    (changelog as jest.MockedFunction<typeof changelog>).mockResolvedValue(
      '# Changelog',
    );
    (authors as jest.MockedFunction<typeof authors>).mockResolvedValue(
      'Author1',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('throws if any PRs are unlabelled', async () => {
    jest
      .spyOn(data, 'get')
      .mockResolvedValue(mockDataUnlabelled as unknown as data.Data);
    await expect(release()).rejects.toThrow('Unlabelled PRs in release');
  });

  test('throws if any PRs have multiple labels', async () => {
    jest
      .spyOn(data, 'get')
      .mockResolvedValue(mockDataMultipleLabels as unknown as data.Data);
    await expect(release()).rejects.toThrow(
      'PRs with multiple labels in release',
    );
  });

  test('throws if nothing to release', async () => {
    const mockDataNoNewPulls = {
      ...mockDataWithLabels,
      tags: [
        {
          name: 'v4.0.6',
          date: '2099-01-01T00:00:00Z',
        },
      ],
    };
    jest
      .spyOn(data, 'get')
      .mockResolvedValue(mockDataNoNewPulls as unknown as data.Data);
    await expect(release()).rejects.toThrow('Nothing to release');
  });
});
