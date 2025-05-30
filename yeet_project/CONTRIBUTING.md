# Contributing to YEET - Artistic Community Platform

Thank you for your interest in contributing to YEET! This document provides guidelines and information for contributors to our revolutionary artistic community platform.

## 🎨 Our Mission

YEET is more than just a platform - it's a cultural bridge that connects traditional Indian artistic heritage with modern digital creativity. Every contribution should honor this mission while advancing our technical capabilities.

## 🌟 Values & Principles

### Cultural Sensitivity
- **Respect Heritage**: Honor Indian artistic traditions, particularly Carnatic music and quantum consciousness philosophy
- **Educational Value**: Ensure contributions have learning and cultural preservation value
- **Authenticity**: Maintain cultural accuracy in all artistic and philosophical content
- **Inclusivity**: Welcome artists from all backgrounds while preserving core cultural elements

### Technical Excellence
- **Quality Code**: Write clean, maintainable, and well-documented code
- **Performance**: Optimize for speed and scalability
- **Security**: Prioritize user data protection and platform security
- **Testing**: Ensure comprehensive test coverage for all contributions

### Community Focus
- **Artist-Centric**: Prioritize features that directly benefit artists and creators
- **Collaboration**: Foster community collaboration and mentorship
- **Accessibility**: Ensure platform accessibility for artists with diverse needs
- **Growth**: Support both individual artistic growth and community expansion

---

## 🚀 Getting Started

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR-USERNAME/yeet-artistic-platform.git
cd yeet-artistic-platform
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:setup
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

### 3. Create a Branch
```bash
# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
# or
git checkout -b cultural/your-cultural-enhancement
```

---

## 🎯 Types of Contributions

### 🔧 Code Contributions

#### Frontend Development
- **React Components**: New UI components following terminal aesthetic
- **Styling**: CSS improvements maintaining cyberpunk/cultural theming
- **Gamification**: Enhancements to ART KEYS, achievements, and leaderboards
- **Real-time Features**: WebSocket-based collaborative features
- **Accessibility**: Making the platform more accessible to all artists

#### Backend Development
- **API Endpoints**: New routes following RESTful conventions
- **Database**: Schema improvements and optimization
- **Security**: Authentication and authorization enhancements
- **Performance**: Query optimization and caching improvements
- **Integration**: Third-party service integrations

#### DevOps & Infrastructure
- **CI/CD**: GitHub Actions workflow improvements
- **Docker**: Container optimization and security
- **Kubernetes**: Deployment and scaling configurations
- **Monitoring**: Performance and security monitoring setup
- **Testing**: Automated testing pipeline enhancements

### 🎨 Cultural Contributions

#### Artistic Content
- **Carnatic Music**: Traditional compositions and educational content
- **Quantum Philosophy**: Content based on "The Quantum Lotus" teachings
- **Cultural Context**: Educational materials about Indian artistic heritage
- **Challenge Content**: Creative challenges honoring traditional art forms
- **Easter Eggs**: Cultural discoveries and hidden wisdom

#### Educational Resources
- **Tutorials**: Step-by-step guides for artistic techniques
- **Documentation**: Cultural context and historical background
- **Mentorship Content**: Materials supporting guru-shishya tradition
- **Community Guidelines**: Standards for respectful cultural exchange

### 📚 Documentation Contributions

#### Technical Documentation
- **API Documentation**: Endpoint descriptions and examples
- **Component Documentation**: React component usage and props
- **Database Documentation**: Schema descriptions and relationships
- **Deployment Guides**: Setup and deployment instructions

#### User Documentation
- **Getting Started Guides**: Onboarding for new artists
- **Feature Tutorials**: How to use platform features effectively
- **Cultural Guides**: Understanding the platform's cultural elements
- **FAQ**: Common questions and troubleshooting

---

## 📋 Contribution Guidelines

### Code Standards

#### TypeScript/JavaScript
```typescript
// Use meaningful variable names
const artKeyProgress = calculateArtKeyProgress(userId);

// Add comprehensive comments for complex logic
/**
 * Calculates cultural resonance score based on user's engagement
 * with traditional artistic elements and quantum consciousness concepts
 */
function calculateCulturalResonance(user: User): number {
  // Implementation details...
}

// Use proper TypeScript types
interface ArtKey {
  keyId: string;
  keyName: string;
  culturalSignificance: string;
  requiredActions: string[];
  rewards: ArtKeyRewards;
}
```

#### React Components
```tsx
// Use functional components with hooks
const ArtKeysSection: React.FC<ArtKeysSectionProps> = ({ 
  onTerminalOutput, 
  compact = false 
}) => {
  // Component implementation
};

// Proper prop typing
interface ArtKeysSectionProps {
  onTerminalOutput: (output: string) => void;
  compact?: boolean;
}
```

#### CSS/Styling
```css
/* Follow terminal aesthetic conventions */
.art-key-card {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(249, 202, 36, 0.3);
  border-radius: 12px;
  /* Cultural color significance: gold represents divine knowledge */
}

/* Use meaningful class names */
.carnatic-sequence-input {
  /* Styles specific to Carnatic music input */
}
```

