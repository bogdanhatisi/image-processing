const result = {
  resize: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockReturnThis(),
};

export const mockSharp = jest.fn(() => result);
