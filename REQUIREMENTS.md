# Dart Training App — Requirements

**Version:** 0.1  
**Status:** Draft

---

## 1. Purpose

Create a personal dart training application that records individual dart throws and uses the collected data to measure performance, identify miss patterns, and track improvement over time.

The application should focus on training and analysis rather than only scoring dart games.

The first implementation will be optimized for use on an Android tablet through a web browser.

---

## 2. Goals

The application should:

- Record every individual dart throw.
- Store the intended target and actual result of each throw.
- Track performance over time.
- Show current-session statistics.
- Show historical statistics.
- Show trend graphs based on recent throws.
- Identify common miss patterns.
- Support several different training programs.
- Make entering throws fast and simple while standing at the dartboard.
- Keep historical training data available for long-term analysis.
- Allow the user to export and retain ownership of all collected data.
- Work without requiring an active Internet connection during training.

---

## 3. Non-goals — Version 1

The first version will not focus on:

- Multiplayer.
- Online competition.
- Social features.
- Public profiles.
- User accounts for multiple people.
- Subscriptions or payments.
- Automatic camera-based dart detection.
- AI coaching.
- App Store or Google Play publishing.
- Commercial use.

These features may be reconsidered later.

---

## 4. User

The initial application is designed for one user.

Version 1 therefore does not require:

- User registration.
- Login.
- User permissions.
- Multiple user profiles.

---

# 5. Training Programs

The initial planned training programs are:

- Triple 20 Training
- Doubles Training
- Around the Clock
- 501

Version 1 will initially implement only:

- **Triple 20 Training**

Other training types will be added later.

---

## 5.1 Triple 20 Training

The player repeatedly aims at T20.

Every dart is registered individually.

The application must record exactly where each dart lands within the defined training zones.

The primary goal is to measure:

- T20 accuracy.
- Total 20-segment accuracy.
- Left/right miss tendency.
- High/low miss tendency.
- Major misses.
- Performance improvement over time.

---

# 6. Triple 20 Training Result Zones

Triple 20 Training uses 13 predefined result zones.

## 6.1 Main 3×3 Target Area

The main target area is:

```text
High 5     High 20     High 1

T5         T20         T1

Low 5      Low 20      Low 1
```

The meaning is:

### High 20

The dart lands inside the 20 segment above T20.

### T20

The dart lands in the Triple 20 ring.

### Low 20

The dart lands inside the 20 segment below T20.

### High 5

The dart lands inside the 5 segment above T5.

### T5

The dart lands in the Triple 5 ring.

### Low 5

The dart lands inside the 5 segment below T5.

### High 1

The dart lands inside the 1 segment above T1.

### T1

The dart lands in the Triple 1 ring.

### Low 1

The dart lands inside the 1 segment below T1.

---

## 6.2 Major Misses

Four additional zones represent larger misses:

- Left of 5
- Right of 1
- Over 20
- Below 20

Definitions:

### Over 20

The dart lands outside the 20 segment above its outer boundary.

### Below 20

The dart lands outside the defined 20 target area below the 20/5/1 area.

### Left of 5

The dart lands outside the immediate 5–20–1 target area on the 5 side.

### Right of 1

The dart lands outside the immediate 5–20–1 target area on the 1 side.

The distinction is:

**Inside the 5/20/1 target area = High / Triple / Low**

**Outside the immediate target area = Major Miss**

---

# 7. Dart Recording

Every physical dart throw must be stored as an individual record.

Each throw must make it possible to determine:

- Unique throw ID.
- Session ID.
- Timestamp.
- Training type.
- Intended target.
- Actual result zone.
- Score where applicable.

For Triple 20 Training, the result zone will be one of the 13 defined zones.

Example:

```text
Target: T20
Result Zone: High 1
```

Another example:

```text
Target: T20
Result Zone: T20
```

Calculated statistics must be derived from stored individual dart throws.

The application should not rely on stored aggregate statistics as the primary source of truth.

---

# 8. Application Navigation

## 8.1 Start Page

When the user opens the application URL, the start page should present the main available functions.

Initial options:

- **Triple 20 Training**
- **Statistics**

Additional training programs will be added later.

The start page should be optimized for touch use on an Android tablet.

---

## 8.2 Statistics Page

Selecting **Statistics** should present two options:

- **View Sessions**
- **View Full Statistics**

