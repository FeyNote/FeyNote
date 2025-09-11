import { type Resolver, type TRPCProcedureOptions } from '@trpc/client';
import { useHandleTRPCErrors } from './useHandleTRPCErrors';

type ExecuteOptions = {
  errorHandlers?: Parameters<ReturnType<typeof useHandleTRPCErrors>["handleTRPCErrors"]>[1],
  trpcOptions?: TRPCProcedureOptions
}

/**
 * A very easy-to-use TRPC wrapper with built-in error handling
 */
export const useTRPCOperation = <T extends Resolver<any>>(
  operation: T
) => {
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const execute = async (
    ...args: undefined extends Parameters<T>[0] ? [input?: Parameters<T>[0], opts?: ExecuteOptions] : [input: Parameters<T>[0], opts?: ExecuteOptions]
  ): Promise<Awaited<ReturnType<T> | undefined>> => {
    const input = args[0];
    const opts = args[1];

    const result = operation(input, opts?.trpcOptions).catch((e) => {
      handleTRPCErrors(e, opts?.errorHandlers);
    });

    return result;
  };

  return execute;
};
