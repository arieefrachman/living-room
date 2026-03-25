<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned / all-placeholder) → 1.0.0
Bump rationale: MINOR — initial population from template; all placeholder tokens replaced with
  concrete principles (code quality, testing standards, UX consistency, performance).

Modified principles:
  [PRINCIPLE_1_NAME] → I. Code Quality
  [PRINCIPLE_2_NAME] → II. Testing Standards
  [PRINCIPLE_3_NAME] → III. User Experience Consistency
  [PRINCIPLE_4_NAME] → IV. Performance Requirements
  [PRINCIPLE_5_NAME] → removed (only 4 principles requested)

Added sections:
  Quality Gates
  Development Workflow

Removed sections:
  [SECTION_2_NAME] placeholder → renamed to Quality Gates
  [SECTION_3_NAME] placeholder → renamed to Development Workflow

Templates reviewed:
  ✅ .specify/templates/plan-template.md  — Constitution Check gate already generic; no update needed
  ✅ .specify/templates/spec-template.md  — Functional/non-functional requirements structure already aligned
  ✅ .specify/templates/tasks-template.md — Task phases already support quality/testing task types
  ✅ .specify/templates/agent-file-template.md — No principle-specific references; no update needed

Follow-up TODOs:
  None — all placeholders resolved.
-->

# Demo Platform 3D Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All code shipped to the main branch MUST meet the following standards:

- **Style & consistency**: A shared linter and formatter configuration MUST be present and enforced in CI.
  No PR is merged with lint or format violations.
- **Single responsibility**: Functions and modules MUST have a single clear purpose. Functions exceeding a
  cyclomatic complexity of 10 MUST be refactored before merging.
- **Naming**: Identifiers MUST be descriptive and self-explanatory. Abbreviations and single-letter names
  are only acceptable as loop indices or well-established domain shorthand.
- **No dead code**: Commented-out code, unused imports, and unreachable branches MUST NOT be committed.
  Remove or ticket them.
- **Documentation**: All public APIs, components, and exported functions MUST have concise documentation.
  Internal logic that is non-obvious MUST include an explanatory comment.
- **Review gate**: Every PR MUST be reviewed and approved by at least one other team member before merge.
  Self-merging is prohibited.

**Rationale**: Consistent, readable code reduces onboarding time, prevents compounding technical debt,
and makes refactoring safer across the lifetime of the platform.

### II. Testing Standards (NON-NEGOTIABLE)

- **Coverage floor**: New and modified code MUST maintain ≥ 80% unit-test coverage, measured and
  enforced in CI. Coverage MAY NOT decrease across a PR without explicit justification in the PR description.
- **Test-first preferred**: TDD is the preferred approach. At minimum, unit tests MUST be written before
  a PR is marked ready for review.
- **Determinism**: All tests MUST be deterministic. A flaky test MUST be fixed or explicitly quarantined
  (with a tracking issue) within one sprint of identification. Flaky tests MUST NOT block CI indefinitely.
- **Integration coverage**: Critical user journeys MUST have integration tests covering the full path
  from input to observable output.
- **Naming convention**: Tests MUST follow the Given/When/Then or Arrange/Act/Assert naming pattern so
  intent is immediately clear without reading the implementation.
- **Mocking discipline**: Mocks MUST only be introduced at system boundaries (external APIs, file I/O,
  network). Internal module interactions MUST use real implementations unless prohibitively expensive.

**Rationale**: Automated tests are the primary safety net for refactoring and shipping with confidence.
Under-tested code is a liability, not an asset.

### III. User Experience Consistency (NON-NEGOTIABLE)

- **Design system adherence**: All UI components MUST use the established design system (tokens, spacing,
  typography, color palette). Ad-hoc styles that bypass the design system are not permitted.
- **Interaction patterns**: Navigation flows, feedback mechanisms (loading, success, error states), and
  modal/dialog patterns MUST follow the interaction patterns defined in the design specification.
  Divergences require a design review approval.
- **Terminology**: User-facing text MUST use consistent terminology. Synonymous labels for the same
  concept in different screens are a bug.
