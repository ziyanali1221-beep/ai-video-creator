import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExportMetadata, Scene, TemplateUpdate } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTemplates();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUserProjects() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["projects", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listProjectsByUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useProject(id: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["project", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGenerateScenes() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      topic,
      template,
    }: { topic: string; template: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.generateScenes(topic, template);
    },
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      topic,
      template,
    }: {
      title: string;
      topic: string;
      template: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProject(title, topic, template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      update,
    }: {
      id: bigint;
      update: TemplateUpdate;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProject(id, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useGenerateExportMetadata() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (projectId: bigint): Promise<ExportMetadata | null> => {
      if (!actor) throw new Error("Not connected");
      return actor.generateExportMetadata(projectId);
    },
  });
}

export function useScenes() {
  return { scenes: [] as Scene[] };
}