---

# 9. Triple 20 Training Page

The Triple 20 Training page has three states:

- Before Session
- Active Session
- After Session

---

## 9.1 Before Session

Before a session starts, the page should show:

- Training type: Triple 20 Training.
- Start Session button.

Dart-entry controls should not be active before the session starts.

Selecting **Start Session** creates a new training session and starts the session timer.

---

## 9.2 Active Session

During an active session, the page should show:

- Training type.
- Session status.
- Start time.
- Session duration.
- Number of darts thrown.
- Dart-entry controls.
- Live session statistics.
- Undo Last Dart.
- End Session.

The main 3×3 dart-entry area should be:

```text
High 5     High 20     High 1

T5         T20         T1

Low 5      Low 20      Low 1
```

The four major-miss controls should be clearly separated:

- Left of 5
- Over 20
- Below 20
- Right of 1

Every button press records exactly one dart.

---

## 9.3 Live Session Statistics

Statistics should update immediately after each dart is entered.

Initial live statistics should include:

- Number of darts.
- T20 percentage.
- Total 20-segment percentage.
- Left-side near misses.
- Right-side near misses.
- Major misses.

Detailed statistics should not reduce the usability or size of the dart-entry controls.

---

## 9.4 Undo Last Dart

Selecting **Undo Last Dart** should remove the most recently recorded dart from the active session.

All live statistics must immediately recalculate.

---

## 9.5 End Session

Selecting **End Session** should:

- Stop the session timer.
- Save the stop time.
- Save the session duration.
- Save the final number of darts.
- Mark the session as completed.
- Preserve all recorded dart throws.

After ending a session, the application should show:

- View Session Statistics.
- Return to Start Page.

---

# 10. Training Sessions

Each session must be stored individually.

A completed session should contain:

- Unique session ID.
- Training type.
- Date.
- Start time.
- Stop time.
- Duration.
- Number of darts.
- All individual dart throws belonging to the session.

Example:

```text
Training type: Triple 20 Training
Date: 2026-11-17
Start time: 18:42
Stop time: 19:06
Duration: 24 minutes
Number of darts: 120
```

All darts must reference their associated session.

---

# 11. Individual Session Statistics

Every completed training session must be available as an individual statistical dataset.

The user must be able to:

- View previous sessions.
- Select a specific session.
- View statistics calculated only from that session.

Session statistics should include:

- Number of darts.
- Percentage distribution across all 13 zones.
- T20 percentage.
- Total 20-segment percentage.
- Left-side near misses.
- Right-side near misses.
- Major misses.
- High tendency.
- Low tendency.

All session statistics must be calculated from the dart throws linked to that session.

---

# 12. View Sessions

Selecting **View Sessions** should open a list of completed sessions.

The list should be sorted with the newest session first.

Each session row should show:

- Training type.
- Date.
- Start time.
- Number of darts.
- Session duration.

Example:

```text
Triple 20 Training
17 Nov 2026   18:42
120 darts     24 min
```

Selecting a session opens the detailed statistics for that session.

---

## 12.1 Session Detail View

The session detail view should show:

- Training type.
- Date.
- Start time.
- Stop time.
- Duration.
- Number of darts.

It should also show the percentage distribution across all 13 zones:

- High 5
- High 20
- High 1
- T5
- T20
- T1
- Low 5
- Low 20
- Low 1
- Left of 5
- Right of 1
- Over 20
- Below 20

The total percentage must equal 100%.

Derived statistics should also be shown:

- T20 percentage.
- Total 20-segment percentage.
- Left-side near misses.
- Right-side near misses.
- Major misses.
- High tendency.
- Low tendency.

Navigation:

- Back to Sessions.
- Back to Start Page.

Editing or deleting historical sessions is not required for the first implementation.

---

# 13. Full Statistics

Selecting **View Full Statistics** should open complete historical statistics for Triple 20 Training.

The user should be able to switch between:

- Last 50 throws.
- Last 100 throws.
- Last 500 throws.
- Lifetime.

---

## 13.1 Result Distribution

For the selected range, the application should show the percentage distribution across all 13 zones.

Example:

```text
High 5        6.2%
High 20       8.4%
High 1        5.1%

T5            4.7%
T20          19.8%
T1            3.9%

Low 5         7.3%
Low 20       17.6%
Low 1         8.1%

Left of 5     4.2%
Right of 1    3.1%
Over 20       5.8%
Below 20      5.8%
```

