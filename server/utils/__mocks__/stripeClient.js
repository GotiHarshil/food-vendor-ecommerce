// Manual Jest mock — activate per test file with jest.mock("../../utils/stripeClient")
module.exports = {
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
  refunds: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};
