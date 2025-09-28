# GitHub Issues & Project Management Integration

## GitHub Labels for Agile Management

### Story Types
- `epic` - Large feature spanning multiple sprints
- `user-story` - Standard user story
- `task` - Development task
- `bug` - Bug report
- `hotfix` - Critical production fix
- `spike` - Research/investigation work

### Sprint Management
- `sprint-10` - Current sprint items
- `sprint-11` - Next sprint items
- `backlog` - Product backlog items
- `icebox` - Ideas for future consideration

### Priority Levels
- `priority/critical` - Must be fixed immediately
- `priority/high` - Important for current sprint
- `priority/medium` - Important but can wait
- `priority/low` - Nice to have

### Story Points
- `sp/1` - 1 story point
- `sp/2` - 2 story points
- `sp/3` - 3 story points
- `sp/5` - 5 story points
- `sp/8` - 8 story points
- `sp/13` - 13 story points (needs breakdown)

### Status Labels
- `status/todo` - Ready for development
- `status/in-progress` - Currently being worked on
- `status/review` - In code review
- `status/testing` - In testing phase
- `status/done` - Completed and accepted

### Component Labels
- `component/frontend` - Frontend changes
- `component/backend` - Backend changes
- `component/database` - Database changes
- `component/infrastructure` - DevOps/Infrastructure
- `component/documentation` - Documentation updates

## Issue Templates

### User Story Template
```markdown
## User Story
As a [type of user], I want [some goal] so that [some reason/benefit].

## Acceptance Criteria
- [ ] Given [context], when [action], then [expected outcome]
- [ ] Given [context], when [action], then [expected outcome]

## Story Points
[1/2/3/5/8/13]

## Dependencies
- [ ] Issue #123
- [ ] External API integration

## Definition of Done
- [ ] Code implemented and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests pass
- [ ] UI is responsive on all devices
- [ ] Accessibility standards met
- [ ] Code is documented
- [ ] Feature deployed to staging
- [ ] Product Owner acceptance obtained

## Notes
[Additional context, mockups, technical notes]
```

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Environment
- Browser: 
- OS: 
- Device: 
- Version: 

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
[If applicable]

## Additional Context
[Any other relevant information]

## Priority Assessment
- Impact: [High/Medium/Low]
- Urgency: [High/Medium/Low]
- Frequency: [Always/Often/Sometimes/Rarely]
```

## GitHub Project Boards

### Sprint Board (Current Sprint)
Columns:
- **Sprint Backlog** - Stories committed for current sprint
- **In Progress** - Stories being actively worked on
- **Code Review** - Stories in review process
- **Testing** - Stories being tested
- **Done** - Completed stories

### Product Backlog Board
Columns:
- **Ideas** - Initial ideas and concepts
- **Refined** - Stories that meet Definition of Ready
- **Sprint Ready** - Stories ready for sprint planning
- **Epics** - Large features spanning multiple sprints

### Bug Tracking Board
Columns:
- **Reported** - New bugs reported
- **Triaged** - Bugs assessed and prioritized
- **In Progress** - Bugs being fixed
- **Fixed** - Bugs fixed, pending verification
- **Verified** - Bugs verified as fixed

## Automation Rules

### Auto-assign Labels
```yaml
# When issue is created with story point in title
if: title contains "SP:"
then: add label "story-point/[number]"

# When PR is linked to issue
if: PR linked to issue with "epic" label  
then: add "epic" label to PR

# When issue is moved to "In Progress"
if: issue moved to "In Progress" column
then: add "status/in-progress" label
```

### Auto-close Issues
```yaml
# When PR is merged
if: PR merged AND PR closes issue
then: move issue to "Done" column

# When issue is in "Done" for 7 days
if: issue in "Done" column for > 7 days
then: close issue with comment "Sprint completed"
```

## Integration with Development Workflow

### Branch Naming Convention
```
feature/SP-123-user-authentication
bugfix/SP-456-cart-calculation-error
hotfix/SP-789-critical-payment-bug
```

### Commit Message Format
```
SP-123: Add user authentication API

- Implement JWT token generation
- Add password validation
- Update user model

Closes #123
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Related Issues
- Closes #123
- Related to #456

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Review Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```
