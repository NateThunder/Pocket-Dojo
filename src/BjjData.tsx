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
    name: "Stage 1 - Standing",
    description: "Both athletes on the feet. Practice takedowns, trips, and safe guard pulls.",
    allowedTypes: ["Entry", "Transition", "Takedown"],
  },
  {
    id: 2,
    name: "Stage 2 - Guard & Transitional Ground",
    description:
      "Early ground phases. Includes Stage 2A top-in-guard, Stage 2B bottom guard, Stage 2B+ bad spots, and Stage 2C scrambles.",
    allowedTypes: ["Control", "Escape", "Transition", "Pass"],
  },
  {
    id: 3,
    name: "Stage 3 - Dominant Control",
    description:
      "Side control, mount, back control, knee-on-belly, or strong leg entanglement. Stabilize to hunt the finish.",
    allowedTypes: ["Control", "Transition", "Submission"],
  },
  {
    id: 4,
    name: "Stage 4 - Submission Finish",
    description: "Terminal finishing mechanics: chokes, upper-body locks, and leg locks.",
    allowedTypes: ["Submission"],
  },
] satisfies StageRule[]



// Primary move library grouped roughly by "stage" to mirror a curriculum.
const nodes = [
  { id: "stage1_double_leg", name: "Double Leg Takedown", type: "Takedown", group: "Stage 1 - Standing", stage: 1, aliases: ["Stage 1"], prereq: [], notes_md: "Level change, drive through the hips, and land safely on top." },
  { id: "stage1_body_lock_trip", name: "Body Lock Trip", type: "Takedown", group: "Stage 1 - Standing", stage: 1, aliases: ["Stage 1"], prereq: [], notes_md: "Underhook to body lock, off-balance, step and trip to finish." },
  { id: "stage1_single_leg_snap", name: "Snap Down to Front Headlock", type: "Entry", group: "Stage 1 - Standing", stage: 1, aliases: ["Stage 1"], prereq: [], notes_md: "Collar tie snap down flowing directly into front headlock control." },
  { id: "stage1_guard_pull_closed", name: "Closed Guard Pull", type: "Transition", group: "Stage 1 - Standing", stage: 1, aliases: ["Stage 1"], prereq: [], notes_md: "Sit safely, wrap the head and arm, and close your guard immediately." },
  { id: "stage2a_posture_break", name: "Posture And Guard Break", type: "Control", group: "Stage 2A - Top in Guard", stage: 2, aliases: ["Stage 2A"], prereq: [], notes_md: "Hands on the body, stack to open closed guard with solid posture." },
  { id: "stage2a_knee_slice_pass", name: "Knee Slice Pass", type: "Pass", group: "Stage 2A - Top in Guard", stage: 2, aliases: ["Stage 2A"], prereq: ["stage2a_posture_break"], notes_md: "Underhook the far side, slice the knee, and windshield wiper the foot." },
  { id: "stage2a_double_under_pass", name: "Double Under Stack Pass", type: "Pass", group: "Stage 2A - Top in Guard", stage: 2, aliases: ["Stage 2A"], prereq: ["stage2a_posture_break"], notes_md: "Thread both arms under, stack hips, and walk around to side control." },
  { id: "stage2b_closed_guard_control", name: "Closed Guard Control", type: "Control", group: "Stage 2B - Bottom Guard", stage: 2, aliases: ["Stage 2B"], prereq: [], notes_md: "Break posture, climb the guard, manage grips for sweeps or submissions." },
  { id: "stage2b_hip_bump", name: "Hip Bump Sweep", type: "Sweep", group: "Stage 2B - Bottom Guard", stage: 2, aliases: ["Stage 2B"], prereq: ["stage2b_closed_guard_control"], notes_md: "Sit up, trap the posting arm, bump hips to roll into mount." },
  { id: "stage2b_scissor_sweep", name: "Scissor Sweep", type: "Sweep", group: "Stage 2B - Bottom Guard", stage: 2, aliases: ["Stage 2B"], prereq: ["stage2b_closed_guard_control"], notes_md: "Shin across the belt line, pull upper body, chop to land in side control." },
  { id: "stage2b_flower_sweep", name: "Flower Sweep", type: "Sweep", group: "Stage 2B - Bottom Guard", stage: 2, aliases: ["Stage 2B"], prereq: ["stage2b_closed_guard_control"], notes_md: "Underhook the leg, swing it high, tilt them into mount." },
  { id: "stage2b_bad_half_escape", name: "Half Guard Frame Escape", type: "Escape", group: "Stage 2B+ - Bad Spot", stage: 2, aliases: ["Stage 2B+"], prereq: [], notes_md: "Frame the crossface, hip escape back to knee shield or guard." },
  { id: "stage2b_bad_turtle", name: "Turtle Guard Recovery", type: "Escape", group: "Stage 2B+ - Bad Spot", stage: 2, aliases: ["Stage 2B+"], prereq: [], notes_md: "Protect the neck, roll to guard or build to single leg from turtle." },
  { id: "stage2c_front_headlock_spin", name: "Front Headlock Spin Behind", type: "Transition", group: "Stage 2C - Scramble", stage: 2, aliases: ["Stage 2C"], prereq: [], notes_md: "Snap, sprawl, and spin to the back or side control." },
  { id: "stage2c_wrestle_up_single", name: "Wrestle-Up Single Leg", type: "Transition", group: "Stage 2C - Scramble", stage: 2, aliases: ["Stage 2C"], prereq: [], notes_md: "From turtle or seated guard, clamp the leg and stand into a finish." },
  { id: "stage3_side_control", name: "Side Control Pressure", type: "Control", group: "Stage 3 - Dominant Control", stage: 3, aliases: ["Stage 3"], prereq: [], notes_md: "Crossface, underhook, and hip pressure to pin them flat." },
  { id: "stage3_mount", name: "Mount Control Fundamentals", type: "Control", group: "Stage 3 - Dominant Control", stage: 3, aliases: ["Stage 3"], prereq: ["stage3_side_control"], notes_md: "Climb high, grapevine the legs, isolate arms for attacks." },
  { id: "stage3_back_control", name: "Back Control Seatbelt", type: "Control", group: "Stage 3 - Dominant Control", stage: 3, aliases: ["Stage 3"], prereq: ["stage3_mount"], notes_md: "Seatbelt grips with hooks or body triangle, head tight to theirs." },
  { id: "stage4_rnc", name: "Rear Naked Choke", type: "Submission", group: "Stage 4 - Choke Finishes", stage: 4, aliases: ["Stage 4 Choke"], prereq: ["stage3_back_control"], notes_md: "Short choke to palm-over-bicep finish from the back." },
  { id: "stage4_cross_collar", name: "Cross Collar Choke", type: "Submission", group: "Stage 4 - Choke Finishes", stage: 4, aliases: ["Stage 4 Choke", "Stage 2B"], prereq: ["stage2b_closed_guard_control", "stage3_mount"], notes_md: "Deep lapel grips, pull elbows to ribs, finish from guard or mount." },
  { id: "stage4_guillotine", name: "High Elbow Guillotine", type: "Submission", group: "Stage 4 - Choke Finishes", stage: 4, aliases: ["Stage 4 Choke"], prereq: ["stage1_single_leg_snap", "stage2c_front_headlock_spin"], notes_md: "Chin strap, shoot the elbow high, drive hips into the choke." },
  { id: "stage4_armbar_mount", name: "Armbar From Mount", type: "Submission", group: "Stage 4 - Upper Body Locks", stage: 4, aliases: ["Stage 4 Joint Lock"], prereq: ["stage3_mount"], notes_md: "Gift wrap the arm, swing the leg over, pinch knees to finish." },
  { id: "stage4_kimura_side", name: "Kimura From Side Control", type: "Submission", group: "Stage 4 - Upper Body Locks", stage: 4, aliases: ["Stage 4 Joint Lock"], prereq: ["stage3_side_control"], notes_md: "Figure four the arm, step over the head, turn the shoulder." },
  { id: "stage4_straight_ankle", name: "Straight Ankle Lock", type: "Submission", group: "Stage 4 - Leg Locks", stage: 4, aliases: ["Stage 4 Leg Lock"], prereq: ["stage2b_bad_half_escape"], notes_md: "Ashi entry, blade on Achilles, hips forward to finish." },
] satisfies BJJNode[]



