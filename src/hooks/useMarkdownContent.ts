import { useQuery } from "@tanstack/react-query";

export const useMarkdownContent = (content?: string | null, filepath?: string | null) => {
  return useQuery({
    queryKey: ["markdown-content", filepath, content], // Changed: Use actual content instead of !!content
    queryFn: async () => {
      // If content is provided directly from backend, use it
      if (content) return content;
    },
    enabled: !!content,
  });
};