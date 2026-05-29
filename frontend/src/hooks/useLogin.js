import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, verify2FA } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // If it requires 2FA, do NOT invalidate authUser yet
      if (!data?.requiresTwoFactor) {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    },
  });

  const { mutate: verify2FAMutate, isPending: isVerifyPending, error: verifyError } = useMutation({
    mutationFn: verify2FA,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return { error, isPending, loginMutation: mutate, verifyError, isVerifyPending, verify2FAMutation: verify2FAMutate };
};

export default useLogin;
