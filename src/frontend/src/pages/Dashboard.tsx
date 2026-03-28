import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clapperboard,
  Clock,
  Edit2,
  Film,
  Filter,
  Layers,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import type { VideoProject } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteProject,
  useTemplates,
  useUserProjects,
} from "../hooks/useQueries";

interface DashboardProps {
  onNavigate: (page: AppPage, params?: { projectId?: bigint }) => void;
  showTemplates?: boolean;
}

const TEMPLATE_ICONS: Record<string, string> = {
  Educational: "🎓",
  Entertainment: "🎭",
  Lifestyle: "🌿",
  Promotional: "📢",
};

const TEMPLATE_THUMBS: Record<string, string> = {
  Educational: "/assets/generated/thumb-educational.dim_360x640.jpg",
  Entertainment: "/assets/generated/thumb-entertainment.dim_360x640.jpg",
  Lifestyle: "/assets/generated/thumb-lifestyle.dim_360x640.jpg",
  Promotional: "/assets/generated/thumb-promotional.dim_360x640.jpg",
};

const ACCENT_COLORS = ["border-purple", "border-pink", "border-cyan"];

const SAMPLE_PROJECTS: VideoProject[] = [
  {
    id: BigInt(1),
    title: "5 Morning Habits That Changed My Life",
    topic: "morning productivity habits",
    template: "Lifestyle",
    scenes: Array(6)
      .fill(null)
      .map((_, i) => ({
        id: BigInt(i),
        visualPrompt: "",
        duration: BigInt(5),
        order: BigInt(i),
        transition: "fade",
        description: "",
        caption: "",
      })),
    status: "ready",
    userId: {} as any,
    createdAt: BigInt(Date.now() - 86400000),
    updatedAt: BigInt(Date.now() - 86400000),
    musicStyle: "Chill",
  },
  {
    id: BigInt(2),
    title: "The Science Behind Viral Videos",
    topic: "viral video psychology",
    template: "Educational",
    scenes: Array(5)
      .fill(null)
      .map((_, i) => ({
        id: BigInt(i),
        visualPrompt: "",
        duration: BigInt(5),
        order: BigInt(i),
        transition: "cut",
        description: "",
        caption: "",
      })),
    status: "draft",
    userId: {} as any,
    createdAt: BigInt(Date.now() - 172800000),
    updatedAt: BigInt(Date.now() - 172800000),
    musicStyle: "Upbeat",
  },
  {
    id: BigInt(3),
    title: "Comedy Sketch: Office Life",
    topic: "office comedy sketch",
    template: "Entertainment",
    scenes: Array(8)
      .fill(null)
      .map((_, i) => ({
        id: BigInt(i),
        visualPrompt: "",
        duration: BigInt(4),
        order: BigInt(i),
        transition: "cut",
        description: "",
        caption: "",
      })),
    status: "ready",
    userId: {} as any,
    createdAt: BigInt(Date.now() - 259200000),
    updatedAt: BigInt(Date.now() - 259200000),
    musicStyle: "Upbeat",
  },
];