The total distribution must equal 100%.

---

# 14. Derived Statistics

The application should derive higher-level statistics from the 13 result zones.

## 14.1 Total 20 Segment

```text
High 20 + T20 + Low 20
```

## 14.2 T20 Hit Rate

```text
T20 only
```

## 14.3 Left-side Near Misses

```text
High 5 + T5 + Low 5
```

## 14.4 Right-side Near Misses

```text
High 1 + T1 + Low 1
```

## 14.5 Major Misses

```text
Left of 5
+ Right of 1
+ Over 20
+ Below 20
```

## 14.6 High Tendency

High-related result zones should be combined to show whether throws tend to land high.

Exact calculation may be refined later.

## 14.7 Low Tendency

Low-related result zones should be combined to show whether throws tend to land low.

Exact calculation may be refined later.

---

# 15. Rolling Statistics

Rolling statistics must be calculated across training sessions.

Initial ranges:

- Last 50 throws.
- Last 100 throws.
- Last 500 throws.
- Lifetime.

Rolling statistics must cross session boundaries.

Example:

If the latest session contains 30 darts, Last 100 should include:

```text
30 darts from current/latest session
+
70 darts from earlier sessions
```

Statistics from different training types must remain separate.

Future Doubles Training data must not be included in Triple 20 Training statistics.

---

# 16. Trend Analysis

The application must allow the user to track performance changes over time.

Trend analysis should support:

- T20 hit rate.
- Total 20-segment hit rate.
- Each individual result zone.
- Left-side misses.
- Right-side misses.
- High tendency.
- Low tendency.
- Major misses.

Trend graphs should support rolling windows of:

- 50 throws.
- 100 throws.
- 500 throws.

Example:

A rolling 100-dart T20 graph should calculate the T20 percentage from the most recent 100 throws at each point in training history.

Trend analysis should help answer:

- Is my T20 hit rate improving?
- Are my misses increasingly high?
- Are my misses increasingly low?
- Am I missing more often left or right?
- Are major misses decreasing?
- Is recent performance better than long-term performance?

All trend calculations must use stored individual dart throws.

---

# 17. Full Statistics Summary

The Full Statistics page should also show:

- Total number of Triple 20 Training throws.
- Total number of completed Triple 20 Training sessions.
- Date of first recorded session.
- Date of most recent session.

Only Triple 20 Training throws should be included.

---

# 18. Data Storage

Version 1 should use local browser storage as the primary training database.

Recommended storage:

- IndexedDB.

Each individual dart throw must be stored separately.

Each training session must be stored separately.

The application should not use CSV files as the primary database.

---

# 19. Data Export and Backup

Training data must remain accessible to the user.

The application should support:

- CSV export.
- JSON backup.
- JSON restore/import.

## 19.1 CSV Export

CSV should make it possible to open training data in Microsoft Excel.

Example fields:

```text
timestamp
sessionId
trainingType
target
resultZone
score
```

## 19.2 JSON Backup

JSON should be used for complete application backup and restore.

The JSON backup should contain:

- Sessions.
- Throws.
- Relevant application data required to restore training history.

---

# 20. Offline Operation

Core training functionality should work without an Internet connection.

Entering and storing darts must not depend on an active Internet connection.

Cloud synchronization may be added later.

---

# 21. Reliability

The application must:

- Avoid losing recorded throws.
- Save each dart immediately.
- Preserve completed throws when the application closes.
- Allow correction of accidental input through Undo.
- Calculate statistics from raw stored dart data.
- Avoid silently modifying historical results.

Backup functionality should be implemented early.

---

# 22. Performance

The application should remain responsive with a large historical dataset.

Initial target:

- At least 100,000 stored darts.

The application should still provide:

- Immediate dart entry.
- Fast statistics updates.
- Responsive navigation.
- Practical trend calculations.

---

# 23. Platform Requirements

The first implementation should:

- Run as an interactive web application.
- Be accessible through a URL.
- Be optimized primarily for an Android tablet.
- Also work on a Windows PC.
- Support touch input.
- Work offline after initial loading where practical.
- Be suitable for later conversion to an installable PWA.

Version 1 does not require a native Android application.

---

# 24. Hosting and Source Code

Source code should be stored in GitHub.

