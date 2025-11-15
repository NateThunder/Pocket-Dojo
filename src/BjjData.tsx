// Pocket Dojo data library ---------------------------------------------------
// Houses the move taxonomy and directed edges so gameplay code can stay agnostic.
// Edit the arrays below to remix the curriculum or add entirely new flows.

// Optional types to keep your app sane
export type StageId = 1 | 2 | 3 | 4
export type MoveType =
  | "Entry"
  | "Transition"
  | "Sweep"
  | "Pass"
  | "Escape"
  | "Submission"
  | "Control"
  | "Takedown"

export interface BJJNode {
  id: string
  name: string
  type: MoveType
  group: string
  stage: StageId
  aliases: string[]
  prereq: string[] // node ids that must be known
  notes_md: string
}

export interface BJJEdge {
  from: string
  to: string
  kind: "standard" | "optional"
}

export interface StageRule {
  id: StageId
  name: string
  description: string
  allowedTypes: MoveType[] // move types that make sense in this stage
}

// Stage descriptions control what type of moves make sense at each belt phase.
const stages = [
  {
    id: 1,
    name: "Standing Entries",
    description: "Start on feet. Entries to the ground with control.",
    allowedTypes: ["Entry", "Transition", "Control", "Takedown"],
  },
  {
    id: 2,
    name: "Primary Positions",
    description:
      "Closed/open guard, half guard, side control, mount, back. Focus on positional control and survival.",
    allowedTypes: ["Control", "Escape", "Transition", "Pass", "Entry"],
  },
  {
    id: 3,
    name: "Attacks and Sweeps",
    description: "High-percentage sweeps and submissions from stable positions.",
    allowedTypes: ["Sweep", "Submission", "Transition"],
  },
  {
    id: 4,
    name: "Advancements and Finishes",
    description: "Chain attacks, advanced passes, finishing mechanics, consolidations to dominant control.",
    allowedTypes: ["Pass", "Submission", "Transition", "Control"],
  },
] satisfies StageRule[]

