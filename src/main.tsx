import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/appStyles';
import {LocaleProvider} from './lib/locale';
import {AccessibilityProvider} from './lib/accessibility';
import FailureBoundary from './components/FailureBoundary';
import {setupDemoOfflineShell} from './lib/demoOfflineShell';
// Final shared design layer: layout rhythm, icon precision and accessible micro-interactions.
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><FailureBoundary><LocaleProvider><AccessibilityProvider><App /></AccessibilityProvider></LocaleProvider></FailureBoundary></React.StrictMode>);

// Public demo cache only. Does not enable clinical offline writes or background sync.
void setupDemoOfflineShell();
