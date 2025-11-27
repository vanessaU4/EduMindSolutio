# Question Management System Guide

## Overview
The Question Management System allows users, guides, and administrators to create, edit, and manage assessment questions and answers within the EduMindSolutions platform.

## Access Levels

### 👤 **Standard Users**
- **View Only Access**: Can browse assessment types and view questions
- **Navigation**: Available from User Dashboard → "Question Manager"
- **Permissions**: Read-only access to all questions and assessment types

### 👨‍⚕️ **Guides/Mentors** 
- **Edit Access**: Can create, edit, and delete questions
- **Navigation**: Available from Guide Dashboard → "Question Manager"
- **Permissions**: Full CRUD operations on questions and assessment types

### 👨‍💼 **Administrators**
- **Full Access**: Complete management of questions and assessment system
- **Navigation**: Available from Admin Dashboard → "Question Manager" or Assessment Center
- **Permissions**: All guide permissions plus system configuration

## Features

### 📋 **Question Manager Interface**
- **Assessment Type Browser**: Select from PHQ9, GAD7, PCL5, and custom types
- **Question List View**: See all questions with metadata and options count
- **Real-time Updates**: Changes reflect immediately across the interface

### 🛠️ **Question Builder**
- **Multiple Question Types**:
  - Multiple Choice (2+ options with custom scoring)
  - Rating Scale (1-10 numeric scale)
  - Yes/No (Binary choice)
  - Text Response (Open-ended)

- **Quick Templates**:
  - Depression (PHQ9 style)
  - Anxiety (GAD7 style) 
  - Likert Scale (5-point agreement)
  - Frequency Scale (Never to Always)

### ⚙️ **Advanced Features**
- **Answer Options Management**: Add, remove, duplicate, and reorder options
- **Scoring System**: Custom scores per answer option
- **Question Settings**:
  - Required vs Optional questions
  - Reverse scoring for inverted questions
  - Category assignment (mood, anxiety, sleep, etc.)
- **Live Preview**: See exactly how questions appear to users

## Navigation Paths

### From Dashboards
```
User Dashboard → Quick Actions → Question Manager
Guide Dashboard → Quick Actions → Question Manager  
Admin Dashboard → Quick Actions → Question Manager
```

### From Assessment Center
```
Assessment Center → Quick Actions → Question Manager (Button visible to all users)
```

### Direct URL
```
/assessments/questions
```

## Question Creation Workflow

### 1. **Select Assessment Type**
- Choose from existing types (PHQ9, GAD7, etc.)
- Or create questions for custom assessments

### 2. **Choose Question Type**
- Multiple Choice: Standard assessment format
- Rating Scale: 1-10 numerical rating
- Yes/No: Simple binary choice
- Text: Open-ended response

### 3. **Apply Template (Optional)**
- Use quick templates for common patterns
- Templates auto-populate question text and options
- Customize as needed after applying

### 4. **Configure Question**
- **Question Text**: Main question content
- **Description**: Optional additional context
- **Answer Options**: Configure text and scoring
- **Settings**: Required, reverse scoring, category

### 5. **Preview & Save**
- Live preview shows user experience
- Validation ensures completeness
- Save to assessment type

## Answer Options Management

### Adding Options
- Click "Add Option" to create new answer choices
- Each option has text and numerical score
- Minimum 2 options required (except text questions)

### Scoring System
- Assign numerical scores to each option
- Higher scores typically indicate greater severity/frequency
- Reverse scoring available for inverted questions

### Option Actions
- **Edit**: Modify text and score in-place
- **Duplicate**: Copy option to create similar choices
- **Remove**: Delete options (minimum 2 required)
- **Reorder**: Drag and drop to rearrange (UI ready)

## Question Categories

Organize questions by category for better management:
- **General**: Default category
- **Mood**: Depression, emotional state
- **Anxiety**: Worry, nervousness, panic
- **Sleep**: Sleep patterns, insomnia
- **Social**: Relationships, social interaction
- **Physical**: Physical health symptoms

## Best Practices

### Question Writing
- Use clear, simple language
- Avoid double-barreled questions
- Be specific about time frames
- Consider cultural sensitivity

### Answer Options
- Provide balanced response scales
- Use consistent option patterns within assessments
- Consider neutral/middle options for scales
- Ensure options are mutually exclusive

### Scoring
- Use consistent scoring scales across similar questions
- Document scoring rationale
- Test scoring logic with sample responses
- Consider reverse scoring for positive items

## Technical Implementation

### Data Structure
```typescript
interface Question {
  id: string;
  type: 'multiple_choice' | 'scale' | 'yes_no' | 'text';
  text: string;
  description?: string;
  options: QuestionOption[];
  isRequired: boolean;
  isReverseScored: boolean;
  category?: string;
}
```

### API Endpoints
- `GET /api/assessments/types/` - List assessment types
- `GET /api/assessments/types/{id}/` - Get specific type with questions
- `POST /api/assessments/questions/` - Create new question
- `PUT /api/assessments/questions/{id}/` - Update question
- `DELETE /api/assessments/questions/{id}/` - Delete question

### Validation Rules
- Question text required (non-empty)
- Minimum 2 options for choice questions
- All options must have text
- Scores must be numerical
- Category must be from predefined list

## Troubleshooting

### Common Issues
1. **Button Not Visible**: Check user authentication and role
2. **Cannot Edit**: Users have read-only access, guides/admins can edit
3. **Validation Errors**: Ensure all required fields completed
4. **Save Failures**: Check network connection and permissions

### Error Messages
- "Question text is required" - Add question content
- "Questions must have at least 2 options" - Add more answer choices
- "All options must have text" - Fill in empty option text
- "Assessment ID is required" - Select assessment type first

## Future Enhancements

### Planned Features
- Question import/export functionality
- Bulk question operations
- Question versioning and history
- Advanced question analytics
- Custom question types
- Question bank sharing between assessments

### Integration Points
- Assessment taking interface
- Results calculation engine
- Reporting and analytics
- User progress tracking

---

## Support

For technical support or questions about the Question Management System:
- Check this documentation first
- Review error messages for specific guidance
- Contact system administrators for access issues
- Report bugs through the platform feedback system
