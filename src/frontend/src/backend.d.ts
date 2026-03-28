import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Template {
    name: string;
    description: string;
    styleHints: string;
}
export interface ExportMetadata {
    youtubeHashtags: Array<string>;
    instagramHashtags: Array<string>;
    youtubeTitle: string;
    youtubeDescription: string;
    instagramCaption: string;
}
export interface TemplateUpdate {
    status: string;
    title: string;
    topic: string;
    scenes: Array<Scene>;
    template: string;
    musicStyle: string;
}
export interface Scene {
    id: bigint;
    visualPrompt: string;
    duration: bigint;
    order: bigint;
    transition: string;
    description: string;
    caption: string;
}
export interface VideoProject {
    id: bigint;
    status: string;
    title: string;
    topic: string;
    scenes: Array<Scene>;
    userId: Principal;
    createdAt: bigint;
    exportMetadata?: ExportMetadata;
    updatedAt: bigint;
    template: string;
    musicStyle: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(title: string, topic: string, template: string): Promise<VideoProject>;
    deleteProject(id: bigint): Promise<boolean>;
    generateExportMetadata(projectId: bigint): Promise<ExportMetadata | null>;
    generateScenes(topic: string, template: string): Promise<Array<Scene>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(id: bigint): Promise<VideoProject | null>;
    getTemplates(): Promise<Array<Template>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listProjectsByUser(userId: Principal): Promise<Array<VideoProject>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProject(id: bigint, update: TemplateUpdate): Promise<VideoProject | null>;
}
