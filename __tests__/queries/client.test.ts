import '@testing-library/jest-dom';
import { createQueryClient } from '../../src/queries/client';

describe('Query Client', () => {
  it('should create a query client with default options', () => {
    const queryClient = createQueryClient();

    expect(queryClient).toBeDefined();
    expect(typeof queryClient).toBe('object');
  });

  it('should create a new instance each time', () => {
    const client1 = createQueryClient();
    const client2 = createQueryClient();

    expect(client1).not.toBe(client2);
  });

  it('should have default options configured', () => {
    const queryClient = createQueryClient();

    // Access the default options through the client's internal configuration
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries).toBeDefined();
    expect(defaultOptions.queries?.retry).toBe(1);
    expect(defaultOptions.queries?.staleTime).toBe(0);
  });

  it('should be able to set and get queries', () => {
    const queryClient = createQueryClient();

    // Test that we can set a query
    queryClient.setQueryData(['test'], { data: 'test' });

    // Test that we can get the query
    const data = queryClient.getQueryData(['test']);
    expect(data).toEqual({ data: 'test' });
  });

  it('should be able to clear queries', () => {
    const queryClient = createQueryClient();

    // Set some data
    queryClient.setQueryData(['test'], { data: 'test' });
    expect(queryClient.getQueryData(['test'])).toEqual({ data: 'test' });

    // Clear all queries
    queryClient.clear();
    expect(queryClient.getQueryData(['test'])).toBeUndefined();
  });

  it('should have proper retry configuration', () => {
    const queryClient = createQueryClient();
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.retry).toBe(1);
  });

  it('should have proper stale time configuration', () => {
    const queryClient = createQueryClient();
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(0);
  });
});
