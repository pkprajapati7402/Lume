# Contributing to Lume

First off, thank you for considering contributing to Lume! It's people like you that make Lume such a great tool for global payroll.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Exercise empathy and kindness
- Accept constructive criticism gracefully
- Focus on what is best for the community

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, network - testnet/mainnet)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** and why it would be useful
- **Possible implementation** if you have ideas
- **Examples** from other projects if relevant

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure your code follows the existing style
4. Make sure your code lints (`npm run lint`)
5. Update documentation as needed
6. Write a clear commit message

## Development Process

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Lume.git
cd Lume

# Install dependencies
npm install

# Create a branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev
```

### Coding Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Keep components small and focused
- Write meaningful comments for complex logic
- Use Prettier for formatting (if configured)

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests after the first line

Example:
```
Add bulk payment validation

- Validate CSV format before upload
- Check for required fields
- Add user-friendly error messages

Fixes #123
```

### Testing

Before submitting a pull request:

1. Test on both testnet and mainnet
2. Test responsive design on mobile devices
3. Verify wallet connection with Freighter
4. Test all payment flows
5. Check for console errors

## Project Structure

```
app/
├── components/     # React components
│   ├── dashboard/ # Dashboard-specific components
│   └── ...
├── hooks/         # Custom React hooks
├── store/         # State management
└── ...
```

## Key Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Stellar SDK** - Blockchain integration
- **Freighter API** - Wallet connection
- **Zustand** - State management

## Stellar Integration

When working with Stellar features:

1. Always test on testnet first
2. Handle network errors gracefully
3. Provide clear feedback for transaction status
4. Consider transaction fees
5. Validate addresses before sending

## Need Help?

- Join our community discussions
- Check existing issues and PRs
- Reach out to maintainers
- Email: support@lume.pay

## Recognition

Contributors will be added to our README and acknowledged in release notes.

Thank you for contributing to Lume! 🚀
