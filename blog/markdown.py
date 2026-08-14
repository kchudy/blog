"""Markdown-to-sanitized-HTML rendering for post bodies.

Post bodies are stored as raw Markdown and are author-controlled (see `.ai/project.md` — authors
are trusted, internal users), but we still sanitize the rendered HTML rather than `mark_safe`-ing
it unconditionally: it's cheap insurance against a compromised account or a copy-pasted snippet
containing something like a `<script>` tag, per `.ai/coding-style.md`'s rule against ever
marking user-influenced content safe without sanitizing it first.
"""

import bleach
import markdown as markdown_lib

ALLOWED_TAGS = [
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "b",
    "i",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
]

ALLOWED_ATTRIBUTES = {
    "a": ["href", "title", "rel"],
    "img": ["src", "alt", "title"],
}


def render_markdown(text: str) -> str:
    """Render Markdown `text` to sanitized HTML safe to embed in a template."""
    html = markdown_lib.markdown(text, extensions=["fenced_code", "tables"])
    return bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)
