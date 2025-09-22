# PESO Frontend - Enhanced Dashboard System

A modern, user-friendly job portal frontend built with React and TypeScript, featuring enhanced dashboards with OCR resume processing capabilities.

## ✨ New Features & Improvements

### 🎨 Enhanced Dashboard Design
- **Modern UI/UX**: Cohesive design system matching the existing PESO branding
- **Responsive Layout**: Mobile-first approach with smooth animations
- **Visual Hierarchy**: Improved typography, spacing, and color schemes
- **Interactive Elements**: Hover effects, transitions, and micro-interactions

### 🔍 OCR Resume Processing
- **Tesseract.js Integration**: Advanced OCR technology for PDF resume parsing
- **PDF.js Support**: Robust PDF handling and conversion
- **Smart Data Extraction**: Automatic parsing of personal info, skills, experience, and education
- **Progress Tracking**: Real-time processing status with user feedback

### 🚀 Dashboard Enhancements

#### Employer Dashboard
- **Enhanced Job Management**: Better job posting overview with urgency indicators
- **Applicant Tracking**: Priority-based applicant management system
- **Performance Metrics**: Visual statistics and trend indicators
- **Improved Navigation**: Streamlined sidebar with better visual hierarchy

#### Job Seeker Dashboard
- **Resume Upload**: Drag-and-drop resume upload with OCR processing
- **Smart Job Matching**: AI-powered job recommendations based on parsed resume
- **Profile Management**: Enhanced profile editing and verification
- **Application Tracking**: Better application status management

### 🎯 Key Improvements Made

1. **Visual Consistency**
   - Unified color scheme (blue-based primary colors)
   - Consistent spacing and typography
   - Enhanced shadows and gradients
   - Better icon integration

2. **User Experience**
   - Smooth animations and transitions
   - Improved mobile responsiveness
   - Better error handling and feedback
   - Enhanced accessibility

3. **Functionality**
   - Proper logout functionality
   - OCR resume processing
   - Better data visualization
   - Improved search and filtering

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS Modules with enhanced design system
- **OCR**: Tesseract.js for text recognition
- **PDF Processing**: PDF.js for document handling
- **Icons**: React Icons (Feather icons)
- **State Management**: React hooks and local storage

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm start
```

### Build
```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── ResumeUpload.tsx # OCR resume upload component
│   ├── pages/
│   │   ├── auth/           # Authentication pages
│   │   ├── employer/       # Employer dashboard
│   │   └── jobseeker/      # Job seeker dashboard
│   ├── utils/
│   │   ├── ocrService.ts   # OCR processing service
│   │   └── resumeParser.ts # Resume parsing utilities
│   └── layouts/            # Layout components
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#1e40af, #3b82f6)
- **Success**: Green (#10b981, #059669)
- **Warning**: Orange (#f59e0b, #d97706)
- **Error**: Red (#ef4444, #dc2626)
- **Neutral**: Gray scale (#f8fafc to #1f2937)

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Headings**: Bold weights (700-800)
- **Body**: Regular weight (400-500)

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Common Spacings**: 1rem, 1.5rem, 2rem, 2.5rem

## 🔧 OCR Configuration

The OCR service is configured for optimal performance:

- **Language Support**: English (eng)
- **Page Segmentation**: Auto mode for best results
- **Confidence Threshold**: Configurable quality metrics
- **File Size Limit**: 10MB maximum for optimal processing
- **Supported Formats**: PDF only

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 768px, 1024px, 1200px
- **Touch Friendly**: Optimized touch targets and gestures
- **Progressive Enhancement**: Core functionality works on all devices

## 🚀 Performance Features

- **Lazy Loading**: Components load on demand
- **Optimized Images**: WebP support with fallbacks
- **CSS Optimization**: Minimal CSS with efficient selectors
- **Bundle Splitting**: Code splitting for better performance

## 🔒 Security Features

- **Input Validation**: File type and size validation
- **XSS Protection**: Sanitized user inputs
- **Secure Storage**: Local storage with proper cleanup
- **Authentication**: Proper session management

## 📈 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] PWA capabilities
- [ ] Advanced search filters
- [ ] Resume comparison tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the PESO thesis project and is for educational purposes.

## 🆘 Support

For support or questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for the PESO project**
