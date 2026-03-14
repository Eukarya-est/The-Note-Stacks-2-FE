import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { toast } from "sonner";

// Re-export the Cover type from API
export type { Cover } from "@/lib/api";

/**
 * Hook to fetch all covers/categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ["cover"],
    queryFn: async () => {
      const covers = await api.getAllCovers();
      // Filter only valid covers and sort by category name
      return covers
        .filter(cover => cover.valid)
        .sort((a, b) => a.category.localeCompare(b.category));
    },
  });
};

/**
 * Hook to fetch a single cover by ID
 */
export const useCover = (coverId: string | null) => {
  return useQuery({
    queryKey: ["cover", coverId],
    queryFn: () => {
      if (!coverId) throw new Error("Cover ID is required");
      return api.getCover(coverId);
    },
    enabled: !!coverId,
  });
};

/**
 * Hook to create a new cover
 */
export const useCreateCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createCover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing cover
 */
export const useUpdateCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: api.UpdateCoverRequest }) =>
      api.updateCover(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["cover", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["cover"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a cover
 */
export const useDeleteCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteCover,
    onSuccess: (_, coverId) => {
      queryClient.removeQueries({ queryKey: ["cover", coverId] });
      queryClient.invalidateQueries({ queryKey: ["cover"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
};
