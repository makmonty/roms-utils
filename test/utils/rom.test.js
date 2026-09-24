import { describe, expect, it } from 'vitest';
import { getBestRom, getRomClonesFromDat, getRomDescription } from '../../src/utils/rom.js';

const dat = {
  datafile: {
    game: [
      {
        '$': { name: 'Some Game (Japan)', id: '0001' },
        category: ['Games'],
        description: ['Some Game (Japan)'],
        rom: [{ '$': [] }]
      },
      {
        '$': { name: 'Some Game (USA)', id: '0002', cloneofid: '0001' },
        category: ['Games'],
        description: ['Some Game (USA)'],
        rom: [{ '$': [] }]
      },
      {
        '$': { name: 'Some Game (Europe)', id: '0003', cloneofid: '0001' },
        category: ['Games'],
        description: ['Some Game (Europe)'],
        rom: [{ '$': [] }]
      },
      {
        '$': { name: 'Other game (Japan)', id: '0004' },
        category: ['Games'],
        description: ['Other game (Japan)'],
        rom: [{ '$': [] }]
      },
      {
        '$': { name: 'Other game (Japan)(Rev 1)', id: '0005', cloneofid: '0004' },
        category: ['Games'],
        description: ['Other game (Japan)(Rev 1)'],
        rom: [{ '$': [] }]
      },
      {
        '$': { name: 'No clone game (Japan)', id: '0006' },
        category: ['Games'],
        description: ['No clone game (Japan)'],
        rom: [{ '$': [] }]
      }
    ]
  }
};

describe('Rom utils', () => {
  describe('#getRomDescription', () => {
    it('should return the name, extension and tags', () => {
      expect(getRomDescription('/home/test/Game . Test (1999)(Japan)[En,Fr,Es].abc')).toEqual({
        path: '/home/test/Game . Test (1999)(Japan)[En,Fr,Es].abc',
        file: 'Game . Test (1999)(Japan)[En,Fr,Es].abc',
        game: 'Game . Test',
        rom: 'Game . Test (1999)(Japan)[En,Fr,Es]',
        extension: 'abc',
        tags: [
          '1999',
          'Japan',
          'En',
          'Fr',
          'Es',
        ],
        regions: ['Japan'],
        languages: ['En', 'Fr', 'Es']
      });
    });

    it('should split tags with comma', () => {
      const parts = getRomDescription('/home/test/Game (tag1, tag2) [tag3, tag4] [tag5].abc');
      expect(parts.tags).toEqual([
        'tag1',
        'tag2',
        'tag3',
        'tag4',
        'tag5',
      ]);
    });
  });

  describe('#getRomClones', () => {
    it('should return all the clones and only the clones', () => {
      expect(getRomClonesFromDat('Some Game (USA)', dat)).toEqual([
        {
          '$': { name: 'Some Game (Japan)', id: '0001' },
          category: ['Games'],
          description: ['Some Game (Japan)'],
          rom: [{ '$': [] }]
        },
        {
          '$': { name: 'Some Game (USA)', id: '0002', cloneofid: '0001' },
          category: ['Games'],
          description: ['Some Game (USA)'],
          rom: [{ '$': [] }]
        },
        {
          '$': { name: 'Some Game (Europe)', id: '0003', cloneofid: '0001' },
          category: ['Games'],
          description: ['Some Game (Europe)'],
          rom: [{ '$': [] }]
        },
      ]);
    });

    it('should return all the clones and only the clones when passing a game that is the original', () => {
      expect(getRomClonesFromDat('Some Game (Japan)', dat)).toEqual([
        {
          '$': { name: 'Some Game (Japan)', id: '0001' },
          category: ['Games'],
          description: ['Some Game (Japan)'],
          rom: [{ '$': [] }]
        },
        {
          '$': { name: 'Some Game (USA)', id: '0002', cloneofid: '0001' },
          category: ['Games'],
          description: ['Some Game (USA)'],
          rom: [{ '$': [] }]
        },
        {
          '$': { name: 'Some Game (Europe)', id: '0003', cloneofid: '0001' },
          category: ['Games'],
          description: ['Some Game (Europe)'],
          rom: [{ '$': [] }]
        },
      ]);
    });

    it('should return only the passed game if there are no clones', () => {
      expect(getRomClonesFromDat('No clone game (Japan)', dat)).toEqual([
        {
          '$': { name: 'No clone game (Japan)', id: '0006' },
          category: ['Games'],
          description: ['No clone game (Japan)'],
          rom: [{ '$': [] }]
        },
      ]);
    });
  });

  describe('#getBestRom', () => {
    it('should return the best rom given a criteria', () => {
      const romDats = [
        'Some Game (Japan)',
        'Some Game (USA)',
        'Some Game (Europe)',
      ];

      const config = {
        preferences: [
          {
            type: 'Region',
            order: ['Europe', 'USA']
          }
        ]
      };

      const romDescriptions = romDats.map(getRomDescription);

      expect(getBestRom(romDescriptions, config)).toEqual(romDescriptions[2]);
    });
  });
});