// Primary move library grouped roughly by "stage" to mirror a curriculum.
const nodes = [
  // STAGE 1 -- STANDING TO GROUND
  { id: "standing_basic_tie_up", name: "Basic Tie-Up", type: "Entry", group: "Standing", stage: 1, aliases: [], prereq: [], notes_md: "Stance, pummeling, inside ties, head position." },
  { id: "standing_guard_pull", name: "Guard Pull", type: "Transition", group: "Standing", stage: 1, aliases: ["Pull to Closed/Seated"], prereq: ["standing_basic_tie_up"], notes_md: "Sit to hip, control head/arm, land safely to guard." },
  { id: "standing_single_leg", name: "Single Leg (Basic)", type: "Transition", group: "Standing", stage: 1, aliases: ["Run-the-pipe"], prereq: ["standing_basic_tie_up"], notes_md: "Level change, head inside, finish safely." },
  { id: "standing_snapdown_fhl", name: "Snapdown to Front Headlock", type: "Entry", group: "Standing", stage: 1, aliases: [], prereq: ["standing_basic_tie_up"], notes_md: "Chin strap and elbow control. Options to turtle or back." },

  // STAGE 2 -- PRIMARY POSITIONS (BOTTOM AND TOP)
  { id: "closed_guard_control", name: "Closed Guard Control", type: "Control", group: "Guard", stage: 2, aliases: [], prereq: ["standing_guard_pull"], notes_md: "Break posture, clamp, angle hips." },
  { id: "seated_guard_entry", name: "Seated/Open Guard Entry", type: "Entry", group: "Guard", stage: 2, aliases: ["Open guard sit"], prereq: ["standing_guard_pull"], notes_md: "Frames, shin-to-shin, collar-tie style grips in nogi." },
  { id: "open_guard_frames", name: "Open Guard Frames", type: "Control", group: "Guard", stage: 2, aliases: ["Distance management"], prereq: ["seated_guard_entry"], notes_md: "Inside position with hands and shins, manage range." },
  { id: "half_guard_knee_shield", name: "Knee Shield Half Guard", type: "Control", group: "Half Guard", stage: 2, aliases: ["Z-guard"], prereq: [], notes_md: "Inside frames, deny crossface, manage underhook." },
  { id: "top_closed_guard_posture", name: "Closed Guard Posture & Open", type: "Entry", group: "Guard Passing", stage: 2, aliases: [], prereq: [], notes_md: "Safe hands, posture first, stand or knee-wedge to open." },
  { id: "side_control_standard", name: "Side Control (Standard)", type: "Control", group: "Side Control", stage: 2, aliases: ["100 kilos"], prereq: [], notes_md: "Crossface and underhook, hips connected." },
  { id: "mount_control", name: "Mount Control", type: "Control", group: "Mount", stage: 2, aliases: ["Full mount"], prereq: ["side_control_standard"], notes_md: "Low to high mount progression, isolate arms." },
  { id: "back_control_hooks", name: "Back Control with Hooks", type: "Control", group: "Back", stage: 2, aliases: ["Back mount"], prereq: ["mount_control"], notes_md: "Seatbelt, hooks or body triangle." },

  // STAGE 3 -- ATTACKS AND SWEEPS
  { id: "hip_bump_sweep", name: "Hip Bump Sweep", type: "Sweep", group: "Guard", stage: 3, aliases: ["Sit-up sweep"], prereq: ["closed_guard_control"], notes_md: "Post hand, sit up, bump hips, capture arm." },
  { id: "scissor_sweep_nogi", name: "Scissor Sweep (Nogi grips)", type: "Sweep", group: "Guard", stage: 3, aliases: ["Diagonal"], prereq: ["closed_guard_control"], notes_md: "Head/arm control, shin across belt line, chop and pull." },
  { id: "guillotine_closed", name: "Guillotine from Closed", type: "Submission", group: "Guard", stage: 3, aliases: [], prereq: ["closed_guard_control"], notes_md: "Chin strap, elbow high, close guard or butterfly." },
  { id: "kimura_closed", name: "Kimura from Closed", type: "Submission", group: "Guard", stage: 3, aliases: [], prereq: ["closed_guard_control"], notes_md: "Sit up, figure-4, cut angle." },
  { id: "triangle_closed", name: "Triangle from Closed", type: "Submission", group: "Guard", stage: 3, aliases: [], prereq: ["closed_guard_control"], notes_md: "Break posture, shoot, angle, lock." },
  { id: "technical_standup_ankle_pick", name: "Technical Stand-up to Ankle Pick", type: "Sweep", group: "Guard", stage: 3, aliases: ["Stand-up sweep"], prereq: ["open_guard_frames"], notes_md: "Post, stand, collect ankle." },
  { id: "tripod_sweep", name: "Tripod Sweep", type: "Sweep", group: "Guard", stage: 3, aliases: [], prereq: ["open_guard_frames"], notes_md: "Control heel and opposite post, lift with hook." },
  { id: "sickle_sweep", name: "Sickle Sweep", type: "Sweep", group: "Guard", stage: 3, aliases: [], prereq: ["open_guard_frames"], notes_md: "Kick out base while holding ankle." },
  { id: "underhook_getup", name: "Underhook Get-up (Dogfight)", type: "Escape", group: "Half Guard", stage: 3, aliases: ["Build-up"], prereq: ["half_guard_knee_shield"], notes_md: "Underhook, come to knees, chase single." },
  { id: "mount_upa_escape", name: "Trap and Roll Escape", type: "Escape", group: "Mount", stage: 3, aliases: ["Upa"], prereq: ["mount_control"], notes_md: "Trap wrist and foot, bridge at 45 degrees." },
  { id: "mount_elbow_knee_escape", name: "Elbow-Knee Escape", type: "Escape", group: "Mount", stage: 3, aliases: ["Shrimp to half/guard"], prereq: ["mount_control"], notes_md: "Frame hips, insert knee, recover half or guard." },
  { id: "side_kesa_escape", name: "Kesa Gatame Escape", type: "Escape", group: "Side Control", stage: 3, aliases: [], prereq: ["side_control_standard"], notes_md: "Bridge and shrimp to recover guard or turtle." },
  { id: "back_rnc", name: "Rear Naked Choke", type: "Submission", group: "Back", stage: 3, aliases: ["RNC"], prereq: ["back_control_hooks"], notes_md: "Short choke to palm-over-bicep finish." },
  { id: "mount_armbar_basic", name: "Armbar from Mount", type: "Submission", group: "Mount", stage: 3, aliases: [], prereq: ["mount_control"], notes_md: "Knees tight, heels heavy, thumb up." },

  // STAGE 4 -- ADVANCEMENTS AND FINISHES
  { id: "knee_cut_pass", name: "Knee Cut Pass", type: "Pass", group: "Guard Passing", stage: 4, aliases: ["Knee slide"], prereq: ["open_guard_frames", "top_closed_guard_posture"], notes_md: "Inside control, underhook far side." },
  { id: "over_under_pass", name: "Over-Under Pass", type: "Pass", group: "Guard Passing", stage: 4, aliases: [], prereq: ["top_closed_guard_posture"], notes_md: "Pin hips, walk around legs." },
  { id: "bodylock_pass", name: "Bodylock Pass (Basics)", type: "Pass", group: "Guard Passing", stage: 4, aliases: [], prereq: ["open_guard_frames"], notes_md: "Clamp hips, knee wedge, clear knees." },
  { id: "half_guard_smash_pass", name: "Half Guard Smash Pass", type: "Pass", group: "Guard Passing", stage: 4, aliases: [], prereq: ["half_guard_knee_shield"], notes_md: "Crossface and underhook, free knee line." },
  { id: "single_leg_x_entry", name: "Single-leg X Entry", type: "Entry", group: "Leg Entanglements", stage: 4, aliases: ["Outside ashi"], prereq: ["open_guard_frames"], notes_md: "Hide outside foot, no twisting pressure." },
  { id: "straight_ankle_lock", name: "Straight Ankle Lock", type: "Submission", group: "Leg Entanglements", stage: 4, aliases: ["Ashi footlock"], prereq: ["single_leg_x_entry"], notes_md: "Forearm under Achilles, hips through. IBJJF-legal in nogi at beginner." },
  { id: "side_to_mount_knee_slide", name: "Knee Slide to Mount", type: "Transition", group: "Side Control", stage: 4, aliases: [], prereq: ["side_control_standard"], notes_md: "Isolate near arm and windshield-wiper to mount." },
  { id: "back_take_from_mount", name: "Back Take from Mount", type: "Transition", group: "Mount", stage: 4, aliases: [], prereq: ["mount_control"], notes_md: "Gift wrap or chair sit mechanics." },
] satisfies BJJNode[]

