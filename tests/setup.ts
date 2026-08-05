import { beforeAll, afterAll } from 'vitest';

const RealDate = global.Date;
const mockDate = new RealDate('2026-07-28T00:00:00.000Z');

function MockDate(...args: any[]) {
  if (args.length === 0) {
    return new RealDate(mockDate.getTime());
  }
  return new (RealDate as any)(...args);
}

MockDate.prototype = RealDate.prototype;
MockDate.now = () => mockDate.getTime();
MockDate.UTC = RealDate.UTC;
MockDate.parse = RealDate.parse;

beforeAll(() => {
  global.Date = MockDate as any;
});

afterAll(() => {
  global.Date = RealDate;
});