function formatDate(ns: bigint) {
  const ms = Number(ns) > 1e15 ? Number(ns) / 1e6 : Number(ns);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
}: {
  project: VideoProject;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accentColor = ACCENT_COLORS[index % 3];
  const thumb = TEMPLATE_THUMBS[project.template];
  const totalDuration = project.scenes.reduce(
    (acc, s) => acc + Number(s.duration),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="group bg-surface-2 rounded-2xl overflow-hidden border border-border hover:border-purple/30 transition-all duration-300 hover:shadow-glow"
      data-ocid={`projects.item.${index + 1}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/5] overflow-hidden bg-surface-3">
        {thumb && (
          <img
            src={thumb}
            alt={project.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge
            className={`text-[10px] font-semibold ${
              project.status === "ready"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            } border`}
          >
            {project.status === "ready" ? "✓ Ready" : "Draft"}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <span className="text-xl">
            {TEMPLATE_ICONS[project.template] || "🎬"}
          </span>
        </div>
      </div>

      {/* Card body with left accent border */}
      <div className={`border-l-2 ${accentColor} pl-4 py-4 pr-4`}>
        <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 line-clamp-2">
          {project.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {project.scenes.length} scenes
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalDuration}s
          </span>
          <span className="text-[10px] opacity-70">
            {formatDate(project.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-border text-muted-foreground"
          >
            {project.template}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] border-border text-muted-foreground"
          >
            {project.musicStyle}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <button
          type="button"
          data-ocid={`projects.edit_button.${index + 1}`}
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-purple transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
        <div className="w-px bg-border" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              data-ocid={`projects.delete_button.${index + 1}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-surface-3 border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will permanently delete "{project.title}". This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="projects.delete.cancel_button"
                className="bg-surface-4 border-border"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="projects.delete.confirm_button"
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

export default function Dashboard({
  onNavigate,
  showTemplates,
}: DashboardProps) {
  const { identity } = useInternetIdentity();
  const { data: projects, isLoading } = useUserProjects();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const deleteProject = useDeleteProject();
  const [search, setSearch] = useState("");

  const displayProjects = identity ? (projects ?? []) : SAMPLE_PROJECTS;
  const filtered = displayProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  if (showTemplates) {
    return (
      <div className="min-h-full p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Templates</h1>
          <p className="text-muted-foreground text-sm">
            Choose a style to start your video
          </p>
        </header>

        {templatesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl bg-surface-3" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              templates ?? [
                {
                  name: "Educational",
                  description: "Teach your audience something valuable",
                  styleHints: "Clean, informative",
                },
                {
                  name: "Entertainment",
                  description: "Keep viewers hooked with fun content",
                  styleHints: "Dynamic, energetic",
                },
                {
                  name: "Lifestyle",
                  description: "Share your life and daily routines",
                  styleHints: "Warm, personal",
                },
                {
                  name: "Promotional",
                  description: "Showcase products and services",
                  styleHints: "Bold, commercial",
                },
              ]
            ).map((tpl, i) => (
              <motion.div
                key={tpl.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => onNavigate("studio")}
                className="bg-surface-2 rounded-xl overflow-hidden border border-border hover:border-purple/40 cursor-pointer transition-all hover:shadow-glow group"
              >
                <div className="h-32 relative overflow-hidden">
                  <img
                    src={TEMPLATE_THUMBS[tpl.name] || ""}
                    alt={tpl.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 gradient-brand opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    {TEMPLATE_ICONS[tpl.name]}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 text-[10px] border-purple/30 text-purple"
                  >
                    {tpl.styleHints}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-full p-8">
      {/* Header */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            My Projects
          </h1>
          <p className="text-muted-foreground text-sm">
            {identity
              ? `${displayProjects.length} video project${displayProjects.length !== 1 ? "s" : ""}`
              : "Sign in to manage your projects"}
          </p>
        </div>
        <Button
          data-ocid="dashboard.new_video.primary_button"
          onClick={() => onNavigate("studio")}
          className="gradient-brand text-white hover:opacity-90 font-semibold rounded-full px-5 h-10"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Video
        </Button>
      </header>

      {/* Search & filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="dashboard.search_input"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface-3 border-border h-9 text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-border text-muted-foreground h-9"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </Button>
      </div>

      {/* Projects grid */}
      {isLoading && identity ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="dashboard.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl bg-surface-3" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="dashboard.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-4 glow-purple">
              <Clapperboard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No videos yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Create your first AI-powered short video in minutes.
            </p>
            <Button
              data-ocid="dashboard.create_first.primary_button"
              onClick={() => onNavigate("studio")}
              className="gradient-brand text-white hover:opacity-90 font-semibold rounded-full px-6 h-10"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Video
            </Button>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="projects.list"
        >
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id.toString()}
              project={project}
              index={i}
              onEdit={() => onNavigate("studio", { projectId: project.id })}
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      )}

      {/* Stats row */}
      {displayProjects.length > 0 && (
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Videos",
              value: displayProjects.length,
              icon: Film,
              color: "text-purple",
            },
            {
              label: "Ready to Export",
              value: displayProjects.filter((p) => p.status === "ready").length,
              icon: Star,
              color: "text-pink",
            },
            {
              label: "Total Scenes",
              value: displayProjects.reduce((a, p) => a + p.scenes.length, 0),
              icon: Layers,
              color: "text-cyan",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-surface-2 rounded-xl p-4 border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple hover:text-purple-light transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
