# Sahayi JSON Data Structure Guide

## Overview
This guide explains the new, developer-friendly JSON structure for managing Sahayi study resources. The restructured format makes it easy for beginner developers to find and modify specific notes or add new resources.

## File Structure

### Current Files
- `sahayi.json` - **OLD FORMAT** (currently in use, flat array structure)
- `sahayi-new.json` - **NEW FORMAT** (recommended, organized by department/semester)

## New JSON Structure

### Top-Level Structure
```json
{
  "departments": [...],
  "semesters": [...],
  "notes": {...},
  "scholarships": [...]
}
```

### 1. Departments
List of all engineering departments with their icons.

```json
"departments": [
  { 
    "id": "cse", 
    "name": "Computer Science & Engineering", 
    "icon": "bi-laptop" 
  },
  ...
]
```

### 2. Semesters
Array of all available semesters.

```json
"semesters": ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]
```

### 3. Notes (Organized by Department → Semester)
**This is the key improvement!** Notes are now organized hierarchically:

```json
"notes": {
  "cse": {
    "S1": [
      {
        "id": "s1-cse-math1",
        "title": "Mathematics for Information Science-1",
        "gdrive_url": "https://drive.google.com/drive/folders/..."
      },
      ...
    ],
    "S2": [...],
    ...
  },
  "it": {
    "S1": [...],
    ...
  },
  ...
}
```

### 4. Scholarships (Flat Array)
Scholarships are general and not department-specific.

```json
"scholarships": [
  {
    "id": "scholarship-merit",
    "title": "Merit Scholarship",
    "description": "For students with excellent academic performance",
    "link": "https://gecp.ac.in/scholarships/merit"
  },
  ...
]
```

## How to Add/Modify Resources

### Adding a New Note

**Example: Add a new note for CSE S3**

1. Open `sahayi-new.json`
2. Navigate to: `notes` → `cse` → `S3`
3. Add your new note object:

```json
"notes": {
  "cse": {
    "S3": [
      {
        "id": "s3-cse-data-structures",
        "title": "Data Structures",
        "gdrive_url": "https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
      }
    ]
  }
}
```

### Adding Notes for a New Semester

**Example: Add S2 notes for IT department**

```json
"notes": {
  "it": {
    "S1": [...existing S1 notes...],
    "S2": [
      {
        "id": "s2-it-discrete-math",
        "title": "Discrete Mathematics",
        "gdrive_url": "https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
      },
      {
        "id": "s2-it-oop",
        "title": "Object Oriented Programming",
        "gdrive_url": "https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
      }
    ]
  }
}
```

### Adding a New Department

1. Add department to `departments` array:
```json
"departments": [
  ...existing departments...,
  { 
    "id": "ai", 
    "name": "Artificial Intelligence", 
    "icon": "bi-robot" 
  }
]
```

2. Add notes structure:
```json
"notes": {
  ...existing departments...,
  "ai": {
    "S1": [
      {
        "id": "s1-ai-intro",
        "title": "Introduction to AI",
        "gdrive_url": "https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
      }
    ]
  }
}
```

### Adding a Scholarship

```json
"scholarships": [
  ...existing scholarships...,
  {
    "id": "scholarship-women",
    "title": "Women in Engineering Scholarship",
    "description": "Scholarship for female engineering students",
    "link": "https://example.com/women-scholarship"
  }
]
```

## Benefits of New Structure

### ✅ Easy Navigation
- **Old**: Scroll through 200+ lines to find CSE S3 notes
- **New**: Go directly to `notes.cse.S3`

### ✅ Clear Organization
- All notes for a department/semester are grouped together
- No need to search through a flat array

### ✅ Beginner-Friendly
- Intuitive hierarchy: Department → Semester → Notes
- Easy to understand and modify

### ✅ Scalability
- Adding new semesters or departments is straightforward
- Structure remains clean even with 1000+ notes

## Migration Guide

### When Ready to Use New Structure

1. **Update JavaScript code** in `notes.html` to use the new structure:

```javascript
// OLD CODE (flat array)
const resources = allData.resources.notes.filter(r =>
  r.department === deptId && r.semester === semester
);

// NEW CODE (hierarchical)
const resources = allData.notes[deptId]?.[semester] || [];
```

2. **Rename files**:
```bash
# Backup old file
mv sahayi.json sahayi-old.json

# Use new file
mv sahayi-new.json sahayi.json
```

3. **Test thoroughly** on all pages:
   - Notes page
   - Question Papers page (when released)
   - Scholarships page

## Question Papers (Coming Soon)

When ready to release question papers:

1. **Add to JSON** (same structure as notes):
```json
{
  "qnpapers": {
    "cse": {
      "S1": [
        {
          "id": "s1-cse-qp-2023",
          "title": "S1 CSE Question Papers 2023",
          "gdrive_url": "https://drive.google.com/drive/folders/..."
        }
      ]
    }
  }
}
```

2. **Uncomment code** in `qnpapers.html`:
   - Find the commented section starting with `/* ========================================`
   - Uncomment all the code
   - Comment out the "Coming Soon" display code

3. **Update fetch logic** to use new structure

## Tips for Developers

### 🔍 Finding Specific Notes
- **Department**: `notes.cse`
- **Semester**: `notes.cse.S3`
- **All notes for dept/sem**: `notes.cse.S3` (array)

### ✏️ Editing Notes
1. Find the department and semester
2. Locate the note by its `id` or `title`
3. Update the `gdrive_url` or other fields

### ➕ Adding Bulk Notes
Use a code editor with JSON formatting (VS Code, Sublime Text) to:
1. Copy an existing note object
2. Paste and modify for each new note
3. Format the JSON (Ctrl+Shift+I in VS Code)

## Common Issues

### Issue: JSON Syntax Error
**Cause**: Missing comma, extra comma, or invalid JSON
**Solution**: Use a JSON validator (jsonlint.com) or VS Code's built-in validator

### Issue: Notes Not Showing
**Cause**: Wrong department ID or semester name
**Solution**: Check that `id` in departments matches the key in `notes` object

### Issue: Duplicate IDs
**Cause**: Two notes have the same `id`
**Solution**: Ensure each note has a unique `id` (format: `s{semester}-{dept}-{subject}`)

## Contact

For questions or issues with the JSON structure, contact the SFI GECP web development team.

---
**Last Updated**: December 2025
**Version**: 2.0 (Hierarchical Structure)
