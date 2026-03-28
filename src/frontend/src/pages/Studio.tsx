import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Film,
  Hash,
  Loader2,
  Music,
  RefreshCw,
  Save,
  Wand2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import type { ExportMetadata, Scene } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateProject,
  useGenerateExportMetadata,
  useGenerateScenes,
  useTemplates,
  useUpdateProject,
} from "../hooks/useQueries";

interface StudioProps {
  projectId?: bigint;
  onNavigate: (page: AppPage) => void;
}

const TEMPLATE_ICONS: Record<string, string> = {
  Educational: "🎓",
  Entertainment: "🎭",
  Lifestyle: "🌿",
  Promotional: "📢",
};

const ACCENT_COLORS = [
  { border: "border-l-purple", bg: "bg-purple/10", text: "text-purple" },
  { border: "border-l-pink", bg: "bg-pink/10", text: "text-pink" },
  { border: "border-l-cyan", bg: "bg-cyan/10", text: "text-cyan" },
];

const MUSIC_STYLES = [
  { id: "Chill", icon: "🎵", label: "Chill" },
  { id: "Upbeat", icon: "⚡", label: "Upbeat" },
  { id: "Dramatic", icon: "🎬", label: "Dramatic" },
  { id: "Ambient", icon: "🌊", label: "Ambient" },
  { id: "None", icon: "🔇", label: "None" },
];

const TRANSITIONS = [
  { id: "cut", label: "Cut", icon: "✂️" },
  { id: "fade", label: "Fade", icon: "🌫️" },
  { id: "slide", label: "Slide", icon: "▶️" },
  { id: "zoom", label: "Zoom", icon: "🔍" },
];

const DEFAULT_TEMPLATES = [
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
];

