# E-Commerce Platform 🛒

A modern, full-stack e-commerce platform built with **Agile methodology** using Next.js 14, featuring separate dashboards for buyers, sellers, and delivery agents.

## 🏃‍♂️ Agile Development Approach

This project follows **Scrum methodology** with:
- **2-week sprints** with clear goals and deliverables
- **Continuous integration/deployment** for rapid feedback
- **User story-driven development** focusing on business value
- **Regular retrospectives** for continuous improvement
- **Cross-functional team collaboration** 

### Current Sprint: Sprint 10 🎯
- **Goal**: Enhanced delivery management with real-time tracking
- **Duration**: November 11-24, 2025
- **Velocity**: 21 story points
- **Status**: In Progress (Day 9/14)

## 📋 Project Management

- **Product Backlog**: [PRODUCT_BACKLOG.md](./PRODUCT_BACKLOG.md)
- **Current Sprint**: [SPRINT_10_BOARD.md](./SPRINT_10_BOARD.md)  
- **Team Metrics**: [docs/TEAM_METRICS.md](./docs/TEAM_METRICS.md)
- **Release Plan**: [RELEASE_PLAN.md](./RELEASE_PLAN.md)

## 🎯 Features Delivered (Agile Increments)

### ✅ Sprint 1-3: Foundation (MVP)
- User authentication system (Buyers, Sellers, Delivery Agents)
- Basic product CRUD operations
- Shopping cart functionality

### ✅ Sprint 4-6: Core E-commerce
- Order processing and management
- Payment integration
- Wishlist functionality
- Search and filtering

### ✅ Sprint 7-9: Enhanced UX
- Responsive seller dashboard with analytics
- Enhanced product management (edit, delete with constraints)
- Smart category navigation with horizontal scrolling
- Product view modals with detailed information

### 🔄 Sprint 10: Delivery Enhancement (In Progress)
- Automated delivery assignment system
- Real-time order tracking
- GPS integration for delivery agents

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: JWT with HTTP-only cookies
- **File Upload**: Local storage with cloud-ready architecture
- **UI Components**: shadcn/ui, Radix UI
- **Development**: Agile/Scrum methodology with GitHub Projects

## 🚀 Getting Started (Developer Setup)

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Understanding of Agile/Scrum practices

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce-platform.git
cd ecommerce-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Development Workflow (Agile Practices)
1. **Pick a story** from current sprint backlog
2. **Create feature branch**: `git checkout -b feature/SP-123-story-name`
3. **Develop incrementally** with frequent commits
4. **Write tests** as you develop (TDD approach)
5. **Create pull request** when story is complete
6. **Code review** by team members
7. **Deploy to staging** for Product Owner review
8. **Demo in Sprint Review** when accepted

## 👥 Team Structure & Roles

- **Product Owner**: Defines requirements and priorities
- **Scrum Master**: Facilitates ceremonies and removes blockers  
- **Development Team**: Cross-functional developers
- **Stakeholders**: Business users and customers

## 📊 Agile Metrics & Performance

- **Current Velocity**: 26 story points/sprint (↑18% improvement)
- **Team Happiness**: 4.2/5 (measured weekly)
- **Bug Escape Rate**: 2.1% (target: <5%)
- **Deployment Frequency**: 2.2 per week
- **Code Coverage**: 84%

## 🎯 Definition of Done

Every user story must meet these criteria:
- [ ] Code implemented and peer reviewed
- [ ] Unit tests written (>80% coverage)  
- [ ] Integration tests pass
- [ ] UI is responsive on all devices
- [ ] Accessibility standards met
- [ ] Code is documented
- [ ] Feature deployed to staging
- [ ] Product Owner acceptance obtained

## 🔄 Continuous Improvement

We conduct **Sprint Retrospectives** every 2 weeks to:
- Celebrate what went well
- Identify improvement opportunities  
- Create actionable items for next sprint
- Track team happiness and productivity

Latest improvements implemented:
- ✅ Automated accessibility testing
- ✅ Pull request templates
- ✅ Story point estimation using planning poker
- ✅ Shared component library documentation

## 📈 Release Strategy

- **Monthly major releases** with new features
- **Weekly minor releases** with improvements
- **Hotfixes** as needed for critical issues
- **Blue-green deployment** for zero-downtime updates

**Next Release (1.0)**: January 15, 2026 - MVP Launch

## 🤝 Contributing (Agile Guidelines)

1. **Join Sprint Planning** to understand current priorities
2. **Follow user story format** when creating issues
3. **Participate in daily standups** for coordination
4. **Write tests** for all new functionality
5. **Update documentation** with code changes
6. **Request code review** before merging

See [docs/AGILE_CEREMONIES.md](./docs/AGILE_CEREMONIES.md) for detailed guidelines.

## 📚 Documentation

- [Agile Project Structure](./AGILE_PROJECT_STRUCTURE.md)
- [User Story Templates](./docs/USER_STORY_TEMPLATES.md)
- [Sprint Ceremonies Guide](./docs/AGILE_CEREMONIES.md)
- [Team Metrics Dashboard](./docs/TEAM_METRICS.md)
- [GitHub Integration](./docs/GITHUB_INTEGRATION.md)

## 🔗 Live Demo

- **Application**: [https://ecommerce-platform.vercel.app](https://ecommerce-platform.vercel.app)
- **Sprint Board**: [GitHub Projects](https://github.com/your-username/ecommerce-platform/projects)
- **Team Dashboard**: [Metrics & Velocity](./docs/TEAM_METRICS.md)

## 📞 Contact & Collaboration

- **Scrum Master**: [scrum-master@company.com](mailto:scrum-master@company.com)
- **Product Owner**: [product-owner@company.com](mailto:product-owner@company.com)  
- **Development Team**: [dev-team@company.com](mailto:dev-team@company.com)

---

**Built with ❤️ using Agile methodology** | **Sprint 10 in progress** | **Next release: January 2026**
