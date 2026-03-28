import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Template = {
    name : Text;
    description : Text;
    styleHints : Text;
  };

  type Scene = {
    id : Nat;
    order : Nat;
    description : Text;
    visualPrompt : Text;
    caption : Text;
    transition : Text;
    duration : Nat;
  };

  type ExportMetadata = {
    youtubeTitle : Text;
    youtubeDescription : Text;
    youtubeHashtags : [Text];
    instagramCaption : Text;
    instagramHashtags : [Text];
  };

  type VideoProject = {
    id : Nat;
    userId : Principal;
    title : Text;
    topic : Text;
    template : Text;
    scenes : [Scene];
    status : Text;
    musicStyle : Text;
    exportMetadata : ?ExportMetadata;
    createdAt : Int;
    updatedAt : Int;
  };

  module VideoProject {
    public func compareByLastUpdated(project1 : VideoProject, project2 : VideoProject) : Order.Order {
      Int.compare(project2.updatedAt, project1.updatedAt);
    };
  };

  public type TemplateUpdate = {
    title : Text;
    topic : Text;
    template : Text;
    scenes : [Scene];
    musicStyle : Text;
    status : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextProjectId = 0;
  var nextSceneId = 0;

  let projects = Map.empty<Nat, VideoProject>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let templates : [Template] = [
    {
      name = "educational";
      description = "Informative videos for teaching concepts or skills";
      styleHints = "clear visuals, step-by-step explanations, diagrams";
    },
    {
      name = "entertainment";
      description = "Videos focused on humor, storytelling, or fun";
      styleHints = "dynamic visuals, quick cuts, engaging captions";
    },
    {
      name = "lifestyle";
      description = "Content related to daily life, tips, and routines";
      styleHints = "relatable scenes, soft transitions, inspirational quotes";
    },
    {
      name = "promotional";
      description = "Videos designed to market products or services";
      styleHints = "highlight features, call-to-action captions, upbeat music";
    },
  ];

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Video Project Management
  public shared ({ caller }) func createProject(title : Text, topic : Text, template : Text) : async VideoProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    let id = nextProjectId;
    nextProjectId += 1;

    let project : VideoProject = {
      id;
      userId = caller;
      title;
      topic;
      template;
      scenes = [];
      status = "draft";
      musicStyle = "default";
      exportMetadata = null;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    projects.add(id, project);
    project;
  };

  public query ({ caller }) func getProject(id : Nat) : async ?VideoProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    switch (projects.get(id)) {
      case (null) { null };
      case (?project) {
        if (project.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own projects");
        };
        ?project;
      };
    };
  };

  public shared ({ caller }) func updateProject(id : Nat, update : TemplateUpdate) : async ?VideoProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };

    switch (projects.get(id)) {
      case (null) { null };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own projects");
        };

        let updatedProject : VideoProject = {
          id = existing.id;
          userId = existing.userId;
          title = update.title;
          topic = update.topic;
          template = update.template;
          scenes = update.scenes;
          status = update.status;
          musicStyle = update.musicStyle;
          exportMetadata = existing.exportMetadata;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        projects.add(id, updatedProject);
        ?updatedProject;
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete projects");
    };

    switch (projects.get(id)) {
      case (null) { false };
      case (?project) {
        if (project.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own projects");
        };
        projects.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func listProjectsByUser(userId : Principal) : async [VideoProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list projects");
    };

    if (userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own projects");
    };

    projects.values().toArray().filter(
      func(p) { p.userId == userId }
    ).sort(VideoProject.compareByLastUpdated);
  };

  public shared ({ caller }) func generateScenes(topic : Text, template : Text) : async [Scene] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate scenes");
    };

    let sceneCount = 5 + (topic.size() + template.size()) % 2;
    let transitions = ["cut", "fade", "slide", "zoom"];

    func createScene(index : Nat) : Scene {
      let sceneId = nextSceneId;
      nextSceneId += 1;
      {
        id = sceneId;
        order = index + 1;
        description = "Scene " # (index + 1).toText() # " for " # topic # " (" # template # ")";
        visualPrompt = "Visuals for scene " # (index + 1).toText();
        caption = "Caption for scene " # (index + 1).toText();
        transition = transitions[index % transitions.size()];
        duration = 10;
      };
    };

    Array.tabulate<Scene>(sceneCount, createScene);
  };

  public shared ({ caller }) func generateExportMetadata(projectId : Nat) : async ?ExportMetadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate export metadata");
    };

    switch (projects.get(projectId)) {
      case (null) { null };
      case (?project) {
        if (project.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only generate metadata for your own projects");
        };

        let metadata : ExportMetadata = {
          youtubeTitle = project.title # " - Short Video";
          youtubeDescription = "Learn more about " # project.topic # " in this engaging video!";
          youtubeHashtags = ["#" # project.template, "#shorts", "#trending"];
          instagramCaption = "Discover " # project.topic # " through our creative video! 📽️✨";
          instagramHashtags = ["#" # project.template, "#reels", "#inspiration"];
        };
        ?metadata;
      };
    };
  };

  public query func getTemplates() : async [Template] {
    templates;
  };
};
