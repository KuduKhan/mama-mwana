// The product experience and independent clinical release approval are separate.
// SemVer is sourced exclusively from package.json, never from a migration label.
import {version} from '../../package.json';
export const APP_VERSION=version;
export const APP_IS_PREVIEW=version.includes('-');
const [major,minor]=version.split('.');
export const APP_DISPLAY_VERSION='v'+major+'.'+minor+(APP_IS_PREVIEW?' Preview':'');
export const APP_CLINICAL_RELEASE_STATUS='NO_GO' as const;