// Directed graph describing which moves connect once a technique is selected.
const edges = [
  { from: "stage1_double_leg", to: "stage2a_posture_break", kind: "standard" },
  { from: "stage1_body_lock_trip", to: "stage2a_knee_slice_pass", kind: "standard" },
  { from: "stage1_single_leg_snap", to: "stage2c_front_headlock_spin", kind: "standard" },
  { from: "stage1_guard_pull_closed", to: "stage2b_closed_guard_control", kind: "standard" },
  { from: "stage1_double_leg", to: "stage2c_wrestle_up_single", kind: "optional" },
  { from: "stage1_body_lock_trip", to: "stage2c_front_headlock_spin", kind: "optional" },

  { from: "stage2a_posture_break", to: "stage2a_knee_slice_pass", kind: "standard" },
  { from: "stage2a_posture_break", to: "stage2a_double_under_pass", kind: "optional" },
  { from: "stage2a_knee_slice_pass", to: "stage3_side_control", kind: "standard" },
  { from: "stage2a_double_under_pass", to: "stage3_side_control", kind: "standard" },
  { from: "stage2a_posture_break", to: "stage2b_closed_guard_control", kind: "optional" },

  { from: "stage2b_closed_guard_control", to: "stage2b_hip_bump", kind: "standard" },
  { from: "stage2b_closed_guard_control", to: "stage2b_scissor_sweep", kind: "standard" },
  { from: "stage2b_closed_guard_control", to: "stage2b_flower_sweep", kind: "optional" },
  { from: "stage2b_hip_bump", to: "stage3_mount", kind: "standard" },
  { from: "stage2b_scissor_sweep", to: "stage3_side_control", kind: "standard" },
  { from: "stage2b_flower_sweep", to: "stage3_mount", kind: "standard" },
  { from: "stage2b_closed_guard_control", to: "stage4_cross_collar", kind: "optional" },
  { from: "stage2b_closed_guard_control", to: "stage4_guillotine", kind: "optional" },

  { from: "stage2b_bad_half_escape", to: "stage2b_closed_guard_control", kind: "standard" },
  { from: "stage2b_bad_half_escape", to: "stage2c_wrestle_up_single", kind: "optional" },
  { from: "stage2b_bad_turtle", to: "stage2c_front_headlock_spin", kind: "optional" },
  { from: "stage2b_bad_turtle", to: "stage3_back_control", kind: "optional" },

  { from: "stage2c_front_headlock_spin", to: "stage3_back_control", kind: "standard" },
  { from: "stage2c_front_headlock_spin", to: "stage4_guillotine", kind: "optional" },
  { from: "stage2c_wrestle_up_single", to: "stage2a_posture_break", kind: "standard" },
  { from: "stage2c_wrestle_up_single", to: "stage3_side_control", kind: "optional" },

  { from: "stage3_side_control", to: "stage3_mount", kind: "optional" },
  { from: "stage3_side_control", to: "stage4_kimura_side", kind: "optional" },
  { from: "stage3_side_control", to: "stage2b_bad_half_escape", kind: "optional" },
  { from: "stage3_mount", to: "stage3_back_control", kind: "optional" },
  { from: "stage3_mount", to: "stage4_armbar_mount", kind: "standard" },
  { from: "stage3_mount", to: "stage4_cross_collar", kind: "optional" },
  { from: "stage3_mount", to: "stage2b_closed_guard_control", kind: "optional" },
  { from: "stage3_back_control", to: "stage4_rnc", kind: "standard" },
  { from: "stage3_back_control", to: "stage4_armbar_mount", kind: "optional" },
  { from: "stage3_back_control", to: "stage2c_front_headlock_spin", kind: "optional" },
] satisfies BJJEdge[]



export const bjjData = {
  version: 3,
  stages,
  nodes,
  edges,
}

