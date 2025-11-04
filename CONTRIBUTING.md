# Contributing to Telegram Rewards Bot

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors.
Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or Supabase/Neon account)
- A Telegram account (for testing)

### Setup Development Environment

1. Fork the repository:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/rewards-bot.git
   cd rewards-bot
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file with required variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) to verify setup

## Development Workflow

### Creating a Feature Branch

\`\`\`bash
git checkout -b feature/your-feature-name
\`\`\`

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### Making Changes

1. Make your changes following the coding standards
2. Test your changes locally
3. Keep commits focused and descriptive

### Coding Standards

- **TypeScript**: Use strict mode
- **Components**: Use React functional components with hooks
- **Styling**: Use Tailwind CSS utility classes
- **API Routes**: Follow RESTful conventions
- **Database**: Use parameterized queries (prepared statements)
- **Security**: Never commit secrets or API keys

### Commit Messages

Follow the conventional commits format:

\`\`\`
type(scope): subject

body (optional)

footer (optional)
\`\`\`

Examples:
- `feat(tasks): add task completion tracking`
- `fix(api): handle null referral codes`
- `docs: update installation guide`
- `refactor(dashboard): simplify chart components`

## Submitting Changes

1. Push to your fork:
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

2. Open a Pull Request on GitHub with:
   - Clear title describing your changes
   - Description of what you changed and why
   - Reference to related issues (if applicable)
   - Screenshots for UI changes

3. PR should include:
   - Updated documentation
   - Unit tests for new features
   - No breaking changes (or documented)

### PR Checklist

- [ ] Tests pass locally (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commits are descriptive
- [ ] No console errors or warnings
- [ ] TypeScript types are correct
- [ ] Component props are properly typed

## Testing

### Running Tests

\`\`\`bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run lint        # Check linting
\`\`\`

### Writing Tests

- Create `.test.ts` or `.test.tsx` files next to components
- Test user interactions, not implementation details
- Aim for >80% code coverage

## Documentation

- Update README.md for major features
- Add JSDoc comments for functions
- Document API changes
- Update ARCHITECTURE.md if structure changes

## Issue Types

- **Bug Report**: Use the bug template
- **Feature Request**: Use the feature template
- **Question**: Use discussions section
- **Documentation**: File as issue with docs tag

## Getting Help

- Check existing issues and documentation
- Ask in GitHub discussions
- For security issues, email security@rewardsbot.com

## Release Process

Maintainers will handle releases. We follow semantic versioning.

---

Thank you for contributing to make this project better!
