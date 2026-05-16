import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignUp = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (onSuccessCallback) onSuccessCallback(data);
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
