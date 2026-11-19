// Server data + caching with TanStack Query. Pages use these hooks instead of calling the API.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, getAllTasks, getTask, getTasks, resetTasks, updateTask } from "../services/service";

// Query keys. Everything starts with "tasks", so one invalidate clears all task data.
export const taskKeys = {
  all: ["tasks"],
  list: (filters) => ["tasks", "list", filters],
  everything: ["tasks", "everything"],
  detail: (id) => ["tasks", "detail", String(id)],
};

// Each filter combination is cached under its own key. Old pages stay on screen
// while the next page loads (keepPreviousData).
export function useTaskList(filters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => getTasks(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAllTasks() {
  return useQuery({ queryKey: taskKeys.everything, queryFn: getAllTasks });
}

export function useTask(id, enabled = true) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    enabled,
    retry: (count, error) => !error.notFound && count < 2, // a missing task will not appear by retrying
  });
}

// After any change, all cached task data is marked old and refetched.
function useTaskMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export const useCreateTask = () => useTaskMutation(createTask);
export const useUpdateTask = () => useTaskMutation(({ id, changes }) => updateTask(id, changes));
export const useDeleteTask = () => useTaskMutation(deleteTask);
export const useResetTasks = () => useTaskMutation(resetTasks);
