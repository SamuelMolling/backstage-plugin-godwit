import { linksTo } from './links';

describe('linksTo', () => {
  it('gives no link when no public URL is configured', () => {
    for (const value of [undefined, '', '   ']) {
      const links = linksTo(value);
      expect(links.target('orders')).toBeUndefined();
      expect(links.run('r1')).toBeUndefined();
      expect(links.plan('p1')).toBeUndefined();
      expect(links.drift()).toBeUndefined();
    }
  });

  it('points at the godwit UI under the configured base', () => {
    const links = linksTo('https://godwit.example.com');
    expect(links.target('orders')).toBe('https://godwit.example.com/ui/targets/orders');
    expect(links.run('run-1')).toBe('https://godwit.example.com/ui/runs/run-1');
    expect(links.plan('plan-1')).toBe('https://godwit.example.com/ui/plans/plan-1');
    expect(links.drift()).toBe('https://godwit.example.com/ui/drift');
  });

  it('does not double the slash when the base carries one', () => {
    expect(linksTo('https://godwit.example.com//').target('orders')).toBe(
      'https://godwit.example.com/ui/targets/orders',
    );
  });

  it('escapes a name that would otherwise change the path', () => {
    expect(linksTo('https://godwit.example.com').target('a/b?c')).toBe(
      'https://godwit.example.com/ui/targets/a%2Fb%3Fc',
    );
  });
});
