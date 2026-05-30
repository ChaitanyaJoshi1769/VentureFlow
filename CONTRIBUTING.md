# Contributing to VentureFlow AI

Thank you for your interest in contributing to VentureFlow AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and professional
- Focus on the code, not the person
- Welcome diverse perspectives
- Ask questions if unclear

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `develop`
4. **Follow the setup guide** in [SETUP.md](./docs/SETUP.md)

## Workflow

### Branch Naming

Use descriptive branch names:
```
feat/investor-search
fix/email-validation
docs/api-guide
refactor/crm-module
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add investor semantic search
fix: correct email validation regex
docs: update API documentation
refactor: simplify CRM service
test: add investor search tests
chore: update dependencies
```

### Pull Requests

1. **Create a PR** from your feature branch to `develop`
2. **Link related issues** in the PR description
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Request reviews** from team members

## Code Style

### JavaScript/TypeScript

We use:
- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type safety

```bash
# Format code
npm run lint:fix
npm run format

# Type check
npm run type-check
```

### Naming Conventions

- **Files**: kebab-case (e.g., `investor-service.ts`)
- **Classes**: PascalCase (e.g., `InvestorService`)
- **Functions**: camelCase (e.g., `getInvestors()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_INVESTORS`)
- **Interfaces**: PascalCase with I prefix (e.g., `IInvestor`)

### Code Organization

```typescript
// 1. Imports
import { Injectable } from '@nestjs/common';

// 2. Interfaces
interface Options {
  limit?: number;
}

// 3. Class/Function
@Injectable()
export class InvestorService {
  // 3a. Constructor
  constructor(private db: Database) {}

  // 3b. Public methods
  async getInvestors(options?: Options) {}

  // 3c. Private methods
  private validate() {}
}
```

## Testing

### Test Coverage

- Aim for **90%+ coverage**
- Write tests before implementation (TDD)
- Include unit, integration, and E2E tests

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Files

```
src/services/investor.service.ts
src/services/investor.service.spec.ts
```

## Database Changes

### Creating Migrations

```bash
# Create a migration
npm -w @ventureflow/database prisma migrate dev --name add_investor_embeddings

# Review generated SQL in prisma/migrations/
```

### Schema Changes

1. Update `packages/database/prisma/schema.prisma`
2. Run `npm run db:generate`
3. Create migration
4. Test locally
5. Document changes in PR

## Documentation

### Update Docs For:
- New features
- API changes
- Database schema changes
- Deployment procedures
- Architecture decisions

### Documentation Files

- `/docs/ARCHITECTURE.md` - System design
- `/docs/DATABASE.md` - Database schema
- `/docs/API.md` - API documentation
- `/docs/SETUP.md` - Setup guide
- `/docs/ROADMAP.md` - Implementation plan

## Performance

- Use **Lighthouse** (target: 95+)
- Monitor **API response times** (target: <200ms P95)
- Profile with **Chrome DevTools**
- Use **Query optimization** for database

```bash
# Build analysis
npm run build -- --analyze
```

## Security

- **No secrets** in code (use .env)
- **Validate input** on server
- **Use HTTPS** for all requests
- **Escape output** to prevent XSS
- **Check dependencies** for vulnerabilities

```bash
# Audit dependencies
npm audit
npm audit fix
```

## Review Process

### What Reviewers Look For:
1. ✅ Code follows style guide
2. ✅ Tests are included and pass
3. ✅ Documentation is updated
4. ✅ No performance degradation
5. ✅ Security best practices
6. ✅ No breaking changes

### Getting Approved:
- Address all review comments
- Resolve conflicts
- Wait for approvals
- Squash commits (if requested)

## Merge Requirements

Before merging to `main`:
- ✅ All tests pass
- ✅ Code review approved
- ✅ No merge conflicts
- ✅ CI/CD pipeline succeeds
- ✅ Staging deployment successful (for main)

## Release Process

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `1.0.0` - Initial release
- `1.1.0` - New feature (minor)
- `1.1.1` - Bug fix (patch)

### Release Steps

1. Update version in `package.json`
2. Create release notes
3. Tag release on GitHub
4. Deploy to production
5. Announce release

## Common Tasks

### Adding a New Feature

```typescript
// 1. Create types
// packages/types/src/index.ts
export interface MyFeature {
  id: string;
  name: string;
}

// 2. Create service
// apps/api/src/modules/my-feature/my-feature.service.ts
@Injectable()
export class MyFeatureService {
  async create(data: MyFeature) {}
}

// 3. Create API endpoint
// apps/api/src/modules/my-feature/my-feature.controller.ts
@Controller('my-feature')
export class MyFeatureController {
  @Post()
  create(@Body() data: MyFeature) {}
}

// 4. Create tests
// apps/api/src/modules/my-feature/my-feature.service.spec.ts
describe('MyFeatureService', () => {
  it('should create', () => {});
});

// 5. Update frontend
// apps/web/src/components/MyFeature.tsx
export function MyFeature() {}

// 6. Document changes
// Update relevant docs
```

### Fixing a Bug

1. Create an issue if not exists
2. Write a failing test
3. Fix the bug
4. Verify test passes
5. Create PR linking issue

### Performance Optimization

1. Profile with DevTools
2. Identify bottleneck
3. Implement optimization
4. Measure improvement
5. Document approach

## Troubleshooting

### Tests Failing

```bash
# Clear cache
npm run clean

# Reinstall
rm -rf node_modules
npm install

# Run tests again
npm run test
```

### Database Issues

```bash
# Reset database
npm -w @ventureflow/database prisma migrate reset

# Check migrations
npm -w @ventureflow/database prisma migrate status
```

### Build Errors

```bash
# Type check
npm run type-check

# Lint
npm run lint:fix

# Clean and rebuild
npm run clean
npm run build
```

## Questions?

- 📧 **Email**: team@ventureflow.io
- 💬 **Discussions**: GitHub Discussions
- 🐛 **Issues**: GitHub Issues
- 📚 **Docs**: [Documentation](./docs)

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

**Thank you for contributing to VentureFlow AI!** 🚀