Initial GitHub repository:

```text
dart-training
```

The application may initially be hosted using GitHub Pages or another simple static hosting solution.

Training data must not be stored publicly in the GitHub repository.

---

# 25. UI/UX Design Requirements

The user interface should feel:

- Modern.
- Clean.
- Sporty.
- Premium.
- Easy to use quickly.

The design should primarily target a portrait-oriented Android tablet.

---

## 25.1 Overall Visual Style

The application should use a dark visual theme.

Recommended design:

- Black or near-black main background.
- Dark gray panels.
- White/light-gray primary text.
- Red primary accent.
- Gold/yellow secondary accent.
- Minimal use of additional colors.

The interface should avoid excessive red or yellow text.

Primary reading text should remain white or light gray.

---

## 25.2 Background Image

A dartboard image should remain subtly visible in the background throughout the application.

The dartboard should:

- Be sharp enough to be recognizable.
- Have low visual intensity.
- Be darkened.
- Have low opacity.
- Never reduce readability.
- Never compete with buttons or statistics.

The dartboard should act as visual identity rather than primary content.

---

## 25.3 Recommended Color Palette

Initial colors:

```text
Main background:        #0B0B0D
Secondary background:   #15161A
Primary text:           #F5F5F5
Secondary text:         #B8BDC7
Red accent:             #D72638
Gold accent:            #F2C94C
Borders/dividers:       #2A2D34
```

Exact colors may be refined during implementation.

---

## 25.4 Typography

Preferred font:

- Inter.

Typography should use:

- Clear headings.
- Large statistics.
- Strong contrast.
- Consistent sizes.
- Limited font-weight variation.

---

## 25.5 Touch and Tablet Use

The application is primarily used near a dartboard.

Therefore:

- Buttons must have large touch areas.
- Dart-entry buttons must be easy to press accurately.
- Important actions should not require precise tapping.
- Unnecessary scrolling during dart entry should be avoided.
- The application should work well in portrait tablet orientation.

---

## 25.6 Training Screen Layout

The main 3×3 dart-entry grid should be the dominant visual element.

```text
High 5     High 20     High 1

T5         T20         T1

Low 5      Low 20      Low 1
```

T20 should receive additional visual emphasis.

Major-miss controls should be visually separated from the main grid.

Live statistics should remain visible but must not reduce the usability of dart-entry controls.

---

## 25.7 Statistics Screens

Statistics pages should use a dashboard-style design.

Recommended components:

- Statistic cards.
- Percentage values.
- Trend graphs.
- Structured sections.
- Consistent spacing.

Statistic cards should preferably use:

- Dark panel background.
- Small secondary label.
- Large primary value.
- Optional red/gold accent.

Graphs should:

- Use dark backgrounds.
- Use high-contrast lines.
- Avoid too many simultaneous data series.
- Prefer one primary metric per graph where practical.

---

## 25.8 Visual Feedback

The application should provide immediate feedback for:

- Dart recorded.
- Session started.
- Session ended.
- Undo performed.
- Statistics filter changed.
- Button pressed.

Feedback should be immediate but unobtrusive.

---

# 26. Acceptance Criteria

Requirements should eventually include testable examples.

Example:

Given 100 Triple 20 Training darts:

- 20 hit T20.
- 30 hit High 20 or Low 20.
- 25 land in segment 5 zones.
- 15 land in segment 1 zones.
- 10 are major misses.

Expected:

```text
T20 rate = 20%

Total 20 segment rate = 50%

5-side near misses = 25%

1-side near misses = 15%

Major misses = 10%
```

The result-zone distribution must total 100%.

Additional acceptance tests will be added during implementation.

---

# 27. Future Training Programs

Future versions should support:

## Doubles Training

TBD.

## Around the Clock

TBD.

## 501

TBD.

Each training type should use the same underlying concepts:

- Individual dart records.
- Training sessions.
- Historical statistics.
- Rolling statistics.
- Trend analysis.

---

# 28. Future Ideas

Possible future features include:

- Dartboard heatmaps.
- Automatic training recommendations.
- AI-assisted analysis.
- Camera-based dart detection.
- Voice input.
- Cloud synchronization.
- Multiple users.
- Session comparison.
- Fatigue analysis.
- Session-phase analysis.
- Automatic training plans.
- Additional training games.

These are not requirements for Version 1.