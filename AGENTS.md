# Agent Instructions

Agents working in this repository must follow the rules in this file.

## Commit messages

Use the [Conventional Commits 1.0.0 specification](https://www.conventionalcommits.org/en/v1.0.0/) for all commit messages.

### Format summary

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- **Type**: A noun describing the change. `feat` is for a new feature and `fix` for a bug fix. Other types are allowed; commonly used examples include `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, and `test`. The specification does not define a fixed list.
- **Scope**: Optional text in parentheses identifying the area of the change, such as `feat(parser): ...`.
- **Description**: A short summary of the change, following the colon and space.
- **Body**: Optional additional details, separated from the header by a blank line.
- **Footer(s)**: Optional metadata, each separated from the body or previous footer by a blank line. Use `BREAKING CHANGE: <description>` to explain an incompatible change.
- **Breaking change marker**: Add `!` before the colon (for example, `feat(api)!: ...`) to mark a breaking change; provide a `BREAKING CHANGE:` footer with details when needed.

### Commit additional rules

- Body's lines must not be longer than 100 characters
