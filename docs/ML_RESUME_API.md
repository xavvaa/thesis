# ML Resume API Documentation

This document describes the API endpoints available for the ML Resume collection, which stores a lightweight version of resumes optimized for machine learning tasks.

## Base URL
All endpoints are prefixed with `/api/ml-resumes`

## Authentication
All endpoints require authentication. Include a valid JWT token in the `Authorization` header.

## Endpoints

### Get All ML Resumes (Admin Only)
```
GET /
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "5f8d0f4d7b3f4b3d9c3e5d2f",
      "resumeId": "5f8d0f4d7b3f4b3d9c3e5d2e",
      "jobSeekerUid": "user123",
      "jobSeekerId": "5f8d0f4d7b3f4b3d9c3e5d2d",
      "name": "John Doe",
      "skills": ["JavaScript", "React", "Node.js"],
      "isActive": true,
      "createdAt": "2025-09-24T13:00:00.000Z",
      "updatedAt": "2025-09-24T13:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Search Resumes by Skills
```
GET /search?skills=javascript,react
```

**Query Parameters**
- `skills` (required): Comma-separated list of skills to search for

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "5f8d0f4d7b3f4b3d9c3e5d2f",
      "name": "John Doe",
      "skills": ["JavaScript", "React", "Node.js"]
    }
  ],
  "count": 1,
  "searchedSkills": ["javascript", "react"]
}
```

### Get ML Resume for Job Seeker
```
GET /jobseeker/:uid
```

**Response**
```json
{
  "success": true,
  "data": {
    "_id": "5f8d0f4d7b3f4b3d9c3e5d2f",
    "name": "John Doe",
    "skills": ["JavaScript", "React", "Node.js"],
    "createdAt": "2025-09-24T13:00:00.000Z",
    "updatedAt": "2025-09-24T13:00:00.000Z"
  }
}
```

### Sync All Resumes to ML Collection (Admin Only)
```
POST /sync
```

**Response**
```json
{
  "success": true,
  "message": "Sync completed",
  "syncedCount": 150,
  "totalResumes": 150,
  "errors": []
}
```

### Sync Specific Resume to ML Collection
```
POST /sync/:resumeId
```

**Response**
```json
{
  "success": true,
  "message": "Resume synced successfully",
  "data": {
    "_id": "5f8d0f4d7b3f4b3d9c3e5d2f",
    "name": "John Doe",
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

### Get ML Resume Statistics (Admin Only)
```
GET /stats
```

**Response**
```json
{
  "success": true,
  "data": {
    "totalMLResumes": 150,
    "topSkills": [
      { "_id": "JavaScript", "count": 120 },
      { "_id": "React", "count": 95 },
      { "_id": "Node.js", "count": 80 }
    ]
  }
}
```

## Models

### MLResume
```typescript
interface MLResume {
  _id: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;  // Reference to original resume
  jobSeekerUid: string;               // Firebase UID of job seeker
  jobSeekerId: mongoose.Types.ObjectId; // Reference to JobSeeker
  name: string;                       // Full name from resume
  skills: string[];                   // Array of skills
  isActive: boolean;                  // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage Notes

1. The ML Resume collection is automatically synced when a resume is created or updated.
2. For bulk syncing of existing resumes, use the sync script:
   ```bash
   node scripts/syncResumesToML.js
   ```
3. The collection is optimized for fast skill-based searches and ML processing.
4. All sensitive information is excluded from this collection.