// Directed graph describing which moves connect once a technique is selected.
const edges = [
  // Stage 1 flow
  { from: "standing_basic_tie_up", to: "standing_guard_pull", kind: "standard" },
  { from: "standing_basic_tie_up", to: "standing_single_leg", kind: "optional" },
  { from: "standing_basic_tie_up", to: "standing_snapdown_fhl", kind: "optional" },

  // Into Stage 2 positions
  { from: "standing_guard_pull", to: "closed_guard_control", kind: "standard" },
  { from: "standing_guard_pull", to: "seated_guard_entry", kind: "standard" },
  { from: "standing_single_leg", to: "side_control_standard", kind: "standard" },

  // Stage 2 to Stage 3 attacks and sweeps
  { from: "closed_guard_control", to: "hip_bump_sweep", kind: "standard" },
  { from: "closed_guard_control", to: "scissor_sweep_nogi", kind: "standard" },
  { from: "closed_guard_control", to: "guillotine_closed", kind: "optional" },
  { from: "closed_guard_control", to: "kimura_closed", kind: "optional" },
  { from: "closed_guard_control", to: "triangle_closed", kind: "optional" },

  { from: "open_guard_frames", to: "tripod_sweep", kind: "standard" },
  { from: "open_guard_frames", to: "sickle_sweep", kind: "standard" },
  { from: "open_guard_frames", to: "technical_standup_ankle_pick", kind: "optional" },

  { from: "half_guard_knee_shield", to: "underhook_getup", kind: "standard" },

  { from: "side_control_standard", to: "side_kesa_escape", kind: "standard" },
  { from: "side_control_standard", to: "side_to_mount_knee_slide", kind: "optional" },

  { from: "mount_control", to: "mount_upa_escape", kind: "standard" },
  { from: "mount_control", to: "mount_elbow_knee_escape", kind: "standard" },

  { from: "back_control_hooks", to: "back_rnc", kind: "standard" },

  // Stage 3 to Stage 2 or 4 consolidations
  { from: "hip_bump_sweep", to: "mount_control", kind: "standard" },
  { from: "scissor_sweep_nogi", to: "mount_control", kind: "standard" },
  { from: "tripod_sweep", to: "side_control_standard", kind: "optional" },
  { from: "sickle_sweep", to: "side_control_standard", kind: "optional" },

  // Stage 4 passing and finishes
  { from: "top_closed_guard_posture", to: "over_under_pass", kind: "standard" },
  { from: "top_closed_guard_posture", to: "knee_cut_pass", kind: "optional" },
  { from: "open_guard_frames", to: "bodylock_pass", kind: "optional" },
  { from: "half_guard_knee_shield", to: "half_guard_smash_pass", kind: "optional" },

  { from: "side_control_standard", to: "side_to_mount_knee_slide", kind: "standard" },
  { from: "side_to_mount_knee_slide", to: "mount_control", kind: "standard" },
  { from: "mount_control", to: "back_take_from_mount", kind: "optional" },

  // Leg entanglement path
  { from: "open_guard_frames", to: "single_leg_x_entry", kind: "optional" },
  { from: "single_leg_x_entry", to: "straight_ankle_lock", kind: "standard" },
] satisfies BJJEdge[]

export const bjjData = {
  version: 2,
  stages,
  nodes,
  edges,
}