function PhonePreview({
  scene,
  sceneIndex,
  totalScenes,
}: { scene?: Scene; sceneIndex: number; totalScenes: number }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[160px] phone-frame rounded-[28px] overflow-hidden"
        style={{ aspectRatio: "9/16" }}
      >
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-surface-1 rounded-b-xl z-10" />

        {/* Content */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-3 to-surface-1 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-3 pt-8">
            <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center mb-3 glow-purple">
              <Film className="w-5 h-5 text-white" />
            </div>
            {scene ? (
              <>
                <p className="text-[9px] text-center text-foreground font-medium leading-tight line-clamp-4">
                  {scene.description || "Scene description"}
                </p>
                {scene.caption && (
                  <div className="mt-2 bg-black/50 rounded px-1.5 py-0.5">
                    <p className="text-[8px] text-center text-white">
                      {scene.caption}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[9px] text-center text-muted-foreground">
                Preview your scene here
              </p>
            )}
          </div>

          {/* Bottom bar */}
          <div className="bg-black/40 px-3 py-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] text-white/70">
                Scene {sceneIndex + 1}/{totalScenes || 1}
              </span>
              <span className="text-[8px] text-white/70">
                {scene ? `${scene.duration}s` : "5s"}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-0.5">
              <div
                className="gradient-brand h-0.5 rounded-full transition-all"
                style={{
                  width: `${totalScenes > 0 ? ((sceneIndex + 1) / totalScenes) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">9:16 Preview</div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  const steps = ["Script & Storyboard", "Timeline Editor", "Export"];
  return (
    <div className="flex items-center gap-2" data-ocid="studio.step_indicator">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = num === step;
        const isDone = num < step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isActive && "gradient-brand text-white glow-purple",
                  isDone && "bg-purple/20 text-purple border border-purple/30",
                  !isActive &&
                    !isDone &&
                    "bg-surface-4 text-muted-foreground border border-border",
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : num}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mx-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Studio({ projectId, onNavigate }: StudioProps) {
  const { identity } = useInternetIdentity();
  const { data: templates } = useTemplates();
  const generateScenesMutation = useGenerateScenes();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const generateExportMutation = useGenerateExportMetadata();

  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("Educational");
  const [projectTitle, setProjectTitle] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [musicStyle, setMusicStyle] = useState("Chill");
  const [currentProjectId, setCurrentProjectId] = useState<bigint | undefined>(
    projectId,
  );
  const [exportMetadata, setExportMetadata] = useState<ExportMetadata | null>(
    null,
  );
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);

  const displayTemplates = templates ?? DEFAULT_TEMPLATES;

  const handleGenerateScript = useCallback(async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }
    try {
      const generated = await generateScenesMutation.mutateAsync({
        topic,
        template: selectedTemplate,
      });
      const sorted = [...generated].sort(
        (a, b) => Number(a.order) - Number(b.order),
      );
      setScenes(sorted);
      if (!projectTitle) {
        setProjectTitle(`${topic.slice(0, 40)} — ${selectedTemplate}`);
      }
      toast.success(`Generated ${sorted.length} scenes!`);
    } catch {
      // Fallback: generate mock scenes for demo
      const mockScenes: Scene[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: BigInt(i + 1),
          order: BigInt(i),
          duration: BigInt(5 + i),
          transition: "fade",
          description: [
            `Opening hook: ${topic} — grab attention in the first 3 seconds`,
            `Introduce the main concept of ${topic} with a compelling visual`,
            `Deep dive into the key points that make ${topic} fascinating`,
            `Show real-world examples and case studies related to ${topic}`,
            "Call to action: encourage viewers to like, follow, and explore more",
          ][i],
          visualPrompt: `Cinematic shot showing ${topic}, scene ${i + 1}, vibrant colors`,
          caption: [
            `🚀 Did you know about ${topic}?`,
            "💡 Here's the key insight...",
            "📊 The data shows...",
            "✨ Real examples that work",
            "👇 Follow for more content like this!",
          ][i],
        }));
      setScenes(mockScenes);
      if (!projectTitle)
        setProjectTitle(`${topic.slice(0, 40)} — ${selectedTemplate}`);
      toast.success("Generated 5 scenes (demo mode)");
    }
  }, [topic, selectedTemplate, generateScenesMutation, projectTitle]);

  const handleSaveAndContinue = useCallback(async () => {
    if (!identity) {
      toast.error("Please sign in to save your project");
      return;
    }
    try {
      if (!currentProjectId) {
        const project = await createProjectMutation.mutateAsync({
          title: projectTitle || `${topic} — ${selectedTemplate}`,
          topic,
          template: selectedTemplate,
        });
        setCurrentProjectId(project.id);
        await updateProjectMutation.mutateAsync({
          id: project.id,
          update: {
            title: projectTitle || `${topic} — ${selectedTemplate}`,
            topic,
            template: selectedTemplate,
            scenes,
            musicStyle,
            status: "draft",
          },
        });
      } else {
        await updateProjectMutation.mutateAsync({
          id: currentProjectId,
          update: {
            title: projectTitle,
            topic,
            template: selectedTemplate,
            scenes,
            musicStyle,
            status: "draft",
          },
        });
      }
      toast.success("Project saved!");
      setStep(3);
    } catch {
      toast.error("Failed to save project");
      // Still allow progression in demo
      setStep(3);
    }
  }, [
    identity,
    currentProjectId,
    projectTitle,
    topic,
    selectedTemplate,
    scenes,
    musicStyle,
    createProjectMutation,
    updateProjectMutation,
  ]);

  const handleGenerateExport = useCallback(async () => {
    if (!currentProjectId) {
      // Generate mock export metadata
      const mock: ExportMetadata = {
        youtubeTitle: `${projectTitle || topic} | #Shorts`,
        youtubeDescription: `Discover everything about ${topic} in this quick ${scenes.length * 5}-second video! Perfect for learning on the go.\n\nTimestamps:\n${scenes.map((_, i) => `0:${String(i * 5).padStart(2, "0")} - Scene ${i + 1}`).join("\n")}`,
        youtubeHashtags: [
          "Shorts",
          "YouTubeShorts",
          topic.replace(/ /g, ""),
          "Trending",
          "ViralVideo",
          "ShortVideo",
        ],
        instagramCaption: `✨ ${topic} — swipe up to watch the full reel! 🎬\n\nSave this for later and share with friends who'd love it! 💫`,
        instagramHashtags: [
          "Reels",
          "InstagramReels",
          "Viral",
          topic.replace(/ /g, ""),
          "ContentCreator",
          "ShortVideo",
          "Trending",
        ],
      };
      setExportMetadata(mock);
      toast.success("Export metadata generated!");
      return;
    }
    try {
      const metadata =
        await generateExportMutation.mutateAsync(currentProjectId);
      if (metadata) {
        setExportMetadata(metadata);
        toast.success("Export metadata generated!");
      }
    } catch {
      toast.error("Failed to generate metadata");
    }
  }, [currentProjectId, projectTitle, topic, scenes, generateExportMutation]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied!`));
  };

  const moveScene = (index: number, dir: -1 | 1) => {
    const newScenes = [...scenes];
    const target = index + dir;
    if (target < 0 || target >= newScenes.length) return;
    [newScenes[index], newScenes[target]] = [
      newScenes[target],
      newScenes[index],
    ];
    setScenes(newScenes);
    setSelectedSceneIdx(target);
  };

  const updateScene = (index: number, update: Partial<Scene>) => {
    setScenes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...update } : s)),
    );
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0 bg-surface-1/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            data-ocid="studio.back.button"
            onClick={() => onNavigate("dashboard")}
            className="text-muted-foreground hover:text-foreground -ml-2 h-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <StepIndicator step={step} />
        </div>
        <div className="flex items-center gap-2">
          {step === 2 && (
            <Button
              variant="outline"
              size="sm"
              data-ocid="studio.save.button"
              onClick={handleSaveAndContinue}
              disabled={
                updateProjectMutation.isPending ||
                createProjectMutation.isPending
              }
              className="border-border text-muted-foreground hover:text-foreground h-8 text-xs"
            >
              {updateProjectMutation.isPending ||
              createProjectMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save
            </Button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* STEP 1: Script & Storyboard */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex"
            >
              {/* Left: Controls */}
              <div className="w-[380px] flex-shrink-0 border-r border-border overflow-y-auto scrollbar-thin p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">
                    Script & Storyboard
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter a topic and let AI write your video script
                  </p>
                </div>

                {/* Topic input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="topic"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Video Topic
                  </Label>
                  <Textarea
                    id="topic"
                    data-ocid="studio.topic.textarea"
                    placeholder="e.g. 5 morning habits that will change your life..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-surface-3 border-border resize-none text-sm h-24"
                  />
                </div>

                {/* Template selector */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Template Style
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {displayTemplates.map((tpl) => (
                      <button
                        type="button"
                        key={tpl.name}
                        data-ocid={`studio.template.${tpl.name.toLowerCase()}.button`}
                        onClick={() => setSelectedTemplate(tpl.name)}
                        className={cn(
                          "relative p-3 rounded-xl border text-left transition-all",
                          selectedTemplate === tpl.name
                            ? "border-purple/50 bg-purple/10 glow-purple"
                            : "border-border bg-surface-3 hover:border-border hover:bg-surface-4",
                        )}
                      >
                        <div className="text-2xl mb-1">
                          {TEMPLATE_ICONS[tpl.name] || "🎬"}
                        </div>
                        <div className="text-xs font-semibold text-foreground">
                          {tpl.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                          {tpl.description}
                        </div>
                        {selectedTemplate === tpl.name && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full gradient-brand flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <Button
                  data-ocid="studio.generate_script.primary_button"
                  onClick={handleGenerateScript}
                  disabled={generateScenesMutation.isPending || !topic.trim()}
                  className="w-full gradient-brand text-white hover:opacity-90 font-semibold rounded-full h-11"
                >
                  {generateScenesMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Script
                    </>
                  )}
                </Button>

                {scenes.length > 0 && (
                  <Button
                    data-ocid="studio.next_step.button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="w-full border-purple/30 text-purple hover:bg-purple/10 rounded-full h-10 font-semibold"
                  >
                    Continue to Editor
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                )}
              </div>

              {/* Right: Storyboard */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                {generateScenesMutation.isPending ? (
                  <div
                    className="space-y-4"
                    data-ocid="studio.scenes.loading_state"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        className="h-28 rounded-xl bg-surface-3"
                      />
                    ))}
                  </div>
                ) : scenes.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full text-center"
                    data-ocid="studio.scenes.empty_state"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-surface-3 border border-border flex items-center justify-center mb-4">
                      <Wand2 className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      No scenes yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Enter a topic and click Generate Script to create your
                      storyboard.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" data-ocid="studio.scenes.list">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        {scenes.length} Scenes Generated
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateScript}
                        className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </Button>
                    </div>
                    {scenes.map((scene, i) => {
                      const accent = ACCENT_COLORS[i % 3];
                      return (
                        <motion.div
                          key={scene.id.toString()}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          data-ocid={`studio.scene.item.${i + 1}`}
                          className={`bg-surface-2 rounded-xl border-l-4 ${accent.border} border-t border-r border-b border-border p-4`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-full ${accent.bg} ${accent.text} flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}
                              >
                                {i + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-foreground leading-snug">
                                  {scene.description}
                                </p>
                                {scene.caption && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    "{scene.caption}"
                                  </p>
                                )}
                                {scene.visualPrompt && (
                                  <p className="text-[11px] text-muted-foreground/70 mt-1.5 line-clamp-1">
                                    🎨 {scene.visualPrompt}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="flex-shrink-0 text-[10px] border-border text-muted-foreground"
                            >
                              <Clock className="w-2.5 h-2.5 mr-1" />
                              {scene.duration}s
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Timeline Editor */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="flex flex-1 overflow-hidden">
                {/* Left: Scene list */}
                <div className="w-[300px] flex-shrink-0 border-r border-border overflow-y-auto scrollbar-thin p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Scenes
                  </h3>
                  {scenes.map((scene, i) => {
                    const accent = ACCENT_COLORS[i % 3];
                    const isSelected = selectedSceneIdx === i;
                    return (
                      <button
                        type="button"
                        key={scene.id.toString()}
                        data-ocid={`editor.scene.item.${i + 1}`}
                        onClick={() => setSelectedSceneIdx(i)}
                        className={cn(
                          "rounded-xl border-l-4 border-t border-r border-b p-3 cursor-pointer transition-all",
                          accent.border,
                          isSelected
                            ? "border-border bg-surface-3 ring-1 ring-purple/30"
                            : "border-border bg-surface-2 hover:bg-surface-3",
                        )}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`text-xs font-bold ${accent.text}`}>
                            Scene {i + 1}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              data-ocid={`editor.scene.move_up.${i + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveScene(i, -1);
                              }}
                              disabled={i === 0}
                              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              data-ocid={`editor.scene.move_down.${i + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveScene(i, 1);
                              }}
                              disabled={i === scenes.length - 1}
                              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                          {scene.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="text-[9px] border-border"
                          >
                            {scene.transition}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[9px] border-border"
                          >
                            {scene.duration}s
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Center: Preview + Title */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
                  <div className="space-y-2 w-full max-w-xs">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Video Title
                    </Label>
                    <Input
                      data-ocid="editor.title.input"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="Enter your video title..."
                      className="bg-surface-3 border-border text-sm"
                    />
                  </div>
                  <PhonePreview
                    scene={scenes[selectedSceneIdx]}
                    sceneIndex={selectedSceneIdx}
                    totalScenes={scenes.length}
                  />
                  {/* Music style */}
                  <div className="space-y-2 w-full max-w-xs">
                    <div className="flex items-center gap-2">
                      <Music className="w-3.5 h-3.5 text-muted-foreground" />
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Music Style
                      </Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MUSIC_STYLES.map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          data-ocid={`editor.music.${m.id.toLowerCase()}.toggle`}
                          onClick={() => setMusicStyle(m.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            musicStyle === m.id
                              ? "gradient-brand text-white border-transparent"
                              : "border-border text-muted-foreground bg-surface-3 hover:border-purple/30 hover:text-foreground",
                          )}
                        >
                          <span>{m.icon}</span>
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Scene properties */}
                <div className="w-[280px] flex-shrink-0 border-l border-border overflow-y-auto scrollbar-thin p-4 space-y-5">
                  {scenes[selectedSceneIdx] ? (
                    <>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Scene {selectedSceneIdx + 1} Properties
                      </h3>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Caption / Subtitle
                        </Label>
                        <Input
                          data-ocid={"editor.caption.input"}
                          value={scenes[selectedSceneIdx].caption}
                          onChange={(e) =>
                            updateScene(selectedSceneIdx, {
                              caption: e.target.value,
                            })
                          }
                          placeholder="Enter caption..."
                          className="bg-surface-3 border-border text-xs h-8"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Duration (seconds)
                        </Label>
                        <div className="flex gap-1">
                          {[3, 5, 7, 10].map((d) => (
                            <button
                              type="button"
                              key={d}
                              data-ocid={`editor.duration.${d}s.button`}
                              onClick={() =>
                                updateScene(selectedSceneIdx, {
                                  duration: BigInt(d),
                                })
                              }
                              className={cn(
                                "flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                Number(scenes[selectedSceneIdx].duration) === d
                                  ? "gradient-brand text-white border-transparent"
                                  : "border-border text-muted-foreground bg-surface-3 hover:border-purple/30",
                              )}
                            >
                              {d}s
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Transition
                        </Label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {TRANSITIONS.map((t) => (
                            <button
                              type="button"
                              key={t.id}
                              data-ocid={`editor.transition.${t.id}.button`}
                              onClick={() =>
                                updateScene(selectedSceneIdx, {
                                  transition: t.id,
                                })
                              }
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                                scenes[selectedSceneIdx].transition === t.id
                                  ? "border-purple/50 bg-purple/10 text-purple"
                                  : "border-border text-muted-foreground bg-surface-3 hover:border-purple/20",
                              )}
                            >
                              <span>{t.icon}</span>
                              <span>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Visual Prompt
                        </Label>
                        <Textarea
                          data-ocid="editor.visual_prompt.textarea"
                          value={scenes[selectedSceneIdx].visualPrompt}
                          onChange={(e) =>
                            updateScene(selectedSceneIdx, {
                              visualPrompt: e.target.value,
                            })
                          }
                          placeholder="Describe the visual for this scene..."
                          className="bg-surface-3 border-border text-xs resize-none h-20"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Select a scene to edit
                    </p>
                  )}

                  <div className="pt-4 border-t border-border space-y-2">
                    <Button
                      data-ocid="studio.export_step.primary_button"
                      onClick={handleSaveAndContinue}
                      disabled={
                        createProjectMutation.isPending ||
                        updateProjectMutation.isPending
                      }
                      className="w-full gradient-brand text-white hover:opacity-90 font-semibold rounded-full h-10 text-sm"
                    >
                      {createProjectMutation.isPending ||
                      updateProjectMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue to Export{" "}
                          <ChevronRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-ocid="studio.back_step1.button"
                      onClick={() => setStep(1)}
                      className="w-full text-muted-foreground hover:text-foreground h-8 text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                      Back to Script
                    </Button>
                  </div>
                </div>
              </div>

              {/* Timeline bar */}
              <div className="border-t border-border bg-surface-1 px-4 py-3">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
                  <span className="text-[10px] text-muted-foreground mr-2 flex-shrink-0">
                    Timeline
                  </span>
                  {scenes.map((scene, i) => {
                    const accent = ACCENT_COLORS[i % 3];
                    const width = Math.max(48, Number(scene.duration) * 10);
                    return (
                      <button
                        type="button"
                        key={scene.id.toString()}
                        data-ocid={`timeline.scene.${i + 1}.button`}
                        onClick={() => setSelectedSceneIdx(i)}
                        style={{ width: `${width}px`, minWidth: `${width}px` }}
                        className={cn(
                          "h-10 rounded-md text-[9px] font-bold border flex-shrink-0 transition-all",
                          accent.bg,
                          accent.text,
                          selectedSceneIdx === i
                            ? "ring-1 ring-purple/50 border-purple/30"
                            : "border-border opacity-70 hover:opacity-100",
                        )}
                      >
                        S{i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Export */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto scrollbar-thin p-8"
            >
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 glow-purple">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Export Your Video
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Generate optimized metadata for YouTube Shorts and Instagram
                    Reels
                  </p>
                </div>

                {!exportMetadata ? (
                  <div className="text-center py-4">
                    <Button
                      data-ocid="export.generate.primary_button"
                      onClick={handleGenerateExport}
                      disabled={generateExportMutation.isPending}
                      className="gradient-brand text-white hover:opacity-90 font-semibold rounded-full px-8 h-11"
                    >
                      {generateExportMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating metadata...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Export Metadata
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-ocid="export.metadata.panel"
                  >
                    <Tabs defaultValue="youtube">
                      <TabsList
                        className="w-full bg-surface-3 mb-6"
                        data-ocid="export.platform.tab"
                      >
                        <TabsTrigger
                          value="youtube"
                          className="flex-1 data-[state=active]:gradient-brand data-[state=active]:text-white"
                        >
                          📺 YouTube Shorts
                        </TabsTrigger>
                        <TabsTrigger
                          value="instagram"
                          className="flex-1 data-[state=active]:gradient-brand data-[state=active]:text-white"
                        >
                          📸 Instagram Reels
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="youtube" className="space-y-4">
                        <ExportField
                          label="Title"
                          value={exportMetadata.youtubeTitle}
                          onCopy={() =>
                            copyToClipboard(
                              exportMetadata.youtubeTitle,
                              "Title",
                            )
                          }
                          ocid="export.youtube.title"
                        />
                        <ExportField
                          label="Description"
                          value={exportMetadata.youtubeDescription}
                          multiline
                          onCopy={() =>
                            copyToClipboard(
                              exportMetadata.youtubeDescription,
                              "Description",
                            )
                          }
                          ocid="export.youtube.description"
                        />
                        <HashtagChips
                          hashtags={exportMetadata.youtubeHashtags}
                          onCopy={() =>
                            copyToClipboard(
                              exportMetadata.youtubeHashtags
                                .map((h) => `#${h}`)
                                .join(" "),
                              "Hashtags",
                            )
                          }
                          ocid="export.youtube.hashtags"
                        />
                      </TabsContent>

                      <TabsContent value="instagram" className="space-y-4">
                        <ExportField
                          label="Caption"
                          value={exportMetadata.instagramCaption}
                          multiline
                          onCopy={() =>
                            copyToClipboard(
                              exportMetadata.instagramCaption,
                              "Caption",
                            )
                          }
                          ocid="export.instagram.caption"
                        />
                        <HashtagChips
                          hashtags={exportMetadata.instagramHashtags}
                          onCopy={() =>
                            copyToClipboard(
                              exportMetadata.instagramHashtags
                                .map((h) => `#${h}`)
                                .join(" "),
                              "Hashtags",
                            )
                          }
                          ocid="export.instagram.hashtags"
                        />
                      </TabsContent>
                    </Tabs>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        data-ocid="export.regenerate.button"
                        onClick={handleGenerateExport}
                        className="flex-1 border-border text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        data-ocid="export.done.button"
                        onClick={() => onNavigate("dashboard")}
                        className="flex-1 gradient-brand text-white hover:opacity-90 font-semibold rounded-full"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Done — View Projects
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid="studio.back_step2.button"
                    onClick={() => setStep(2)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Back to Editor
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExportField({
  label,
  value,
  multiline,
  onCopy,
  ocid,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onCopy: () => void;
  ocid: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        <button
          type="button"
          data-ocid={`${ocid}.button`}
          onClick={onCopy}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-purple transition-colors"
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
      <div
        data-ocid={`${ocid}.panel`}
        className="bg-surface-3 border border-border rounded-xl p-3 text-sm text-foreground"
      >
        {multiline ? (
          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
            {value}
          </pre>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}

function HashtagChips({
  hashtags,
  onCopy,
  ocid,
}: {
  hashtags: string[];
  onCopy: () => void;
  ocid: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hashtags
          </Label>
        </div>
        <button
          type="button"
          data-ocid={`${ocid}.button`}
          onClick={onCopy}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-purple transition-colors"
        >
          <Copy className="w-3 h-3" />
          Copy All
        </button>
      </div>
      <div className="flex flex-wrap gap-2" data-ocid={`${ocid}.panel`}>
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple/10 text-purple border border-purple/20"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
