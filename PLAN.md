UI Update Plan: Two-Column Chat + Workflow Interactions

Goals
- Always show Chat on the right column (Lovable-style), with the rest of the content on the left column, for both Tenant and Landlord portals.
- Make workflow items reorderable via drag-and-drop, removable via an X button, and animate a big green checkmark when an item is marked finished. Place workflows in the left column and make them scrollable if they exceed the page.

Scope & Affected Files
- Tenant layout: `src/pages/TenantPortal.tsx`
- Landlord layout + workflow: `src/pages/LandlordPortal.tsx`
- Chat (styling hooks only via props/classes): `src/components/ui/chat.tsx`
- Animations: `tailwind.config.ts` (add keyframes/animation for checkmark), optional small CSS in `src/index.css`
- Optional utility for DnD (inline first pass): inside `LandlordPortal.tsx` (or a small hook `src/hooks/use-drag-reorder.ts` if needed)

1) Two-Column Layout (Chat Always Right)

Tenant Portal (src/pages/TenantPortal.tsx)
- Replace the current toggle between Form Mode and Chat Mode with a persistent two-column grid.
  - Left column: Submit Request form, Recent Requests, Quick Actions.
  - Right column: Chat component, always visible.
- Grid/responsive behavior:
  - Desktop: `grid-cols-[minmax(0,1fr)_420px]` or `lg:grid-cols-2` with a fixed-ish right column (≈380–480px).
  - Make Chat column sticky and tall: `sticky top-24 h-[calc(100vh-8rem)]` and `overflow-hidden` inside Card to show internal scroll only.
  - Mobile: Stack vertically (Chat below), optionally keep a small “Open Chat” button if necessary later (not required for this pass).
- Remove `showChat` state and the two buttons that toggle it. Keep existing `Chat` props and placeholder text.

Landlord Portal (src/pages/LandlordPortal.tsx)
- Keep the header and stats, but reorganize the main area into two columns:
  - Left column: Maintenance Requests table (existing) + Workflow section (moved here from the right). Wrap the Workflow section to be scrollable if long.
  - Right column: Chat component, always visible (remove the Actions/Chat toggle and `showChat` state).
- Right column Chat styling:
  - `sticky top-24 h-[calc(100vh-8rem)]` so it stays visible while scrolling the left column.
- Update any paddings/containers to ensure full-height balance without layout shift.

Shared Considerations
- Ensure both pages use consistent spacing and container widths (`max-w-7xl` landlord; `max-w-4xl` tenant may become `max-w-6xl` if needed for two columns).
- Use `ScrollArea` or `overflow-y-auto` for long sections to prevent the page from jumping.

Acceptance Criteria (Layout)
- Tenant: Chat always visible on the right on desktop; left column shows the form and recent requests. No mode toggle remains.
- Landlord: Chat always visible on the right on desktop; Workflow moved to the left column below/alongside the requests table. No mode toggle remains.
- Chat remains usable on small screens (stacking is acceptable in this pass).

2) Workflow Interactions (Drag, Remove, Finish Animation)

Data Model Update
- Extend `WorkflowCard` in `LandlordPortal.tsx`:
  - `status: 'pending' | 'in-progress' | 'done'` (default to `pending` or `in-progress`).

Drag-and-Drop Reordering
- Implement HTML5 drag-and-drop on workflow cards:
  - Add `draggable` to each item.
  - Track `dragIndex` and `overIndex`; on drop, reorder the `workflowCards` array by splicing/moving the dragged item.
  - Provide visual affordances during drag: subtle shadow/scale and placeholder spacing.
- Keep implementation inline within `LandlordPortal.tsx` for now to reduce complexity; optional refactor to a small hook later if needed.

Remove via X
- Already present; preserve behavior and add `aria-label="Remove"` for accessibility.

Finished Status + Green Check Animation
- UI: Add a small “Mark done” action (button or contextual action) for each workflow item.
- When an item transitions to `status === 'done'`:
  - Show a big green animated checkmark overlay within the item (SVG path with stroke-dash animation or a scaling check icon).
  - After the animation completes, keep a smaller static success indicator on the card (e.g., success badge or icon) so the state remains visible.
- Tailwind config: add custom keyframes and animation utilities.
  - keyframes (examples):
    - `check-pop`: scale from 0.8 -> 1.1 -> 1.0 with fade-in.
    - `check-draw`: optional stroke-draw effect via dashoffset.
  - animation mapping (e.g., `animate-check-pop`).
- Styling: use existing `success` colors for the checkmark (`text-success` / `fill-success`).

Scrollable Workflow List (Left Column)
- Wrap Workflow list in a container with `max-h-[calc(100vh-16rem)] overflow-y-auto pr-1` to allow scrolling of long lists independently from the rest of the left column.
- Use `ScrollArea` component if preferred for consistent styling.

Acceptance Criteria (Workflow)
- User can drag to reorder workflow items; order persists in component state immediately.
- User can remove an item via the X button.
- Marking an item done triggers a visible green check animation and leaves a clear done state indicator afterward.
- Workflow list scrolls independently when content exceeds viewport height.

Implementation Steps (Sequenced)
1) Landlord layout refactor
   - Move Workflow section to the left column under/with Requests, remove Chat toggle, place Chat in right column and make sticky.
2) Tenant layout refactor
   - Remove Chat/Form toggle, build two-column layout; right chat sticky; left shows form + recent requests + quick actions.
3) Workflow: drag & reorder
   - Add DnD handlers to workflow items and reorder state in `LandlordPortal.tsx`.
4) Workflow: status + removal
   - Extend `WorkflowCard` with `status`, add “Mark done” action, keep remove X with `aria-label`.
5) Animation
   - Add Tailwind keyframes/animation entries; implement the animated check overlay in workflow items.
6) Polish & responsiveness
   - Verify desktop sticky behavior, mobile stacking, and scroll containment.

Notes & Assumptions
- Workflow modifications apply to Landlord Portal (the only place workflows currently exist). If Tenant workflows are added later, the same pattern will be reused.
- Chat component itself stays functionally the same; pages provide height/positioning via `className` to fit the right column.
- No external DnD library required; native HTML5 drag is sufficient for this pass.
