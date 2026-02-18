import { JwtAuthGuard } from './jwt.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
});
