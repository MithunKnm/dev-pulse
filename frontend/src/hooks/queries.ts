import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzeDeveloper, checkHealth } from "../lib/api";

// Is the FastAPI backend reachable? Polls health every 30s.
export const useHealth = () =>
  useQuery({ queryKey: ["health"], queryFn: checkHealth, refetchInterval: 30_000, retry: false });

// Run the live analyze pipeline. Use as a mutation:
//   const analyze = useAnalyze();
//   analyze.mutate({ owner, repo, githubUsername });
export const useAnalyze = () =>
  useMutation({ mutationFn: analyzeDeveloper });