- **Accessibility**: All interactive components MUST meet WCAG 2.1 AA accessibility standards. Keyboard
  navigation and screen-reader compatibility are not optional enhancements.
- **State completeness**: Every screen and component MUST implement loading, error, and empty states.
  A blank or crashed view is never acceptable as a shipped state.
- **3D interaction conventions**: Controls and camera interactions in 3D views MUST follow established
  platform conventions (orbit, pan, zoom) and MUST be documented in the UX specification for the feature.

**Rationale**: A 3D demo platform lives or dies on the quality of its user experience. Inconsistency
erodes trust, accessibility is a legal and ethical obligation, and incomplete states lead to user confusion.

### IV. Performance Requirements (NON-NEGOTIABLE)

- **Initial load**: Application initial load (including 3D scene bootstrap) MUST complete within 3 seconds
  on a standard broadband connection (≥ 25 Mbps). Measured by Lighthouse or equivalent in CI.
- **3D rendering**: The 3D viewport MUST maintain a stable ≥ 60 FPS on mid-range consumer hardware
  under normal usage. Any feature that causes sustained drops below 45 FPS MUST include a mitigation plan.
- **API latency**: All API endpoints MUST respond within 200 ms at the p95 percentile under expected load.
  Endpoints exceeding this threshold MUST have a logged performance issue before the PR can merge.
- **Asset optimization**: All textures, images, and 3D model assets MUST be compressed and optimized
  before being committed. No single uncompressed asset may exceed 2 MB without written justification.
- **Lazy loading**: Non-critical resources (off-screen panels, secondary 3D assets, analytics) MUST use
  lazy or deferred loading strategies.
- **Regression guard**: CI MUST include performance benchmark jobs. Any PR that introduces a measurable
  regression of > 10% on tracked metrics MUST include a justification comment and team sign-off.

**Rationale**: The platform's core value proposition is an immersive, real-time 3D experience. Performance
is a feature, not an afterthought.

## Quality Gates

All work MUST pass the following automated checks before merging:

- Lint and formatting check: zero violations
- Type-check: zero errors (if a typed language or framework is in use)
- Unit test suite: 100% pass, ≥ 80% coverage on changed files
- Integration test suite: 100% pass
- Build: compiles and bundles without warnings treated as errors
- Performance benchmarks: no regression > 10% on tracked metrics
- Security scan: no new HIGH or CRITICAL advisories introduced

Dependencies MUST be reviewed for breaking changes and known security vulnerabilities on every update.
Automated dependency-update PRs MUST not be auto-merged without at least one human approval.

## Development Workflow

- Every feature MUST have an approved `spec.md` before any implementation code is written.
- Feature branches MUST reference a spec or task ID in their branch name (e.g., `001-scene-loader`).
- Refactoring MUST be committed separately from feature or bug-fix commits to keep diffs reviewable.
- All PRs MUST include a Constitution Check section confirming compliance with each principle or
  explicitly noting and justifying any deviation.
- Hotfixes that bypass the full spec workflow MUST be tracked as tech-debt issues within 24 hours.

## Governance

This constitution supersedes all other project-level coding guidelines and style documents. Where conflict
exists, the constitution takes precedence.

**Amendment procedure**:

1. Open a dedicated constitution PR with the proposed changes and a version bump rationale.
2. Obtain approval from ≥ 2 team members before merging.
3. Update the `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION` fields.
4. Run the `/speckit.constitution` command to propagate consistency checks across all templates.

**Versioning policy**: Semantic versioning (MAJOR.MINOR.PATCH).
- MAJOR: Backward-incompatible governance changes, principle removals or fundamental redefinitions.
- MINOR: New principle or section added, or materially expanded guidance.
- PATCH: Clarifications, wording improvements, typo fixes.

**Compliance review**: Adherence to this constitution MUST be reviewed at the start of each quarterly
planning cycle. Persistent violations MUST be logged as tech-debt and scheduled for remediation.

**Version**: 1.0.0 | **Ratified**: 2026-03-25 | **Last Amended**: 2026-03-25
