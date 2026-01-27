# Community & Interaction

## Purpose
Enhances user interaction on Envato sites, specifically for authors and active community members.

## Requirements

### 1. Follow User
- **Target**: Links to user profiles (`/user/<username>`).
- **Injection**: Adds a `[follow]` link next to the user's name.
- **Logic**:
    - If `refer=1` is present in URL, auto-execute follow logic.
    - Checks following status via `.user-info-header__cta-buttons` JSON data.
    - Toggles follow/unfollow on click (opens new tab to perform action if needed or uses existing buttons).

### 2. Copy Comment
- **Target**: Comment bodies (`.comment__body`).
- **UI**: Adds a `Copy` button next to user links in comments.
- **Action**: Copies the *text content* of the comment to the clipboard. Fallback to `textarea` selection if Clipboard API fails.

### 3. Comment Editor Toolbar
- **Target**: `.simple_form textarea` (Comment reply forms).
- **Tools**:
    - **Formatting**: Bold (`<strong>`), Italic (`<em>`), Lists (`<ul>`, `<ol>`, `<li>`), Headers (`<h3>`, `<h4>`), Code (`<pre>`, `<code>`), Quote (`<blockquote>`).
    - **Media**: Image (`<img>` template).
    - **Links**: Anchor (`<a>`).
    - **Emoji**: Set of common emojis.
- **Behavior**: Inserts tag around selection or at cursor.

### 4. Copy User HTML
- **Target**: `.user-html.user-html__with-lazy-load` (Profile content).
- **UI**: Adds "Copy as Markdown" button.
- **Logic**:
    - Clones HTML.
    - Replaces links with text.
    - Removes images.
    - Converts HTML tags (h1-h4, strong, em, code, pre, blockquote, lists) to Markdown syntax.
    - Copies Markdown to clipboard.