### Database Guidelines

#### Schema Design
```sql
-- Use meaningful table and column names
CREATE TABLE user_art_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_id VARCHAR(100) NOT NULL,
    cultural_notes TEXT, -- Document cultural significance
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comprehensive comments
COMMENT ON TABLE user_art_keys IS 'Tracks users unlocked ART KEYS representing artistic mastery progression';
COMMENT ON COLUMN user_art_keys.cultural_notes IS 'Personal reflection on cultural significance of unlocked key';
```

#### Performance Considerations
```sql
-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS idx_user_art_keys_user_id ON user_art_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_art_keys_unlocked_at ON user_art_keys(unlocked_at);

-- Use triggers for automated gamification
CREATE OR REPLACE FUNCTION update_art_key_progress()
RETURNS TRIGGER AS $$
-- Function implementation
$$ LANGUAGE plpgsql;
```

### Testing Requirements

#### Unit Tests
```typescript
// Test business logic thoroughly
describe('ArtKeyService', () => {
  describe('calculateArtKeyProgress', () => {
    it('should correctly calculate progress for Carnatic music activities', () => {
      const user = createMockUser({ activities: ['upload_carnatic_composition'] });
      const progress = ArtKeyService.calculateProgress(user, 'first_note');
      expect(progress).toBe(25); // 25% progress towards 'first_note' ART KEY
    });

    it('should respect cultural authenticity requirements', () => {
      const invalidActivity = { type: 'inappropriate_cultural_content' };
      expect(() => ArtKeyService.validateActivity(invalidActivity))
        .toThrow('Cultural content must be authentic and respectful');
    });
  });
});
```

#### Integration Tests
```typescript
// Test API endpoints
describe('POST /api/gamification/art-keys/:keyId/unlock', () => {
  it('should unlock ART KEY when requirements are met', async () => {
    const response = await request(app)
      .post('/api/gamification/art-keys/first_note/unlock')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.message).toContain('ART KEY UNLOCKED');
    expect(response.body.artKey.keyName).toBe('First Note - Sa');
  });
});
```

#### Cultural Content Tests
```typescript
// Validate cultural accuracy
describe('Cultural Content Validation', () => {
  it('should validate Carnatic music terminology accuracy', () => {
    const validRaga = 'Shankarabharanam';
    const invalidRaga = 'NonExistentRaga';
    
    expect(CulturalValidator.validateRaga(validRaga)).toBe(true);
    expect(CulturalValidator.validateRaga(invalidRaga)).toBe(false);
  });

  it('should ensure quantum consciousness concepts align with "The Quantum Lotus"', () => {
    const concept = 'Observer consciousness in artistic creation';
    expect(CulturalValidator.validateQuantumConcept(concept)).toBe(true);
  });
});
```

---

## 🔍 Review Process

### Pull Request Guidelines

#### PR Title Format
```
feat: Add cultural easter egg for Diwali celebration
fix: Resolve ART KEY unlock notification timing
docs: Update API documentation for achievement endpoints
cultural: Add Carnatic music theory educational content
perf: Optimize database queries for leaderboard calculations
```

#### PR Description Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Cultural enhancement (content related to artistic heritage)
- [ ] Documentation update

## Cultural Considerations
- [ ] Content respects Indian artistic traditions
- [ ] Educational value is maintained
- [ ] Cultural accuracy has been verified
- [ ] Inclusive approach for diverse artistic backgrounds

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Cultural content reviewed for accuracy
- [ ] Manual testing completed

## Screenshots/Videos
Include screenshots or videos demonstrating the changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Documentation updated
- [ ] Changes generate no new warnings
- [ ] Tests added for new functionality
- [ ] Cultural sensitivity guidelines followed
```

### Review Criteria

#### Technical Review
1. **Code Quality**: Clean, readable, and maintainable code
2. **Performance**: No unnecessary performance degradation
3. **Security**: No security vulnerabilities introduced
4. **Testing**: Adequate test coverage and quality
5. **Documentation**: Appropriate documentation updates

#### Cultural Review
1. **Authenticity**: Cultural content is accurate and respectful
2. **Educational Value**: Contributions enhance cultural learning
3. **Sensitivity**: Content is inclusive and appropriate
4. **Context**: Proper cultural context provided
5. **Heritage**: Aligns with preservation of artistic traditions

### Approval Process

#### Required Approvals
- **Technical Lead**: For code quality and architecture
- **Cultural Consultant**: For cultural content and sensitivity
- **Security Lead**: For security-related changes
- **Community Manager**: For user-facing features

#### Merge Requirements
- ✅ All CI/CD checks pass
- ✅ Required approvals obtained
- ✅ No merge conflicts
- ✅ Cultural review completed (if applicable)
- ✅ Documentation updated
- ✅ Tests maintain >90% coverage

---

## 🎨 Cultural Contribution Guidelines

### Carnatic Music Content

#### Accuracy Requirements
- **Terminology**: Use correct Sanskrit/Tamil terminology
- **Notation**: Follow traditional notation systems accurately
- **Context**: Provide historical and cultural background
- **Respect**: Honor the guru-shishya tradition

#### Content Examples
```markdown
# Raga Shankarabharanam
**Melakarta Number**: 29
**Aroha**: Sa Ri Ga Ma Pa Dha Ni Sa
**Avaroha**: Sa Ni Dha Pa Ma Ga Ri Sa
**Cultural Context**: Known as the "King of Ragas," representing completeness and perfection
**Educational Value**: Demonstrates the mathematical precision in Carnatic music structure
```

### Quantum Consciousness Content

#### Philosophical Accuracy
- **Source Material**: Reference "The Quantum Lotus" concepts
- **Scientific Basis**: Maintain connection to quantum physics principles
- **Artistic Application**: Show practical application to creativity
- **Educational Approach**: Make complex concepts accessible

#### Content Structure
```markdown
# Observer Effect in Artistic Creation
**Quantum Principle**: The act of observation affects the observed
**Artistic Application**: The artist's consciousness shapes the creative outcome
**Practice**: Meditation before creation to align observer consciousness
**Result**: More intentional and powerful artistic expression
```

### Athletic Precision Integration

#### Mental Discipline Content
- **Focus Techniques**: Specific methods from competitive shooting
- **Pressure Management**: Handling performance pressure
- **Precision Training**: Mental exercises for accuracy
- **Flow State**: Achieving optimal performance consciousness

---

## 🐛 Bug Reports

### Bug Report Template
```markdown
## Bug Description
Clear description of the issue.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

