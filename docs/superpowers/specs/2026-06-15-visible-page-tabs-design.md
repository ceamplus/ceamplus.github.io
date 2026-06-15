# CEAM+ Visible Page Tabs Design

## Goal

Make every major CEAM+ section visible and easy to reach from every page.

## Header Structure

The sticky header will use two clear rows:

1. Brand row with the CEAM+ logo on the left and Start Assessment on the right.
2. Navigation row with visible tabs for Home, Layers, Mission, Values, Assessments, Guides, AI Tools, About, and Contact Me.

The current page tab will use `aria-current="page"` and a stronger visual treatment. On narrow screens, the complete tab row will remain visible and scroll horizontally instead of disappearing.

## Scope

Update the shared navigation markup in all main HTML pages and the shared header styles in `styles.css`. Keep all pages separate. Do not remove or combine page content, assessment logic, forms, or Supabase preparation.

## Verification

- Every main page contains all nine tabs.
- Exactly one tab is marked as the current page.
- The header visibly forms two rows.
- Mobile navigation remains visible and horizontally scrollable.
- All tab links open the intended pages.
- No horizontal overflow affects the page itself.

