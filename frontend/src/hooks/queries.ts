import { useQuery } from "@tanstack/react-query";
import {
  fetchOrg, fetchEngineers, fetchEngineer, fetchRepos, fetchSignals,
} from "../lib/api";

export const useOrg = () =>
  useQuery({ queryKey: ["org"], queryFn: fetchOrg });

export const useEngineers = () =>
  useQuery({ queryKey: ["engineers"], queryFn: fetchEngineers });

export const useEngineer = (id: string) =>
  useQuery({ queryKey: ["engineer", id], queryFn: () => fetchEngineer(id), enabled: !!id });

export const useRepos = () =>
  useQuery({ queryKey: ["repos"], queryFn: fetchRepos });

export const useSignals = () =>
  useQuery({ queryKey: ["signals"], queryFn: fetchSignals });