## Cultural Context
If the bug affects cultural content or features.

## Additional Context
Any other context about the problem.
```

---

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the requested feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like this feature to work?

## Cultural Relevance
How does this feature align with our cultural mission?

## Artistic Value
How will this benefit the artistic community?

## Alternative Solutions
Other approaches you've considered.

## Additional Context
Any other context or screenshots.
```

---

## 🏆 Recognition

### Contributor Levels

#### 🌱 Seedling Contributor
- First merged pull request
- Understanding of cultural guidelines
- Basic technical competency

#### 🎨 Artist Contributor
- 5+ merged pull requests
- Cultural content contributions
- Community engagement

#### 🔮 Visionary Contributor
- 20+ merged pull requests
- Major feature contributions
- Mentoring other contributors

#### 🧙‍♂️ Sage Contributor
- 50+ merged pull requests
- Architectural contributions
- Cultural preservation efforts

### Recognition Benefits
- **Hall of Fame**: Featured on project website
- **Special Badges**: Unique recognition in community
- **Early Access**: Preview new features before release
- **Cultural Events**: Invitation to special cultural celebrations
- **Mentorship**: Opportunity to mentor new contributors

---

## 📞 Getting Help

### Communication Channels

#### Technical Support
- **GitHub Issues**: For bugs and technical questions
- **Discussions**: For general development questions
- **Discord**: Real-time technical discussion
- **Email**: tech-support@yeet.minimax.io

#### Cultural Guidance
- **Cultural Consultant**: cultural-guidance@yeet.minimax.io
- **Community Forum**: Cultural discussion and questions
- **Monthly Meetings**: Cultural content review sessions

#### Community Support
- **Discord**: Join our contributor community
- **Mentorship**: Connect with experienced contributors
- **Office Hours**: Weekly sessions with maintainers

### Response Times
- **Urgent Issues**: 24 hours
- **Bug Reports**: 3-5 business days
- **Feature Requests**: 1-2 weeks
- **Cultural Reviews**: 2-3 business days

---

## 📚 Resources

### Documentation
- [API Documentation](./documentation/api/)
- [Database Schema](./documentation/database/)
- [Cultural Context Guide](./documentation/cultural/)
- [Security Guidelines](./documentation/security/)

### Learning Materials
- [Carnatic Music Basics](./documentation/cultural/carnatic_music.md)
- [Quantum Consciousness Concepts](./documentation/cultural/quantum_consciousness.md)
- [Terminal Aesthetic Guide](./documentation/design/terminal_aesthetic.md)
- [React Development Best Practices](./documentation/frontend/react_best_practices.md)

### External Resources
- [Carnatic Music Academy](https://www.carnaticmusic.org/)
- ["The Quantum Lotus" Book](https://example.com/quantum-lotus)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/)

---

## 🙏 Thank You

Every contribution to YEET helps preserve and advance artistic heritage while building innovative tools for creative expression. Whether you're fixing a bug, adding a feature, contributing cultural content, or improving documentation, you're part of a community dedicated to elevating artistic consciousness.

Your contributions honor the vision of connecting traditional wisdom with modern innovation, creating a platform where artists can explore infinite creative possibilities while staying rooted in cultural authenticity.

**Together, we're building more than a platform - we're creating a bridge between ancient wisdom and future possibilities.**

---

*"In the act of contribution, we become both student and teacher, learning from the community while sharing our unique gifts. Every line of code, every cultural insight, every creative enhancement becomes part of the infinite tapestry of artistic expression."*

**🎨 Welcome to the YEET Community** 🙏

For questions about contributing, please reach out to: contributors@yeet.minimax.io
