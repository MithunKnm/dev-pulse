import { useQuery, useMutation } from "@tanstack/react-query";
import {
  analyzeDeveloper,
  checkHealth,
  fetchRepos,
  fetchRepo,
  compareRepos,
  fetchDevelopers,
  fetchDeveloper,
  compareDevelopers,
} from "../lib/api";

// Is the FastAPI backend reachable? Polls health every 30s.
export const useHealth = () =>
  useQuery({ queryKey: ["health"], queryFn: checkHealth, refetchInterval: 30_000, retry: false });

// Run the live analyze pipeline. Use as a mutation:
//   const analyze = useAnalyze();
//   analyze.mutate({ owner, repo, githubUsername });
export const useAnalyze = () =>
  useMutation({ mutationFn: analyzeDeveloper });

// --- Phase 2: Repositories -------------------------------------------------

export const useRepos = () =>
  useQuery({ queryKey: ["repos"], queryFn: fetchRepos });

export const useRepo = (id: string | undefined) =>
  useQuery({ queryKey: ["repo", id], queryFn: () => fetchRepo(id as string), enabled: !!id });

export const useCompareRepos = (idA: string | undefined, idB: string | undefined) =>
  useQuery({
    queryKey: ["repos-compare", idA, idB],
    queryFn: () => compareRepos(idA as string, idB as string),
    enabled: !!idA && !!idB && idA !== idB,
  });

// --- Phase 2: Developers ---------------------------------------------------

export const useDevelopers = () =>
  useQuery({ queryKey: ["developers"], queryFn: fetchDevelopers });

export const useDeveloper = (username: string | undefined) =>
  useQuery({
    queryKey: ["developer", username],
    queryFn: () => fetchDeveloper(username as string),
    enabled: !!username,
  });

export const useCompareDevelopers = (usernameA: string | undefined, usernameB: string | undefined) =>
  useQuery({
    queryKey: ["developers-compare", usernameA, usernameB],
    queryFn: () => compareDevelopers(usernameA as string, usernameB as string),
    enabled: !!usernameA && !!usernameB && usernameA !== usernameB,
  });
